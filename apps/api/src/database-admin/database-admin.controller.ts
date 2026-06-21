import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { DatabaseAdminService } from './database-admin.service';

@Controller('admin/database')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DatabaseAdminController {
  constructor(private readonly databaseAdminService: DatabaseAdminService) {}

  @Get('tables')
  tables() {
    return this.databaseAdminService.tables();
  }

  @Get(':table/rows')
  rows(@Param('table') table: string) {
    return this.databaseAdminService.rows(table);
  }

  @Post(':table/rows')
  create(@Param('table') table: string, @Body() body: Record<string, unknown>, @CurrentUser() user: AuthenticatedUser) {
    return this.databaseAdminService.create(table, body, user.id);
  }

  @Patch(':table/rows/:id')
  update(
    @Param('table') table: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.databaseAdminService.update(table, id, body, user.id);
  }

  @Delete(':table/rows/:id')
  delete(@Param('table') table: string, @Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.databaseAdminService.delete(table, id, user.id);
  }
}
