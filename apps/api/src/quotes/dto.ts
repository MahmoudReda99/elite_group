import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { MessageStatus } from '@prisma/client';

export class CreateQuoteRequestDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsString()
  originPort!: string;

  @IsString()
  destinationPort!: string;

  @IsString()
  cargoType!: string;

  @IsString()
  containerType!: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readyDate?: Date;

  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateQuoteStatusDto {
  @IsEnum(MessageStatus)
  status!: MessageStatus;
}
