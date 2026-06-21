import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CreateTrackingEventDto, CreateTrackingRecordDto, UpdateTrackingRecordDto } from './dto';
import { TrackingService } from './tracking.service';

@Controller()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('public/tracking/:trackingNumber')
  async publicLookup(@Param('trackingNumber') trackingNumber: string) {
    const record = await this.trackingService.publicLookup(trackingNumber);
    if (!record) {
      throw new NotFoundException('Tracking record not found');
    }
    return record;
  }

  @Get('tracking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  findAll() {
    return this.trackingService.findAll();
  }

  @Post('tracking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  create(@Body() dto: CreateTrackingRecordDto, @CurrentUser() user: AuthenticatedUser) {
    return this.trackingService.create(dto, user.id);
  }

  @Patch('tracking/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTrackingRecordDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.trackingService.update(id, dto, user.id);
  }

  @Post('tracking/:id/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  addEvent(
    @Param('id') id: string,
    @Body() dto: CreateTrackingEventDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.trackingService.addEvent(id, dto, user.id);
  }
}
