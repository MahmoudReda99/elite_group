import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'local-development-secret-change-me'
    });
  }

  async validate(payload: { id: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.id } });

    if (!user || !user.active) {
      throw new UnauthorizedException('User is inactive');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
}
