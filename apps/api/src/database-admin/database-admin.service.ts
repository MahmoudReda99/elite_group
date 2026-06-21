import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'json';

type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  enumValues?: string[];
};

type TableConfig = {
  key: string;
  label: string;
  delegate: keyof PrismaService;
  orderBy?: Record<string, 'asc' | 'desc'>;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  fields: FieldConfig[];
};

const freightStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const trackingStatuses = [
  'BOOKING_RECEIVED',
  'VESSEL_SCHEDULED',
  'DEPARTED',
  'TRANSSHIPMENT',
  'ARRIVED',
  'CUSTOMS_CLEARANCE',
  'DELIVERED'
];
const messageStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const roles = ['ADMIN', 'OPERATOR'];

const systemFields: FieldConfig[] = [
  { key: 'id', label: 'ID', type: 'string', readOnly: true },
  { key: 'createdAt', label: 'Created at', type: 'date', readOnly: true },
  { key: 'updatedAt', label: 'Updated at', type: 'date', readOnly: true }
];

const tables: TableConfig[] = [
  {
    key: 'users',
    label: 'Users',
    delegate: 'user',
    orderBy: { createdAt: 'desc' },
    create: false,
    delete: false,
    fields: [
      ...systemFields,
      { key: 'name', label: 'Name', type: 'string', required: true },
      { key: 'email', label: 'Email', type: 'string', required: true },
      { key: 'role', label: 'Role', type: 'enum', enumValues: roles, required: true },
      { key: 'active', label: 'Active', type: 'boolean', required: true }
    ]
  },
  {
    key: 'freight-services',
    label: 'Freight Services',
    delegate: 'freightService',
    orderBy: { createdAt: 'desc' },
    fields: [
      ...systemFields,
      { key: 'title', label: 'Title', type: 'string', required: true },
      { key: 'originCountry', label: 'Origin country', type: 'string', required: true },
      { key: 'originPort', label: 'Origin port', type: 'string', required: true },
      { key: 'destinationCountry', label: 'Destination country', type: 'string', required: true },
      { key: 'destinationPort', label: 'Destination port', type: 'string', required: true },
      { key: 'tradeLane', label: 'Trade lane', type: 'string', required: true },
      { key: 'cargoType', label: 'Cargo type', type: 'string', required: true },
      { key: 'containerType', label: 'Container type', type: 'enum', enumValues: [], required: true },
      { key: 'vesselName', label: 'Vessel', type: 'string', required: true },
      { key: 'voyageNumber', label: 'Voyage', type: 'string', required: true },
      { key: 'etd', label: 'ETD', type: 'date', required: true },
      { key: 'eta', label: 'ETA', type: 'date', required: true },
      { key: 'scheduleMonth', label: 'Schedule month', type: 'string', required: true },
      { key: 'validFrom', label: 'Valid from', type: 'date', required: true },
      { key: 'validTo', label: 'Valid to', type: 'date', required: true },
      { key: 'oceanFreight', label: 'Ocean freight', type: 'number', required: true },
      { key: 'thc', label: 'THC', type: 'number', required: true },
      { key: 'currency', label: 'Currency', type: 'string', required: true },
      { key: 'freeTimeNotes', label: 'Free time notes', type: 'string', multiline: true },
      { key: 'remarks', label: 'Remarks', type: 'string', multiline: true },
      { key: 'status', label: 'Status', type: 'enum', enumValues: freightStatuses, required: true },
      { key: 'createdById', label: 'Created by ID', type: 'string' },
      { key: 'updatedById', label: 'Updated by ID', type: 'string' }
    ]
  },
  {
    key: 'tracking-records',
    label: 'Tracking Records',
    delegate: 'trackingRecord',
    orderBy: { createdAt: 'desc' },
    fields: [
      ...systemFields,
      { key: 'trackingNumber', label: 'Tracking number', type: 'string', required: true },
      { key: 'customerName', label: 'Customer name', type: 'string', required: true },
      { key: 'originPort', label: 'Origin port', type: 'string', required: true },
      { key: 'destinationPort', label: 'Destination port', type: 'string', required: true },
      { key: 'vesselName', label: 'Vessel', type: 'string' },
      { key: 'voyageNumber', label: 'Voyage', type: 'string' },
      { key: 'currentStatus', label: 'Current status', type: 'enum', enumValues: trackingStatuses, required: true },
      { key: 'published', label: 'Published', type: 'boolean', required: true }
    ]
  },
  {
    key: 'tracking-events',
    label: 'Tracking Events',
    delegate: 'trackingEvent',
    orderBy: { eventDate: 'desc' },
    fields: [
      { key: 'id', label: 'ID', type: 'string', readOnly: true },
      { key: 'trackingRecordId', label: 'Tracking record ID', type: 'string', required: true },
      { key: 'status', label: 'Status', type: 'enum', enumValues: trackingStatuses, required: true },
      { key: 'location', label: 'Location', type: 'string', required: true },
      { key: 'eventDate', label: 'Event date', type: 'date', required: true },
      { key: 'notes', label: 'Notes', type: 'string', multiline: true }
    ]
  },
  {
    key: 'container-types',
    label: 'Container Types',
    delegate: 'containerType',
    fields: [
      { key: 'id', label: 'ID', type: 'string', readOnly: true },
      { key: 'name', label: 'Name', type: 'string', required: true },
      { key: 'description', label: 'Description', type: 'string', multiline: true, required: true },
      { key: 'capacityInfo', label: 'Capacity info', type: 'string', required: true },
      { key: 'active', label: 'Active', type: 'boolean', required: true }
    ]
  },
  {
    key: 'service-categories',
    label: 'Service Categories',
    delegate: 'serviceCategory',
    fields: [
      { key: 'id', label: 'ID', type: 'string', readOnly: true },
      { key: 'name', label: 'Name', type: 'string', required: true },
      { key: 'slug', label: 'Slug', type: 'string', required: true },
      { key: 'description', label: 'Description', type: 'string', multiline: true, required: true },
      { key: 'active', label: 'Active', type: 'boolean', required: true }
    ]
  },
  {
    key: 'company-profile',
    label: 'Company Profile',
    delegate: 'companyProfile',
    orderBy: { updatedAt: 'desc' },
    create: false,
    delete: false,
    fields: [
      ...systemFields,
      { key: 'name', label: 'Name', type: 'string', required: true },
      { key: 'email', label: 'Email', type: 'string', required: true },
      { key: 'phone', label: 'Phone', type: 'string', required: true },
      { key: 'address', label: 'Address', type: 'string', multiline: true, required: true },
      { key: 'description', label: 'Description', type: 'string', multiline: true },
      { key: 'active', label: 'Active', type: 'boolean', required: true }
    ]
  },
  {
    key: 'contact-messages',
    label: 'Contact Messages',
    delegate: 'contactMessage',
    orderBy: { createdAt: 'desc' },
    fields: [
      { key: 'id', label: 'ID', type: 'string', readOnly: true },
      { key: 'createdAt', label: 'Created at', type: 'date', readOnly: true },
      { key: 'name', label: 'Name', type: 'string', required: true },
      { key: 'email', label: 'Email', type: 'string', required: true },
      { key: 'phone', label: 'Phone', type: 'string' },
      { key: 'company', label: 'Company', type: 'string' },
      { key: 'message', label: 'Message', type: 'string', multiline: true, required: true },
      { key: 'status', label: 'Status', type: 'enum', enumValues: messageStatuses, required: true }
    ]
  },
  {
    key: 'quote-requests',
    label: 'Quote Requests',
    delegate: 'quoteRequest',
    orderBy: { createdAt: 'desc' },
    fields: [
      ...systemFields,
      { key: 'name', label: 'Name', type: 'string', required: true },
      { key: 'email', label: 'Email', type: 'string', required: true },
      { key: 'phone', label: 'Phone', type: 'string' },
      { key: 'company', label: 'Company', type: 'string' },
      { key: 'originPort', label: 'Origin port', type: 'string', required: true },
      { key: 'destinationPort', label: 'Destination port', type: 'string', required: true },
      { key: 'cargoType', label: 'Cargo type', type: 'string', required: true },
      { key: 'containerType', label: 'Container type', type: 'enum', enumValues: [], required: true },
      { key: 'readyDate', label: 'Ready date', type: 'date' },
      { key: 'message', label: 'Message', type: 'string', multiline: true },
      { key: 'status', label: 'Status', type: 'enum', enumValues: messageStatuses, required: true }
    ]
  },
  {
    key: 'audit-logs',
    label: 'Audit Logs',
    delegate: 'auditLog',
    orderBy: { createdAt: 'desc' },
    create: false,
    update: false,
    delete: false,
    fields: [
      { key: 'id', label: 'ID', type: 'string', readOnly: true },
      { key: 'createdAt', label: 'Created at', type: 'date', readOnly: true },
      { key: 'userId', label: 'User ID', type: 'string' },
      { key: 'action', label: 'Action', type: 'string', required: true },
      { key: 'entityType', label: 'Entity type', type: 'string', required: true },
      { key: 'entityId', label: 'Entity ID', type: 'string', required: true },
      { key: 'metadataJson', label: 'Metadata JSON', type: 'json', multiline: true }
    ]
  }
];

