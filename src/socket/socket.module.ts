import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SensorModule } from '@/sensor';
import { ActuatorModule } from '@/actuator';

@Module({
  imports: [SensorModule, ActuatorModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
