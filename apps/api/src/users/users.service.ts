import { Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: safeUserSelect
    });
  }

  async create(dto: CreateUserDto, actorId: string) {
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash: await argon2.hash(dto.password),
        role: dto.role,
        active: dto.active ?? true
      },
      select: safeUserSelect
    });

    await this.audit.log({
      userId: actorId,
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: user.id,
      metadataJson: { email: user.email, role: user.role }
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto, actorId: string) {
    await this.ensureExists(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email?.toLowerCase(),
        passwordHash: dto.password ? await argon2.hash(dto.password) : undefined,
        role: dto.role,
        active: dto.active
      },
      select: safeUserSelect
    });

    await this.audit.log({
      userId: actorId,
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: id,
      metadataJson: { changedFields: Object.keys(dto) }
    });

    return user;
  }

  async setActive(id: string, active: boolean, actorId: string) {
    await this.ensureExists(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { active },
      select: safeUserSelect
    });

    await this.audit.log({
      userId: actorId,
      action: active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      entityType: 'User',
      entityId: id,
      metadataJson: { active }
    });

    return user;
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('User not found');
    }
  }
}
