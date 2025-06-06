import { forwardRef, Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '@/schemas/device';
import { BaseModule } from '@/base';
import { SensorHistory, SensorHistorySchema } from '@/schemas/sensor-history';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: SensorHistory.name, schema: SensorHistorySchema },
    ]),
    forwardRef(() => BaseModule),
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
