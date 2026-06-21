import { Injectable } from '@nestjs/common';
import { FreightStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [
      activeServices,
      servicesByDestination,
      servicesByCargoType,
      monthlySchedules,
      averageOceanFreightByTradeLane,
      recentlyAddedServices,
      recentActivity,
      trackingRecords,
      openQuotes
    ] = await Promise.all([
      this.prisma.freightService.count({ where: { status: FreightStatus.PUBLISHED } }),
      this.prisma.freightService.groupBy({
        by: ['destinationCountry'],
        where: { status: FreightStatus.PUBLISHED },
        _count: { _all: true },
        orderBy: { destinationCountry: 'asc' }
      }),
      this.prisma.freightService.groupBy({
        by: ['cargoType'],
        where: { status: FreightStatus.PUBLISHED },
        _count: { _all: true },
        orderBy: { cargoType: 'asc' }
      }),
      this.prisma.freightService.groupBy({
        by: ['scheduleMonth'],
        _count: { _all: true },
        orderBy: { scheduleMonth: 'asc' }
      }),
      this.prisma.freightService.groupBy({
        by: ['tradeLane'],
        where: { status: FreightStatus.PUBLISHED },
        _avg: { oceanFreight: true },
        orderBy: { tradeLane: 'asc' }
      }),
      this.prisma.freightService.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          tradeLane: true,
          cargoType: true,
          status: true,
          createdAt: true
        }
      }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { select: { name: true, email: true, role: true } } }
      }),
      this.prisma.trackingRecord.count(),
      this.prisma.quoteRequest.count({ where: { status: 'NEW' } })
    ]);

    return {
      activeServices,
      servicesByDestination,
      servicesByCargoType,
      monthlySchedules,
      averageOceanFreightByTradeLane,
      recentlyAddedServices,
      recentActivity,
      trackingRecords,
      openQuotes
    };
  }
}
