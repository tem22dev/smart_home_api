import { Controller, Get, Post, UseGuards, Res, Req } from '@nestjs/common';
import { AuthService, IPayload } from '@/auth';
import { Request, Response } from 'express';

import { ReqUser } from '@/common/decorators';
import { JwtAuthGuard, LocalAuthGuard } from '@/auth/guards';
import { IUserFull } from '@/shared/user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@ReqUser() user: IUserFull, @Res({ passthrough: true }) response: Response) {
    return this.authService.jwtLogin(user, response);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  jwtCheck(@ReqUser() user: IPayload) {
    return {
      result: user,
    };
  }

  @Post('refresh')
  jwtRefresh(@Req() request: Request) {
    return this.authService.jwtRefresh(request);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  handleLogout(@ReqUser() user: IPayload, @Res({ passthrough: true }) response: Response) {
    return this.authService.jwtLogout(user, response);
  }
}
