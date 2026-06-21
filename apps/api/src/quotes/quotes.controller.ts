import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CreateQuoteRequestDto, UpdateQuoteStatusDto } from './dto';
import { QuotesService } from './quotes.service';

@Controller()
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('public/quote-requests')
  create(@Body() dto: CreateQuoteRequestDto) {
    return this.quotesService.create(dto);
  }

  @Get('quote-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  findAll() {
    return this.quotesService.findAll();
  }

  @Patch('quote-requests/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateQuoteStatusDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.quotesService.updateStatus(id, dto, user.id);
  }
}
