import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FreightServicesModule } from './freight-services/freight-services.module';
import { TrackingModule } from './tracking/tracking.module';
import { ContactModule } from './contact/contact.module';
import { QuotesModule } from './quotes/quotes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './audit/audit.module';
import { DatabaseAdminModule } from './database-admin/database-admin.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    FreightServicesModule,
    TrackingModule,
    ContactModule,
    QuotesModule,
    DashboardModule,
    DatabaseAdminModule
  ]
})
export class AppModule {}
