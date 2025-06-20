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
import { DeviceService } from '@/device';
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
    private readonly deviceService: DeviceService,
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
      this.mqttClient.subscribe('request/config', { qos: 1 }, (err) => {
        if (err) this.logger.error('Failed to subscribe to request/config:', err);
      });
      this.mqttClient.subscribe('sensor/data', { qos: 1 }, (err) => {
        if (err) this.logger.error('Failed to subscribe to sensor/data:', err);
      });
      this.mqttClient.subscribe('status/#', { qos: 1 }, (err) => {
        if (err) this.logger.error('Failed to subscribe to status/#:', err);
      }); // Đăng ký nhận yêu cầu trạng thái
    });

    this.mqttClient.on('message', async (topic, message) => {
      if (topic === 'request/config') {
        const deviceCode = message.toString();
        const config = await this.sensorService.getSensorsByDeviceCode(deviceCode);
        console.log('config ==> ', config);

        this.mqttClient.publish(`config/${deviceCode}`, JSON.stringify(config), { qos: 1 }, (err) => {
          if (err) {
            this.logger.error(`Failed to publish config to config/${deviceCode}: ${err.message}`);
          } else {
            this.logger.log(`Successfully published config to config/${deviceCode}`);
          }
        });
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
      } else if (topic.startsWith('status/') && message.length === 0) {
        // Xử lý yêu cầu trạng thái từ ESP32
        const deviceCode = topic.replace('status/', '');
        const device = await this.deviceService.findByDeviceCode(deviceCode);
        if (device.result) {
          const payload = { status: device.result.status };
          this.mqttClient.publish(`status/${deviceCode}`, JSON.stringify(payload), { qos: 1 }, (err) => {
            if (err) {
              this.logger.error(`Failed to publish status to ${deviceCode}: ${err.message}`);
            } else {
              this.logger.log(`Sent current status ${device.result.status} to topic status/${deviceCode}`);
            }
          });
        }
      }
    });

    this.mqttClient.on('error', (error) => {
      this.logger.error('MQTT error:', error);
    });
  }

  @SubscribeMessage('requestReloadConfig')
  async handleRequestReloadConfig(client: Socket, payload: { deviceCode: string }) {
    const { deviceCode } = payload;
    this.logger.log(`Received request to reload config for device: ${deviceCode}`);
    this.mqttClient.publish('request/config', deviceCode, { qos: 1 }, async (err) => {});
  }

  @SubscribeMessage('updateSensorStatus')
  async handleUpdateSensorStatus(client: Socket, payload: { id: string; status: boolean; name: string }) {
    const { id, status, name } = payload;
    try {
      const sensor = await this.sensorService.findOne(id);
      if (!sensor.result || !sensor.result.deviceId) {
        throw new Error('Sensor not found or no associated device');
      }
      const deviceId = (sensor.result.deviceId as any)._id || sensor.result.deviceId;
      const device = await this.deviceService.findOne(deviceId.toString());
      if (!device.result || !device.result.status) {
        throw new Error('Device is disabled, cannot update sensor status');
      }

      await this.sensorService.updateStatus(id, status);
      this.server.emit('sensorStatusUpdate', { id, status, name });
      // Gửi cập nhật trạng thái sensor qua MQTT
      const payloadMqtt = { status };
      this.mqttClient.publish(`sensor/status/${id}`, JSON.stringify(payloadMqtt), { qos: 1 }, (err) => {
        if (err) {
          this.logger.error(`Failed to publish sensor status to sensor/status/${id}: ${err.message}`);
        } else {
          this.logger.log(`Successfully published sensor ${id} status ${status} to topic sensor/status/${id}`);
        }
      });
    } catch (error) {
      this.logger.error(`Failed to update sensor ${id} status: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('updateActuatorStatus')
  async handleUpdateActuatorStatus(client: Socket, payload: { id: string; status: boolean; name: string }) {
    const { id, status, name } = payload;
    try {
      const actuator = await this.actuatorService.findOne(id);
      if (!actuator.result || !actuator.result.deviceId) {
        throw new Error('Actuator not found or no associated device');
      }
      const deviceId = (actuator.result.deviceId as any)._id || actuator.result.deviceId;
      const device = await this.deviceService.findOne(deviceId.toString());
      if (!device.result || !device.result.status) {
        throw new Error('Device is disabled, cannot update actuator status');
      }

      await this.actuatorService.updateStatus(id, status);
      this.server.emit('actuatorStatusUpdate', { id, status, name });
      this.logger.log(`Actuator ${id} status updated to ${status}`);
    } catch (error) {
      this.logger.error(`Failed to update actuator ${id} status: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('updateDeviceStatus')
  async handleUpdateDeviceStatus(client: Socket, payload: { id: string; status: boolean; name: string }) {
    const { id, status, name } = payload;
    try {
      const device = await this.deviceService.findOne(id);
      if (!device.result) {
        throw new Error('Device not found');
      }
      const deviceCode = device.result.deviceCode;
      const currentDevice = await this.deviceService.findOne(id);
      if (currentDevice.result.status !== status) {
        await this.deviceService.updateStatus(id, status);
        this.server.emit('deviceStatusUpdate', { id, status, name });
        const payload = { status };
        this.mqttClient.publish(`status/${deviceCode}`, JSON.stringify(payload), { qos: 1 }, (err) => {
          if (err) {
            this.logger.error(`Failed to publish status to ${deviceCode}: ${err.message}`);
          } else {
            this.logger.log(`Successfully published status ${status} to topic status/${deviceCode}`);
          }
        });
      } else {
        this.logger.log(`Device ${id} status is already ${status}, no update needed`);
      }
    } catch (error) {
      this.logger.error(`Failed to update device ${id} status: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('updateSensorConfig')
  async handleUpdateSensorConfig(
    client: Socket,
    payload: { id: string; pin: number; threshold: number; name: string },
  ) {
    const { id, pin, threshold, name } = payload;
    try {
      const sensor = await this.sensorService.findOne(id);
      if (!sensor.result || !sensor.result.deviceId) {
        throw new Error('Sensor not found or no associated device');
      }
      const deviceId = (sensor.result.deviceId as any)._id || sensor.result.deviceId;
      const device = await this.deviceService.findOne(deviceId.toString());
      if (!device.result || !device.result.status) {
        throw new Error('Device is disabled, cannot update sensor config');
      }

      await this.sensorService.updateSocket(id, { pin, threshold });
      this.server.emit('sensorConfigUpdate', { id, pin, threshold, name });
      const sensorDevice = await this.sensorService.findOne(id);
      let deviceCode: string | undefined;
      if (
        sensorDevice.result.deviceId &&
        typeof sensorDevice.result.deviceId === 'object' &&
        'deviceCode' in sensorDevice.result.deviceId
      ) {
        deviceCode = (sensorDevice.result.deviceId as { deviceCode: string }).deviceCode;
      }
      if (deviceCode) {
        const config = await this.sensorService.getSensorsByDeviceCode(deviceCode);
        this.mqttClient.publish(`config/${deviceCode}`, JSON.stringify(config));
      }
      this.logger.log(`Sensor ${id} config updated: pin=${pin}, threshold=${threshold}`);
    } catch (error) {
      this.logger.error(`Failed to update sensor ${id} config: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('updateActuatorConfig')
  async handleUpdateActuatorConfig(
    client: Socket,
    payload: { id: string; pin: number; minAngle: number; maxAngle: number; name: string },
  ) {
    const { id, pin, minAngle, maxAngle, name } = payload;
    try {
      const actuator = await this.actuatorService.findOne(id);
      if (!actuator.result || !actuator.result.deviceId) {
        throw new Error('Actuator not found or no associated device');
      }
      const deviceId = (actuator.result.deviceId as any)._id || actuator.result.deviceId;
      const device = await this.deviceService.findOne(deviceId.toString());
      if (!device.result || !device.result.status) {
        throw new Error('Device is disabled, cannot update actuator config');
      }

      await this.actuatorService.updateSocket(id, { pin, minAngle, maxAngle });
      this.server.emit('actuatorConfigUpdate', { id, pin, minAngle, maxAngle, name });
      this.logger.log(`Actuator ${id} config updated: pin=${pin}, minAngle=${minAngle}, maxAngle=${maxAngle}`);
    } catch (error) {
      this.logger.error(`Failed to update actuator ${id} config: ${error.message}`);
      client.emit('error', { message: error.message });
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
