import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Config use environment variables
  const configService = app.get(ConfigService);

  // Run app
  await app.listen(configService.get<string>('PORT') ?? 8888);
}
bootstrap();
