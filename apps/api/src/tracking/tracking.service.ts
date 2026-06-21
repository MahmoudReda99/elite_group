import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackingEventDto, CreateTrackingRecordDto, UpdateTrackingRecordDto } from './dto';

@Injectable()
export class TrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  publicLookup(trackingNumber: string) {
    return this.prisma.trackingRecord.findFirst({
      where: { trackingNumber, published: true },
      include: { events: { orderBy: { eventDate: 'asc' } } }
    });
  }

  findAll() {
    return this.prisma.trackingRecord.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { events: { orderBy: { eventDate: 'desc' } } }
    });
  }

  async create(dto: CreateTrackingRecordDto, actorId: string) {
    const record = await this.prisma.trackingRecord.create({ data: dto });
    await this.audit.log({
      userId: actorId,
      action: 'CREATE_TRACKING_RECORD',
      entityType: 'TrackingRecord',
      entityId: record.id,
      metadataJson: { trackingNumber: record.trackingNumber, published: record.published }
    });
    return record;
  }

  async update(id: string, dto: UpdateTrackingRecordDto, actorId: string) {
    await this.ensureRecord(id);
    const record = await this.prisma.trackingRecord.update({
      where: { id },
      data: dto,
      include: { events: { orderBy: { eventDate: 'desc' } } }
    });

    await this.audit.log({
      userId: actorId,
      action: 'UPDATE_TRACKING_RECORD',
      entityType: 'TrackingRecord',
      entityId: id,
      metadataJson: { changedFields: Object.keys(dto), published: record.published }
    });

    return record;
  }

  async addEvent(recordId: string, dto: CreateTrackingEventDto, actorId: string) {
    await this.ensureRecord(recordId);

    const event = await this.prisma.trackingEvent.create({
      data: {
        ...dto,
        trackingRecordId: recordId
      }
    });

    await this.prisma.trackingRecord.update({
      where: { id: recordId },
      data: { currentStatus: dto.status }
    });

    await this.audit.log({
      userId: actorId,
      action: 'ADD_TRACKING_EVENT',
      entityType: 'TrackingRecord',
      entityId: recordId,
      metadataJson: { status: dto.status, location: dto.location }
    });

    return event;
  }

  private async ensureRecord(id: string) {
    const record = await this.prisma.trackingRecord.findUnique({ where: { id }, select: { id: true } });
    if (!record) {
      throw new NotFoundException('Tracking record not found');
    }
  }
}
