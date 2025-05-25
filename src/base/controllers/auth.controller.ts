import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { AuthService } from '@/auth';
import { Response } from 'express';

import { ReqUser } from '@/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@ReqUser() user, response: Response) {
    return this.authService.login(user, response);
  }
}
