import { PrismaClient, FreightStatus, TrackingStatus, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
const demoPassword = 'Elite@2026!';

async function main() {
  const passwordHash = await argon2.hash(demoPassword);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@elitegroup.local' },
    update: { passwordHash, active: true, role: UserRole.ADMIN },
    create: {
      name: 'Elite Group Admin',
      email: 'admin@elitegroup.local',
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@elitegroup.local' },
    update: { passwordHash, active: true, role: UserRole.OPERATOR },
    create: {
      name: 'Elite Group Operator',
      email: 'operator@elitegroup.local',
      passwordHash,
      role: UserRole.OPERATOR
    }
  });

  const standardContainerTypes = [
    { name: '20FT Standard Dry', description: 'Standard 20FT dry container for general cargo.', capacityInfo: '20GP' },
    { name: '40FT Standard Dry', description: 'Standard 40FT dry container for general cargo.', capacityInfo: '40GP' },
    { name: '40FT High Cube', description: 'High-cube 40FT dry container for taller general cargo.', capacityInfo: '40HC' },
    { name: '20FT Reefer', description: 'Temperature-controlled 20FT reefer container.', capacityInfo: '20RF' },
    { name: '40FT Reefer High Cube', description: 'Temperature-controlled 40FT high-cube reefer container.', capacityInfo: '40RH' },
    { name: '20FT Open Top', description: '20FT open-top container for top-loaded cargo.', capacityInfo: '20OT' },
    { name: '40FT Open Top', description: '40FT open-top container for top-loaded cargo.', capacityInfo: '40OT' },
    { name: '20FT Flat Rack', description: '20FT flat-rack equipment for heavy or oversized cargo.', capacityInfo: '20FR' },
    { name: '40FT Flat Rack', description: '40FT flat-rack equipment for heavy or oversized cargo.', capacityInfo: '40FR' },
    { name: '20FT Tank Container', description: 'ISO tank container for liquid cargo.', capacityInfo: '20TK' }
  ];

  await prisma.containerType.updateMany({
    where: {
      name: {
        in: ['Dry Container', 'Reefer Container', 'Open Top', 'Flat Rack', 'Tank / Special Equipment']
      }
    },
    data: { active: false }
  });

  for (const container of standardContainerTypes) {
    await prisma.containerType.upsert({
      where: { name: container.name },
      update: { ...container, active: true },
      create: container
    });
  }

  await prisma.serviceCategory.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Reefer Cargo', slug: 'reefer-cargo', description: 'Cold chain handling for temperature-sensitive cargo.' },
      { name: 'Special Cargo', slug: 'special-cargo', description: 'Project cargo and non-standard logistics coordination.' },
      { name: 'Dangerous Goods', slug: 'dangerous-goods', description: 'Compliant handling for regulated hazardous cargo.' },
      { name: 'Ocean Freight', slug: 'ocean-freight', description: 'FCL and LCL ocean freight solutions.' },
      { name: 'Inland Transportation', slug: 'inland-transportation', description: 'Truck and intermodal movements across the Middle East.' },
      { name: 'Customs / Logistics Support', slug: 'customs-logistics-support', description: 'Documentation, customs coordination, and cargo support.' }
    ]
  });

  await prisma.companyProfile.upsert({
    where: { id: 'company-profile' },
    update: {
      name: 'Elite Group logistics desk',
      email: 'operations@elitegroup.local',
      phone: '+20 1115456274',
      address: 'cairo street 90',
      description: 'Shipping, supply, and freight support for regional operations.',
      active: true
    },
    create: {
      id: 'company-profile',
      name: 'Elite Group logistics desk',
      email: 'operations@elitegroup.local',
      phone: '+20 1115456274',
      address: 'cairo street 90',
      description: 'Shipping, supply, and freight support for regional operations.'
    }
  });

  const services = [
    {
      title: 'Jebel Ali to Nhava Sheva Reefer Express',
      originCountry: 'United Arab Emirates',
      originPort: 'Jebel Ali',
      destinationCountry: 'India',
      destinationPort: 'Nhava Sheva',
      tradeLane: 'Middle East - India',
      cargoType: 'Reefer Cargo',
      containerType: '40FT Reefer High Cube',
      vesselName: 'Elite Horizon',
      voyageNumber: 'EH2606W',
      etd: new Date('2026-07-05T08:00:00.000Z'),
      eta: new Date('2026-07-11T08:00:00.000Z'),
      scheduleMonth: '2026-07',
      validFrom: new Date('2026-07-01T00:00:00.000Z'),
      validTo: new Date('2026-07-31T23:59:59.000Z'),
      oceanFreight: '1250.00',
      thc: '185.00',
      currency: 'USD',
      freeTimeNotes: '14 days destination free time subject to carrier approval.',
      remarks: 'Plug-in monitoring available on request.',
      status: FreightStatus.PUBLISHED,
      createdById: operator.id,
      updatedById: operator.id
    },
    {
      title: 'Alexandria to Rotterdam FCL Service',
      originCountry: 'Egypt',
      originPort: 'Alexandria',
      destinationCountry: 'Netherlands',
      destinationPort: 'Rotterdam',
      tradeLane: 'Middle East - Europe',
      cargoType: 'General Cargo',
      containerType: '40FT Standard Dry',
      vesselName: 'Mediterranean Star',
      voyageNumber: 'MS174E',
      etd: new Date('2026-07-12T10:00:00.000Z'),
      eta: new Date('2026-07-22T10:00:00.000Z'),
      scheduleMonth: '2026-07',
      validFrom: new Date('2026-07-01T00:00:00.000Z'),
      validTo: new Date('2026-07-31T23:59:59.000Z'),
      oceanFreight: '980.00',
      thc: '210.00',
      currency: 'USD',
      freeTimeNotes: '7 days origin and 10 days destination free time.',
      remarks: 'Subject to space and equipment availability.',
      status: FreightStatus.PUBLISHED,
      createdById: admin.id,
      updatedById: admin.id
    },
    {
      title: 'Dammam to Aqaba Special Equipment',
      originCountry: 'Saudi Arabia',
      originPort: 'Dammam',
      destinationCountry: 'Jordan',
      destinationPort: 'Aqaba',
      tradeLane: 'Middle East Inland & Ocean',
      cargoType: 'Special Cargo',
      containerType: '40FT Flat Rack',
      vesselName: 'Gulf Bridge',
      voyageNumber: 'GB900S',
      etd: new Date('2026-08-02T09:00:00.000Z'),
      eta: new Date('2026-08-06T09:00:00.000Z'),
      scheduleMonth: '2026-08',
      validFrom: new Date('2026-08-01T00:00:00.000Z'),
      validTo: new Date('2026-08-31T23:59:59.000Z'),
      oceanFreight: '1425.00',
      thc: '260.00',
      currency: 'USD',
      freeTimeNotes: 'Demurrage terms to be confirmed case by case.',
      remarks: 'Draft lane for operator review.',
      status: FreightStatus.DRAFT,
      createdById: operator.id,
      updatedById: operator.id
    }
  ];

  for (const service of services) {
    const existingService = await prisma.freightService.findFirst({
      where: { title: service.title }
    });

    if (existingService) {
      await prisma.freightService.update({
        where: { id: existingService.id },
        data: service
      });
    } else {
      await prisma.freightService.create({ data: service });
    }
  }

  const tracking = await prisma.trackingRecord.upsert({
    where: { trackingNumber: 'ELT-2026-0001' },
    update: {},
    create: {
      trackingNumber: 'ELT-2026-0001',
      customerName: 'Demo Customer',
      originPort: 'Jebel Ali',
      destinationPort: 'Nhava Sheva',
      vesselName: 'Elite Horizon',
      voyageNumber: 'EH2606W',
      currentStatus: TrackingStatus.DEPARTED,
      published: true,
      events: {
        create: [
          {
            status: TrackingStatus.BOOKING_RECEIVED,
            location: 'Dubai',
            eventDate: new Date('2026-07-01T09:00:00.000Z'),
            notes: 'Booking confirmed by Elite Group operations.'
          },
          {
            status: TrackingStatus.DEPARTED,
            location: 'Jebel Ali',
            eventDate: new Date('2026-07-05T14:00:00.000Z'),
            notes: 'Cargo departed on scheduled vessel.'
          }
        ]
      }
    }
  });

  await prisma.trackingRecord.upsert({
    where: { trackingNumber: 'ELT-PRIVATE-0002' },
    update: {},
    create: {
      trackingNumber: 'ELT-PRIVATE-0002',
      customerName: 'Private Demo Customer',
      originPort: 'Alexandria',
      destinationPort: 'Rotterdam',
      currentStatus: TrackingStatus.VESSEL_SCHEDULED,
      published: false
    }
  });

  const existingSeedAudit = await prisma.auditLog.findFirst({
    where: {
      action: 'SEED_DATABASE',
      entityType: 'System',
      entityId: tracking.id
    }
  });

  if (!existingSeedAudit) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'SEED_DATABASE',
        entityType: 'System',
        entityId: tracking.id,
        metadataJson: { demoUsers: ['admin@elitegroup.local', 'operator@elitegroup.local'] }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
