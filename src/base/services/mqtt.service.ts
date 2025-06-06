import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { DeviceService } from '@/device/device.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: mqtt.MqttClient;

  constructor(
    @Inject(forwardRef(() => DeviceService))
    private readonly deviceService: DeviceService,
  ) {}

  onModuleInit() {
    this.client = mqtt.connect('mqtt://localhost:1883', {
      clientId: 'nestjs-server',
      reconnectPeriod: 1000,
      keepalive: 60,
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      // Subscribe các topic cần thiết
      this.client.subscribe('device/+/status', (err) => {
        if (err) {
          console.error('Subscribe error for device/+/status:', err);
        } else {
          console.log('Subscribed to device/+/status');
        }
      });
      this.client.subscribe('device/+/sensor/+/update', (err) => {
        if (err) {
          console.error('Subscribe error for device/+/sensor/+/update:', err);
        } else {
          console.log('Subscribed to device/+/sensor/+/update');
        }
      });
      // Subscribe topic để nhận đăng ký từ ESP32
      this.client.subscribe('device/register', (err) => {
        if (err) {
          console.error('Subscribe error for device/register:', err);
        } else {
          console.log('Subscribed to device/register');
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      console.log(`Received message on topic ${topic}: ${message.toString()}`);
      const topicParts = topic.split('/');
      if (topicParts[0] === 'device') {
        if (topic === 'device/register') {
          // Thiết bị ESP32 đăng ký
          const { deviceId } = JSON.parse(message.toString());
          console.log(`Device registered: ${deviceId}`);
          // Kiểm tra xem device có tồn tại trong DB không
          const device = await this.deviceService.findOne(deviceId);
          if (device) {
            // Gửi cấu hình cho thiết bị
            this.publishConfig(deviceId, {
              sensors: device.result.sensors,
              actuators: device.result.actuators,
            });
            // Cập nhật trạng thái thành online
            await this.deviceService.updateStatus(deviceId, 'on');
          }
        } else {
          const deviceId = topicParts[1];
          if (topicParts[2] === 'status') {
            const status = message.toString() as 'on' | 'off';
            console.log(`Updating status for device ${deviceId}: ${status}`);
            await this.deviceService.updateStatus(deviceId, status);
          } else if (topicParts[2] === 'sensor' && topicParts[4] === 'update') {
            const sensorId = topicParts[3];
            const { value, unit } = JSON.parse(message.toString());
            console.log(`Updating sensor ${sensorId} for device ${deviceId}: value=${value}, unit=${unit}`);
            // await this.deviceService.updateSensorValue(deviceId, sensorId, value, unit);
          }
        }
      }
    });

    this.client.on('error', (err) => {
      console.error('MQTT client error:', err);
    });

    this.client.on('close', () => {
      console.log('Disconnected from MQTT broker');
    });
  }

  publishConfig(deviceId: string, config: any) {
    const topic = `device/config`;
    const message = JSON.stringify(config);
    console.log(`Publishing to ${topic}: ${message}`);
    this.client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Failed to publish to ${topic}:`, err);
      } else {
        console.log(`Successfully published to ${topic}`);
      }
    });
  }

  publishActuatorCommand(deviceId: string, actuatorId: string, state: boolean) {
    const topic = `device/${deviceId}/actuators/${actuatorId}/command`;
    const message = JSON.stringify({ state });
    console.log(`Publishing to ${topic}: ${message}`);
    this.client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Failed to publish to ${topic}:`, err);
      } else {
        console.log(`Successfully published to ${topic}`);
      }
    });
  }
}
