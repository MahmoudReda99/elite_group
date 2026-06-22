import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CreateFreightServiceDto, FreightServiceQueryDto, UpdateFreightServiceDto } from './dto';
import { FreightServicesService } from './freight-services.service';

@Controller()
export class FreightServicesController {
  constructor(private readonly freightServicesService: FreightServicesService) {}

  @Get('public/freight-services')
  findPublic(@Query() query: FreightServiceQueryDto) {
    return this.freightServicesService.findPublic(query);
  }

  @Get('public/container-types')
  listContainers() {
    return this.freightServicesService.listContainers();
  }

  @Get('public/container-catalog')
  listContainerCatalog() {
    return this.freightServicesService.listContainerCatalog();
  }

  @Get('public/container-catalog/:slug')
  getContainerCatalogItem(@Param('slug') slug: string) {
    return this.freightServicesService.getContainerCatalogItem(slug);
  }

  @Get('public/service-categories')
  listCategories() {
    return this.freightServicesService.listCategories();
  }

  @Get('freight-services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  findAll(@Query() query: FreightServiceQueryDto) {
    return this.freightServicesService.findAll(query);
  }

  @Post('freight-services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  create(@Body() dto: CreateFreightServiceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.freightServicesService.create(dto, user.id);
  }

  @Patch('freight-services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFreightServiceDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.freightServicesService.update(id, dto, user.id);
  }

  @Delete('freight-services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.freightServicesService.archive(id, user.id);
  }
}
