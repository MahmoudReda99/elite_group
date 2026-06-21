import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { TrackingStatus } from '@prisma/client';

export class CreateTrackingRecordDto {
  @IsString()
  trackingNumber!: string;

  @IsString()
  customerName!: string;

  @IsString()
  originPort!: string;

  @IsString()
  destinationPort!: string;

  @IsOptional()
  @IsString()
  vesselName?: string;

  @IsOptional()
  @IsString()
  voyageNumber?: string;

  @IsEnum(TrackingStatus)
  currentStatus!: TrackingStatus;

  @IsBoolean()
  published!: boolean;
}

export class UpdateTrackingRecordDto {
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  originPort?: string;

  @IsOptional()
  @IsString()
  destinationPort?: string;

  @IsOptional()
  @IsString()
  vesselName?: string;

  @IsOptional()
  @IsString()
  voyageNumber?: string;

  @IsOptional()
  @IsEnum(TrackingStatus)
  currentStatus?: TrackingStatus;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class CreateTrackingEventDto {
  @IsEnum(TrackingStatus)
  status!: TrackingStatus;

  @IsString()
  location!: string;

  @Type(() => Date)
  @IsDate()
  eventDate!: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
