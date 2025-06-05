import { forwardRef, Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '@/schemas/device';
import { BaseModule } from '@/base';

@Module({
  imports: [MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]), forwardRef(() => BaseModule)],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
