import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { MulterConfigService } from '@/config';
import { UploadController } from './upload.controller';

@Module({
  providers: [],
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
