import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(input: {
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadataJson?: Prisma.InputJsonValue;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadataJson: input.metadataJson
      }
    });
  }

  findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }
}
