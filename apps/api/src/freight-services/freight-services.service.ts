import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FreightStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFreightServiceDto, FreightServiceQueryDto, UpdateFreightServiceDto } from './dto';

@Injectable()
export class FreightServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  findPublic(query: FreightServiceQueryDto) {
    return this.prisma.freightService.findMany({
      where: this.buildWhere(query, FreightStatus.PUBLISHED),
      orderBy: [{ scheduleMonth: 'asc' }, { etd: 'asc' }]
    });
  }

  findAll(query: FreightServiceQueryDto) {
    return this.prisma.freightService.findMany({
      where: this.buildWhere(query, query.status),
      orderBy: [{ scheduleMonth: 'desc' }, { createdAt: 'desc' }],
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async create(dto: CreateFreightServiceDto, actorId: string) {
    await this.ensureActiveContainerType(dto.containerType);

    const service = await this.prisma.freightService.create({
      data: {
        ...dto,
        oceanFreight: new Prisma.Decimal(dto.oceanFreight),
        thc: new Prisma.Decimal(dto.thc),
        status: dto.status ?? FreightStatus.DRAFT,
        createdById: actorId,
        updatedById: actorId
      }
    });

    await this.audit.log({
      userId: actorId,
      action: service.status === FreightStatus.PUBLISHED ? 'CREATE_AND_PUBLISH_FREIGHT_SERVICE' : 'CREATE_FREIGHT_SERVICE',
      entityType: 'FreightService',
      entityId: service.id,
      metadataJson: { title: service.title, status: service.status }
    });

    return service;
  }

  async update(id: string, dto: UpdateFreightServiceDto, actorId: string) {
    await this.ensureExists(id);
    if (dto.containerType !== undefined) {
      await this.ensureActiveContainerType(dto.containerType);
    }

    const service = await this.prisma.freightService.update({
      where: { id },
      data: {
        ...dto,
        oceanFreight: dto.oceanFreight === undefined ? undefined : new Prisma.Decimal(dto.oceanFreight),
        thc: dto.thc === undefined ? undefined : new Prisma.Decimal(dto.thc),
        updatedById: actorId
      }
    });

    await this.audit.log({
      userId: actorId,
      action: dto.status === FreightStatus.PUBLISHED ? 'PUBLISH_FREIGHT_SERVICE' : 'UPDATE_FREIGHT_SERVICE',
      entityType: 'FreightService',
      entityId: service.id,
      metadataJson: { changedFields: Object.keys(dto), status: service.status }
    });

    return service;
  }

  async archive(id: string, actorId: string) {
    await this.ensureExists(id);

    const service = await this.prisma.freightService.update({
      where: { id },
      data: { status: FreightStatus.ARCHIVED, updatedById: actorId }
    });

    await this.audit.log({
      userId: actorId,
      action: 'ARCHIVE_FREIGHT_SERVICE',
      entityType: 'FreightService',
      entityId: id,
      metadataJson: { title: service.title }
    });

    return service;
  }

  listContainers() {
    return this.prisma.containerType.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
  }

  listCategories() {
    return this.prisma.serviceCategory.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
  }

  private buildWhere(query: FreightServiceQueryDto, status?: FreightStatus): Prisma.FreightServiceWhereInput {
    return {
      status,
      scheduleMonth: query.month,
      destinationCountry: query.destination
        ? { contains: query.destination, mode: 'insensitive' }
        : undefined,
      cargoType: query.cargoType ? { contains: query.cargoType, mode: 'insensitive' } : undefined,
      containerType: query.containerType ? { contains: query.containerType, mode: 'insensitive' } : undefined
    };
  }

  private async ensureExists(id: string) {
    const service = await this.prisma.freightService.findUnique({ where: { id }, select: { id: true } });

    if (!service) {
      throw new NotFoundException('Freight service not found');
    }
  }

  private async ensureActiveContainerType(containerType: string) {
    const exists = await this.prisma.containerType.findFirst({
      where: { name: containerType, active: true },
      select: { id: true }
    });

    if (!exists) {
      throw new BadRequestException('Container type must be one of the active standard container types');
    }
  }
}
