import { NestFactory, Reflector } from '@nestjs/core';
import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { middleware } from './app.middleware';
import { JwtAuthGuard } from './auth';
import { TransformInterceptor } from './common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  const reflector = app.get(Reflector);
  const NestLogger = app.get(Logger);

  app.useLogger(NestLogger);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // Config use environment variables
  const configService = app.get(ConfigService);

  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  if (isProduction) {
    app.enable('trust proxy');
  }

  // Global Pipe, Validation check
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  // Set cookie
  app.use(cookieParser());

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
