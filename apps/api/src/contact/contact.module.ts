import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [AuditModule],
  controllers: [ContactController],
  providers: [ContactService]
})
export class ContactModule {}
