import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SensorModule } from '@/sensor';
import { ActuatorModule } from '@/actuator';
import { SensorHistoryModule } from '@/sensor-history';

@Module({
  imports: [SensorModule, ActuatorModule, SensorHistoryModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
