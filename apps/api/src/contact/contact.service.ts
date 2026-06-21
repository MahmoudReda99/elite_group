import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactMessageDto, UpdateContactStatusDto } from './dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  companyProfile() {
    return this.prisma.companyProfile.findFirst({
      where: { active: true },
      orderBy: { updatedAt: 'desc' }
    });
  }

  create(dto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({ data: dto });
  }

  findAll() {
    return this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateStatus(id: string, dto: UpdateContactStatusDto, actorId: string) {
    const message = await this.prisma.contactMessage.update({ where: { id }, data: { status: dto.status } });
    await this.audit.log({
      userId: actorId,
      action: 'UPDATE_CONTACT_MESSAGE_STATUS',
      entityType: 'ContactMessage',
      entityId: id,
      metadataJson: { status: dto.status }
    });
    return message;
  }
}
