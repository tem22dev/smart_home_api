import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SensorModule } from '@/sensor';
import { ActuatorModule } from '@/actuator';
import { SensorHistoryModule } from '@/sensor-history';
import { DeviceModule } from '@/device';

@Module({
  imports: [SensorModule, ActuatorModule, DeviceModule, SensorHistoryModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
