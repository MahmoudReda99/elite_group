import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { FreightServicesController } from './freight-services.controller';
import { FreightServicesService } from './freight-services.service';

@Module({
  imports: [AuditModule],
  controllers: [FreightServicesController],
  providers: [FreightServicesService],
  exports: [FreightServicesService]
})
export class FreightServicesModule {}
