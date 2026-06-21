import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { DatabaseAdminController } from './database-admin.controller';
import { DatabaseAdminService } from './database-admin.service';

@Module({
  imports: [AuditModule],
  controllers: [DatabaseAdminController],
  providers: [DatabaseAdminService]
})
export class DatabaseAdminModule {}
