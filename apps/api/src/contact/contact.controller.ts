import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ContactService } from './contact.service';
import { CreateContactMessageDto, UpdateContactStatusDto } from './dto';

@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('public/company-profile')
  companyProfile() {
    return this.contactService.companyProfile();
  }

  @Post('public/contact-messages')
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  @Get('contact-messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  findAll() {
    return this.contactService.findAll();
  }

  @Patch('contact-messages/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContactStatusDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.contactService.updateStatus(id, dto, user.id);
  }
}
