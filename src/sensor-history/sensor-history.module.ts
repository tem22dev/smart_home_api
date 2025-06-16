import { Module } from '@nestjs/common';
import { SensorHistoryService } from './sensor-history.service';
import { SensorHistoryController } from './sensor-history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorHistory, SensorHistorySchema } from '@/schemas/sensor-history';

@Module({
  imports: [MongooseModule.forFeature([{ name: SensorHistory.name, schema: SensorHistorySchema }])],
  controllers: [SensorHistoryController],
  providers: [SensorHistoryService],
  exports: [SensorHistoryService],
})
export class SensorHistoryModule {}
