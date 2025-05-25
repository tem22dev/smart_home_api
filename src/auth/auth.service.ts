import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor() {}

  login(user, response: Response) {}
}
