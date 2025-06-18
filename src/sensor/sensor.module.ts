import { Module } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorController } from './sensor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sensor, SensorSchema } from '@/schemas/sensor';
import { DeviceModule } from '@/device';

@Module({
  imports: [DeviceModule, MongooseModule.forFeature([{ name: Sensor.name, schema: SensorSchema }])],
  controllers: [SensorController],
  providers: [SensorService],
  exports: [SensorService],
})
export class SensorModule {}
