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
import mqtt from 'mqtt';
import { SensorHistoryService } from '@/sensor-history';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('SocketGateway');
  private mqttClient: mqtt.MqttClient;

  constructor(
    private readonly sensorService: SensorService,
    private readonly actuatorService: ActuatorService,
    private readonly sensorHistoryService: SensorHistoryService,
  ) {
    // Init MQTT client
    this.mqttClient = mqtt.connect('mqtt://localhost:1883', {
      clientId: 'nestjs-server',
      reconnectPeriod: 1000,
      keepalive: 60,
    });
    this.setupMqtt();
  }

  afterInit(server: Server) {
    this.logger.log('Initialized Socket Server');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private setupMqtt() {
    this.mqttClient.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.mqttClient.subscribe('request/config', (err) => {
        if (err) this.logger.error('Failed to subscribe to request/config:', err);
      });
    });

    this.mqttClient.on('message', async (topic, message) => {
      if (topic === 'request/config') {
        const deviceCode = message.toString();
        const config = await this.sensorService.getSensorsByDeviceCode(deviceCode);
        console.log('config ==> ', config);
        this.mqttClient.publish(`config/${deviceCode}`, JSON.stringify(config));
        this.logger.log(`Sent config to ${deviceCode}`);
      } else if (topic === 'sensor/data') {
        try {
          const payload = JSON.parse(message.toString());
          const { sensorId, value, unit } = payload;
          if (sensorId && value !== undefined && unit) {
            const newHistory = await this.sensorHistoryService.handleMqttData(sensorId, value, unit);
            this.server.emit('sensorHistoryUpdate', {
              id: newHistory.result._id,
              sensorId: newHistory.result.sensorId,
              value,
              unit,
              createdAt: newHistory.result.createdAt,
            });
            this.logger.log(`New sensor history added via MQTT: ${sensorId}, value=${value}, unit=${unit}`);
          }
        } catch (error) {
          this.logger.error('Failed to process MQTT message:', error);
        }
      }
    });

    this.mqttClient.on('error', (error) => {
      this.logger.error('MQTT error:', error);
    });
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

  @SubscribeMessage('updateSensorConfig')
  async handleUpdateSensorConfig(
    client: Socket,
    payload: { id: string; pin: number; threshold: number; name: string },
  ) {
    const { id, pin, threshold, name } = payload;
    try {
      await this.sensorService.updateSocket(id, { pin, threshold });
      this.server.emit('sensorConfigUpdate', { id, pin, threshold, name });
      const device = await this.sensorService.findOne(id);
      let deviceCode: string | undefined;
      // Check if deviceId is populated and has deviceCode
      if (
        device.result.deviceId &&
        typeof device.result.deviceId === 'object' &&
        'deviceCode' in device.result.deviceId
      ) {
        deviceCode = (device.result.deviceId as { deviceCode: string }).deviceCode;
      }

      if (deviceCode) {
        const config = await this.sensorService.getSensorsByDeviceCode(deviceCode);
        this.mqttClient.publish(`config/${deviceCode}`, JSON.stringify(config));
      }
      this.logger.log(`Sensor ${id} config updated: pin=${pin}, threshold=${threshold}`);
    } catch (error) {
      this.logger.error(`Failed to update sensor ${id} config: ${error.message}`);
      client.emit('error', { message: 'Failed to update sensor config' });
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

  @SubscribeMessage('updateActuatorConfig')
  async handleUpdateActuatorConfig(
    client: Socket,
    payload: { id: string; pin: number; minAngle: number; maxAngle: number; name: string },
  ) {
    const { id, pin, minAngle, maxAngle, name } = payload;

    try {
      await this.actuatorService.updateSocket(id, { pin, minAngle, maxAngle });
      this.server.emit('actuatorConfigUpdate', { id, pin, minAngle, maxAngle, name }); // Send update to all client
      this.logger.log(`Actuator ${id} config updated: pin=${pin}, minAngle=${minAngle}, maxAngle=${maxAngle}`);
    } catch (error) {
      this.logger.error(`Failed to update actuator ${id} config: ${error.message}`);
      client.emit('error', { message: 'Failed to update actuator config' });
    }
  }

  @SubscribeMessage('loadSensorHistory')
  async handleLoadSensorHistory(client: Socket, payload: { sensorId: string }) {
    const { sensorId } = payload;
    try {
      const history = await this.sensorHistoryService.loadHistory(sensorId);
      client.emit('sensorHistoryLoaded', {
        sensorId,
        history,
      });
      this.logger.log(`Sensor history loaded for sensorId: ${sensorId}`);
    } catch (error) {
      this.logger.error(`Failed to load sensor history for ${sensorId}: ${error.message}`);
      client.emit('error', { message: 'Failed to load sensor history' });
    }
  }
}
