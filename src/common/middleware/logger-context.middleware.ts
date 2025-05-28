import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

import { AuthService, IPayload } from '@/auth';

@Injectable()
export class LoggerContextMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: PinoLogger,
    private authService: AuthService,
  ) {}

  public use(req: Request, _res: Response, next: () => void): void {
    const authorization = req.header('authorization');

    const user: IPayload | null = authorization?.startsWith('Bearer')
      ? this.authService.getPayload(authorization.split(' ')[1])
      : (req.user as IPayload | null);

    const userId = user?._id ?? undefined;
    // // for https://github.com/iamolegga/nestjs-pino/issues/608
    req.customProps = { userId };
    // // Add extra fields to share in logger context
    this.logger.assign(req.customProps);

    next();
  }
}
