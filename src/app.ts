import { NestFactory } from '@nestjs/core';
import { Logger as NestLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app.module';
import { middleware } from './app.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // Config use environment variables
  const configService = app.get(ConfigService);

  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  if (isProduction) {
    app.enable('trust proxy');
  }

  // Express Middleware
  middleware(app);

  app.enableShutdownHooks();
  await app.listen(configService.get<string>('PORT') ?? 8888);

  return await app.getUrl();
}

void (async () => {
  try {
    const url = await bootstrap();
    NestLogger.log(url, 'Bootstrap');
  } catch (error) {
    NestLogger.error(error, 'Bootstrap');
  }
})();
