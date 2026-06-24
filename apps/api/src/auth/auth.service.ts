import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterCustomerDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });

    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.loginResponse(user);
  }

  async registerCustomer(dto: RegisterCustomerDto) {
    const email = dto.email.toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const name = `${dto.firstName.trim()} ${dto.lastName.trim()}`.trim();
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await argon2.hash(dto.password),
        role: UserRole.CUSTOMER,
        active: true,
        customer: {
          create: {
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            email,
            countryCode: dto.countryCode,
            phoneNumber: dto.phoneNumber,
            companyName: dto.companyName,
            streetAddress: dto.streetAddress,
            city: dto.city,
            countryRegion: dto.countryRegion
          }
        }
      }
    });

    return this.loginResponse(user);
  }

  private async loginResponse(user: { id: string; name: string; email: string; role: UserRole }) {
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return {
      accessToken: await this.jwtService.signAsync(safeUser),
      user: safeUser
    };
  }
}
