import { Controller, Get, Post, UseGuards, Res, Req } from '@nestjs/common';
import { AuthService, IPayload } from '@/auth';
import { Request, Response } from 'express';

import { Public, ReqUser, ResponseMessage } from '@/common';
import { LocalAuthGuard } from '@/auth/guards';
import { IUserFull } from '@/shared/user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Logged in successfully')
  login(@ReqUser() user: IUserFull, @Res({ passthrough: true }) response: Response) {
    return this.authService.jwtLogin(user, response);
  }

  @Get('check')
  @ResponseMessage('Token validated successfully')
  jwtCheck(@ReqUser() user: IPayload) {
    return {
      result: user,
    };
  }

  @Public()
  @Post('refresh')
  @ResponseMessage('Token refreshed successfully')
  jwtRefresh(@Req() request: Request) {
    return this.authService.jwtRefresh(request);
  }

  @Post('logout')
  @ResponseMessage('Logged out successfully')
  handleLogout(@ReqUser() user: IPayload, @Res({ passthrough: true }) response: Response) {
    return this.authService.jwtLogout(user, response);
  }
}
