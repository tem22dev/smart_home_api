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
    this.client = mqtt.connect('mqtt://localhost:1883', { clientId: 'nestjs-server' });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.client.subscribe('device/+/status', (err) => {
        if (err) console.error('Subscribe error:', err);
      });
      this.client.subscribe('device/+/sensor/+/update', (err) => {
        if (err) console.error('Subscribe error:', err);
      });
    });

    this.client.on('message', async (topic, message) => {
      // const topicParts = topic.split('/');
      // if (topicParts[0] === 'device') {
      //   const deviceId = topicParts[1];
      //   if (topicParts[2] === 'status') {
      //     const status = message.toString() as 'on' | 'off';
      //     await this.deviceService.updateStatus(deviceId, status);
      //   } else if (topicParts[2] === 'sensor' && topicParts[4] === 'update') {
      //     const sensorId = topicParts[3];
      //     const { value, unit } = JSON.parse(message.toString());
      //     await this.deviceService.updateSensorValue(deviceId, sensorId, value, unit);
      //   }
      // }
    });
  }

  publishConfig(deviceId: string, config: any) {
    this.client.publish(`device/${deviceId}/config`, JSON.stringify(config));
  }

  publishActuatorCommand(deviceId: string, actuatorId: string, state: boolean) {
    this.client.publish(`device/${deviceId}/actuators/${actuatorId}/command`, JSON.stringify({ state }));
  }
}
