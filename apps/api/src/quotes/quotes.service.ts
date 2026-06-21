import { BadRequestException, Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteRequestDto, UpdateQuoteStatusDto } from './dto';

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async create(dto: CreateQuoteRequestDto) {
    await this.ensureActiveContainerType(dto.containerType);
    return this.prisma.quoteRequest.create({ data: dto });
  }

  findAll() {
    return this.prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateStatus(id: string, dto: UpdateQuoteStatusDto, actorId: string) {
    const quote = await this.prisma.quoteRequest.update({ where: { id }, data: { status: dto.status } });
    await this.audit.log({
      userId: actorId,
      action: 'UPDATE_QUOTE_REQUEST_STATUS',
      entityType: 'QuoteRequest',
      entityId: id,
      metadataJson: { status: dto.status }
    });
    return quote;
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
