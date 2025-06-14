import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { SensorService } from '@/sensor';
import { ActuatorService } from '@/actuator';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('SocketGateway');

  constructor(
    private readonly sensorService: SensorService,
    private readonly actuatorService: ActuatorService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Initialized Socket Server');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('updateSensorStatus')
  async handleUpdateSensorStatus(client: Socket, payload: { id: string; status: boolean; name: string }) {
    const { id, status, name } = payload;

    try {
      await this.sensorService.updateStatus(id, status);
      this.server.emit('sensorStatusUpdate', { id, status, name }); // Send update to all client
      this.logger.log(`Sensor ${id} status updated to ${status}`);
    } catch (error) {
      this.logger.error(`Failed to update sensor ${id} status: ${error.message}`);
      client.emit('error', { message: 'Failed to update sensor status' });
    }
  }

  @SubscribeMessage('updateActuatorStatus')
  async handleUpdateActuatorStatus(client: Socket, payload: { id: string; status: boolean; name: string }) {
    const { id, status, name } = payload;

    try {
      await this.actuatorService.updateStatus(id, status);
      this.server.emit('actuatorStatusUpdate', { id, status, name }); // Send update to all client
      this.logger.log(`actuator ${id} status updated to ${status}`);
    } catch (error) {
      this.logger.error(`Failed to update actuator ${id} status: ${error.message}`);
      client.emit('error', { message: 'Failed to update actuator status' });
    }
  }
}
