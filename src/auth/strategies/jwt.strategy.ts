import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IPayload } from '../auth.interface';
import { UserService } from '@/shared/user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') || '',
    });
  }

  async validate(payload: IPayload) {
    const user = await this.userService.findOne(payload._id, payload);
    if (!user?.result || user?.result.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Token has been invalidated');
    }

    if (!user.result.active) {
      throw new UnauthorizedException('User is not active');
    }
    return payload;
  }
}
