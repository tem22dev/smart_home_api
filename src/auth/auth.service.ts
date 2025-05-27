import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import ms from 'ms';

import { IUserFull, UserService } from '@/shared/user';
import { isValidPassword } from '@/shared/user/user.util';
import { IPayload } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async jwtLogin(user: IUserFull, response: Response) {
    const { _id, fullName, email, phone, roles, tokenVersion } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      fullName,
      email,
      phone,
      roles,
      tokenVersion,
    };

    // Set refresh token for cookie client
    const refreshTokenValue = this.getRefreshToken(payload);
    await this.userService.updateRefreshToken(_id, refreshTokenValue);

    response.cookie('refreshToken', refreshTokenValue, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRATION') as ms.StringValue),
    });

    const { password, refreshToken, ...safeUser } = user;

    return {
      result: safeUser,
      metadata: {
        token: {
          access: this.jwtService.sign(payload),
        },
      },
    };
  }

  async jwtRefresh(request: Request) {
    try {
      const refreshTokenValue = request.cookies['refreshToken'];
      this.jwtService.verify(refreshTokenValue, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      let user = await this.userService.findUserByToken(refreshTokenValue);
      if (!user) {
        throw new BadRequestException('Refresh token is invalid');
      }

      const { _id, fullName, email, phone, roles, tokenVersion } = user;
      const payload = {
        sub: 'access token login',
        iss: 'from server',
        _id,
        fullName,
        email,
        phone,
        roles,
        tokenVersion,
      };

      const { password, refreshToken, ...safeUser } = user.toObject();

      return {
        result: safeUser,
        metadata: {
          token: {
            access: this.jwtService.sign(payload),
          },
        },
      };
    } catch (error) {
      throw new BadRequestException('Refresh token is invalid');
    }
  }

  async jwtLogout(user: IPayload, response: Response) {
    await this.userService.incrementTokenVersion(user._id);
    await this.userService.updateRefreshToken(user._id, '');
    response.clearCookie('refreshToken');

    return {
      result: 'Logout successful',
    };
  }

  private getRefreshToken(payload: IPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRATION') as ms.StringValue) / 1000,
    });
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOneUsername(username);

    if (user.isDeleted === true) return null;

    const isValid = isValidPassword(password, user.password!);

    if (isValid === true) {
      return user.toObject();
    }

    return null;
  }
}
