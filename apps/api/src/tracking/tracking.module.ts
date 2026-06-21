import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  imports: [AuditModule],
  controllers: [TrackingController],
  providers: [TrackingService]
})
export class TrackingModule {}
