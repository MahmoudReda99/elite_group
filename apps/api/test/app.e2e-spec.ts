import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Elite Group API', () => {
  let app: INestApplication;
  let prisma: any;
  let adminPasswordHash: string;
  let operatorPasswordHash: string;

  const adminUser = {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@elitegroup.local',
    role: 'ADMIN',
    active: true
  };
  const operatorUser = {
    id: 'operator-1',
    name: 'Operator',
    email: 'operator@elitegroup.local',
    role: 'OPERATOR',
    active: true
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    adminPasswordHash = await argon2.hash('Elite@2026!');
    operatorPasswordHash = await argon2.hash('Elite@2026!');

    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([adminUser, operatorUser]),
        create: jest.fn(),
        update: jest.fn()
      },
      freightService: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn()
      },
      trackingRecord: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
      },
      trackingEvent: {
        create: jest.fn()
      },
      contactMessage: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn()
      },
      quoteRequest: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
        findMany: jest.fn()
      },
      containerType: {
        findMany: jest.fn(),
        findFirst: jest.fn().mockResolvedValue({ id: 'container-type-1' })
      },
      containerCatalogItem: {
        findMany: jest.fn(),
        findFirst: jest.fn()
      },
      serviceCategory: {
        findMany: jest.fn()
      },
      $connect: jest.fn(),
      $disconnect: jest.fn()
    };

    prisma.user.findUnique.mockImplementation(({ where }: { where: { email?: string; id?: string } }) => {
      if (where.email === adminUser.email || where.id === adminUser.id) {
        return Promise.resolve({ ...adminUser, passwordHash: adminPasswordHash });
      }
      if (where.email === operatorUser.email || where.id === operatorUser.id) {
        return Promise.resolve({ ...operatorUser, passwordHash: operatorPasswordHash });
      }
      return Promise.resolve(null);
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function tokenFor(email: string) {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'Elite@2026!' })
      .expect(201);

    return response.body.accessToken as string;
  }

  it('authenticates seeded admin and operator users', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: 'Elite@2026!' })
      .expect(201);

    expect(response.body.user.email).toBe(adminUser.email);
    expect(response.body.accessToken).toEqual(expect.any(String));
  });

  it('blocks visitors from protected freight service writes', async () => {
    await request(app.getHttpServer()).post('/api/freight-services').send({}).expect(401);
  });

  it('prevents operators from accessing admin user management', async () => {
    const operatorToken = await tokenFor(operatorUser.email);

    await request(app.getHttpServer())
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${operatorToken}`)
      .expect(403);
  });

  it('allows operators to create and publish freight services', async () => {
    const operatorToken = await tokenFor(operatorUser.email);
    const payload = {
      title: 'Jebel Ali to Nhava Sheva',
      originCountry: 'United Arab Emirates',
      originPort: 'Jebel Ali',
      destinationCountry: 'India',
      destinationPort: 'Nhava Sheva',
      tradeLane: 'Middle East - India',
      cargoType: 'Reefer Cargo',
      containerType: 'Reefer Container',
      vesselName: 'Elite Horizon',
      voyageNumber: 'EH2606W',
      etd: '2026-07-05',
      eta: '2026-07-11',
      scheduleMonth: '2026-07',
      validFrom: '2026-07-01',
      validTo: '2026-07-31',
      oceanFreight: 1250,
      thc: 185,
      currency: 'USD',
      status: 'DRAFT'
    };

    prisma.freightService.create.mockResolvedValue({ id: 'service-1', ...payload, status: 'DRAFT' });
    prisma.freightService.findUnique.mockResolvedValue({ id: 'service-1' });
    prisma.freightService.update.mockResolvedValue({ id: 'service-1', ...payload, status: 'PUBLISHED' });

    await request(app.getHttpServer())
      .post('/api/freight-services')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send(payload)
      .expect(201);

    const publishResponse = await request(app.getHttpServer())
      .patch('/api/freight-services/service-1')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ status: 'PUBLISHED' })
      .expect(200);

    expect(publishResponse.body.status).toBe('PUBLISHED');
  });

  it('returns only public freight service schedules from the public endpoint', async () => {
    prisma.freightService.findMany.mockResolvedValue([{ id: 'published-1', status: 'PUBLISHED' }]);

    const response = await request(app.getHttpServer()).get('/api/public/freight-services?month=2026-07').expect(200);

    expect(response.body).toHaveLength(1);
    expect(prisma.freightService.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PUBLISHED', scheduleMonth: '2026-07' })
      })
    );
  });

  it('returns active container catalogue items from the public read-only endpoint', async () => {
    prisma.containerCatalogItem.findMany.mockResolvedValue([
      { id: 'catalog-1', slug: '20-standard-dry', group: 'DRY', active: true, sortOrder: 10 }
    ]);

    const response = await request(app.getHttpServer()).get('/api/public/container-catalog').expect(200);

    expect(response.body).toHaveLength(1);
    expect(prisma.containerCatalogItem.findMany).toHaveBeenCalledWith({
      where: { active: true },
      orderBy: [{ categorySlug: 'asc' }, { subgroupSortOrder: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }]
    });
  });

  it('returns one active container catalogue item by slug and 404s missing items', async () => {
    prisma.containerCatalogItem.findFirst.mockResolvedValueOnce({
      id: 'catalog-1',
      slug: '40-high-cube-dry',
      active: true
    });

    await request(app.getHttpServer()).get('/api/public/container-catalog/40-high-cube-dry').expect(200);

    expect(prisma.containerCatalogItem.findFirst).toHaveBeenCalledWith({
      where: { slug: '40-high-cube-dry', active: true }
    });

    prisma.containerCatalogItem.findFirst.mockResolvedValueOnce(null);
    await request(app.getHttpServer()).get('/api/public/container-catalog/missing').expect(404);
  });

  it('does not expose the container catalogue through the admin database editor', async () => {
    const adminToken = await tokenFor(adminUser.email);
    prisma.containerType.findMany.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/api/admin/database/tables')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.some((table: { key: string }) => table.key.includes('container-catalog'))).toBe(false);

    await request(app.getHttpServer())
      .post('/api/admin/database/container-catalog-items/rows')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(404);
  });

  it('looks up published tracking records and hides private references', async () => {
    prisma.trackingRecord.findFirst.mockResolvedValueOnce({
      id: 'tracking-1',
      trackingNumber: 'ELT-2026-0001',
      published: true,
      events: []
    });

    await request(app.getHttpServer()).get('/api/public/tracking/ELT-2026-0001').expect(200);

    prisma.trackingRecord.findFirst.mockResolvedValueOnce(null);
    await request(app.getHttpServer()).get('/api/public/tracking/ELT-PRIVATE-0002').expect(404);
  });

  it('accepts visitor contact and quote requests', async () => {
    prisma.contactMessage.create.mockResolvedValue({ id: 'contact-1' });
    prisma.quoteRequest.create.mockResolvedValue({ id: 'quote-1' });

    await request(app.getHttpServer())
      .post('/api/public/contact-messages')
      .send({ name: 'Visitor', email: 'visitor@example.com', message: 'Need ocean freight support.' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/public/quote-requests')
      .send({
        name: 'Visitor',
        email: 'visitor@example.com',
        originPort: 'Jebel Ali',
        destinationPort: 'Nhava Sheva',
        cargoType: 'Reefer Cargo',
        containerType: 'Reefer Container'
      })
      .expect(201);
  });
});
