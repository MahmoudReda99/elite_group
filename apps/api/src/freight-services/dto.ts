import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min
} from 'class-validator';
import { FreightStatus } from '@prisma/client';

export class FreightServiceQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  cargoType?: string;

  @IsOptional()
  @IsString()
  containerType?: string;

  @IsOptional()
  @IsEnum(FreightStatus)
  status?: FreightStatus;
}

export class CreateFreightServiceDto {
  @IsString()
  title!: string;

  @IsString()
  originCountry!: string;

  @IsString()
  originPort!: string;

  @IsString()
  destinationCountry!: string;

  @IsString()
  destinationPort!: string;

  @IsString()
  tradeLane!: string;

  @IsString()
  cargoType!: string;

  @IsString()
  containerType!: string;

  @IsString()
  vesselName!: string;

  @IsString()
  voyageNumber!: string;

  @Type(() => Date)
  @IsDate()
  etd!: Date;

  @Type(() => Date)
  @IsDate()
  eta!: Date;

  @Matches(/^\d{4}-\d{2}$/)
  scheduleMonth!: string;

  @Type(() => Date)
  @IsDate()
  validFrom!: Date;

  @Type(() => Date)
  @IsDate()
  validTo!: Date;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  oceanFreight!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  thc!: number;

  @IsString()
  currency!: string;

  @IsOptional()
  @IsString()
  freeTimeNotes?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsEnum(FreightStatus)
  status?: FreightStatus;
}

export class UpdateFreightServiceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  originCountry?: string;

  @IsOptional()
  @IsString()
  originPort?: string;

  @IsOptional()
  @IsString()
  destinationCountry?: string;

  @IsOptional()
  @IsString()
  destinationPort?: string;

  @IsOptional()
  @IsString()
  tradeLane?: string;

  @IsOptional()
  @IsString()
  cargoType?: string;

  @IsOptional()
  @IsString()
  containerType?: string;

  @IsOptional()
  @IsString()
  vesselName?: string;

  @IsOptional()
  @IsString()
  voyageNumber?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  etd?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  eta?: Date;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  scheduleMonth?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validTo?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  oceanFreight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  thc?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  freeTimeNotes?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsEnum(FreightStatus)
  status?: FreightStatus;
}
