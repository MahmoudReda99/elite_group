import { MessageStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateContactMessageDto {
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
  message!: string;
}

export class UpdateContactStatusDto {
  @IsEnum(MessageStatus)
  status!: MessageStatus;
}
