import { Module } from '@nestjs/common';
import { AccessLogService } from './access-log.service';
import { AccessLogController } from './access-log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessLog, AccessLogSchema } from '@/schemas/access-log';

@Module({
  imports: [MongooseModule.forFeature([{ name: AccessLog.name, schema: AccessLogSchema }])],
  controllers: [AccessLogController],
  providers: [AccessLogService],
  exports: [AccessLogService],
})
export class AccessLogModule {}