@Injectable()
export class DatabaseAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async tables() {
    const containerTypeNames = await this.activeContainerTypeNames();

    return tables.map(({ delegate: _delegate, ...table }) => ({
      ...table,
      fields: table.fields.map((field) =>
        field.key === 'containerType' ? { ...field, enumValues: containerTypeNames } : field
      )
    }));
  }

  async rows(tableKey: string) {
    const table = this.table(tableKey);
    return this.delegate(table).findMany({
      orderBy: table.orderBy,
      take: 200
    });
  }

  async create(tableKey: string, input: Record<string, unknown>, actorId: string) {
    const table = this.table(tableKey);
    if (table.create === false) {
      throw new BadRequestException(`${table.label} cannot be created from the database editor`);
    }

    const row = await this.delegate(table).create({
      data: await this.toPrismaData(table, input)
    });

    await this.audit.log({
      userId: actorId,
      action: 'DATABASE_CREATE',
      entityType: table.label,
      entityId: String(row.id),
      metadataJson: { table: table.key } as Prisma.InputJsonValue
    });

    return row;
  }

  async update(tableKey: string, id: string, input: Record<string, unknown>, actorId: string) {
    const table = this.table(tableKey);
    if (table.update === false) {
      throw new BadRequestException(`${table.label} cannot be edited from the database editor`);
    }

    await this.ensureExists(table, id);
    const row = await this.delegate(table).update({
      where: { id },
      data: await this.toPrismaData(table, input)
    });

    await this.audit.log({
      userId: actorId,
      action: 'DATABASE_UPDATE',
      entityType: table.label,
      entityId: id,
      metadataJson: { table: table.key, changedFields: Object.keys(input) } as Prisma.InputJsonValue
    });

    return row;
  }

  async delete(tableKey: string, id: string, actorId: string) {
    const table = this.table(tableKey);
    if (table.delete === false) {
      throw new BadRequestException(`${table.label} cannot be deleted from the database editor`);
    }

    await this.ensureExists(table, id);
    const row = await this.delegate(table).delete({ where: { id } });

    await this.audit.log({
      userId: actorId,
      action: 'DATABASE_DELETE',
      entityType: table.label,
      entityId: id,
      metadataJson: { table: table.key } as Prisma.InputJsonValue
    });

    return row;
  }

  private table(tableKey: string) {
    const table = tables.find((item) => item.key === tableKey);
    if (!table) {
      throw new NotFoundException('Database table not found');
    }
    return table;
  }

  private delegate(table: TableConfig) {
    return this.prisma[table.delegate] as unknown as {
      findMany(args: unknown): Promise<Array<Record<string, unknown>>>;
      findUnique(args: unknown): Promise<Record<string, unknown> | null>;
      create(args: unknown): Promise<Record<string, unknown>>;
      update(args: unknown): Promise<Record<string, unknown>>;
      delete(args: unknown): Promise<Record<string, unknown>>;
    };
  }

  private async ensureExists(table: TableConfig, id: string) {
    const row = await this.delegate(table).findUnique({ where: { id }, select: { id: true } });
    if (!row) {
      throw new NotFoundException('Database row not found');
    }
  }

  private async toPrismaData(table: TableConfig, input: Record<string, unknown>) {
    const data: Record<string, unknown> = {};

    for (const field of table.fields) {
      if (field.readOnly || !(field.key in input)) {
        continue;
      }

      data[field.key] = await this.coerce(field, input[field.key]);
    }

    return data;
  }

  private async coerce(field: FieldConfig, value: unknown) {
    if (value === '') {
      return field.required ? value : null;
    }

    if (value === null || value === undefined) {
      return value;
    }

    if (field.type === 'number') {
      const numberValue = Number(value);
      if (Number.isNaN(numberValue)) {
        throw new BadRequestException(`${field.label} must be a number`);
      }
      return numberValue;
    }

    if (field.type === 'boolean') {
      return value === true || value === 'true';
    }

    if (field.type === 'date') {
      const date = new Date(String(value));
      if (Number.isNaN(date.getTime())) {
        throw new BadRequestException(`${field.label} must be a valid date`);
      }
      return date;
    }

    if (field.type === 'json') {
      if (typeof value !== 'string') {
        return value;
      }

      try {
        return JSON.parse(value);
      } catch {
        throw new BadRequestException(`${field.label} must be valid JSON`);
      }
    }

    if (field.key === 'containerType') {
      await this.ensureActiveContainerType(String(value));
    }

    return value;
  }

  private async activeContainerTypeNames() {
    const containerTypes = await this.prisma.containerType.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { name: true }
    });

    return containerTypes.map((containerType) => containerType.name);
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
