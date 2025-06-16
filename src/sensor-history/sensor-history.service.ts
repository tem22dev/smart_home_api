import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSensorHistoryDto } from './dto';
import { SensorHistory, SensorHistoryDocument } from '@/schemas/sensor-history';

@Injectable()
export class SensorHistoryService {
  constructor(@InjectModel(SensorHistory.name) private sensorHistoryModel: Model<SensorHistoryDocument>) {}

  async create(createSensorHistoryDto: CreateSensorHistoryDto) {
    const sensorValue = (await this.sensorHistoryModel.create(createSensorHistoryDto)).populate({
      path: 'sensorId',
      select: { name: 1 },
    });
    const result = (await sensorValue).toObject();
    return { result };
  }

  async loadHistory(sensorId: string) {
    const data = await this.sensorHistoryModel
      .find({ sensorId })
      .populate({
        path: 'sensorId',
        select: { name: 1 },
      })
      .sort({ createdAt: -1 })
      .exec();
    return data;
  }

  async handleMqttData(sensorId: string, value: any, unit: string) {
    const createSensorHistoryDto: CreateSensorHistoryDto = {
      sensorId,
      value,
      unit,
    };
    return await this.create(createSensorHistoryDto);
  }
}
