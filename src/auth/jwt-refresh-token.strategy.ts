// jwt-refresh-token.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './interface/jwt-payload.interface';
import { AuthService } from './auth.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request.cookies['refreshToken'],
      ]),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: JwtPayload) {
    await request.cookies['refreshToken'];

    // Check if the refresh token is still valid
    const isValid = await this.authService.validateUserByRefreshToken(payload);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Returning the payload makes it available in the request object
    return payload;
  }
}
