import { Module } from '@nestjs/common';
import { ActuatorService } from './actuator.service';
import { ActuatorController } from './actuator.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Actuator, ActuatorSchema } from '@/schemas/actuator';
import { DeviceModule } from '@/device';

@Module({
  imports: [DeviceModule, MongooseModule.forFeature([{ name: Actuator.name, schema: ActuatorSchema }])],
  controllers: [ActuatorController],
  providers: [ActuatorService],
  exports: [ActuatorService],
})
export class ActuatorModule {}
