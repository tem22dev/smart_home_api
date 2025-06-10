import { Module } from '@nestjs/common';
import { SensorHistoryService } from './sensor-history.service';
import { SensorHistoryController } from './sensor-history.controller';

@Module({
  controllers: [SensorHistoryController],
  providers: [SensorHistoryService],
})
export class SensorHistoryModule {}
