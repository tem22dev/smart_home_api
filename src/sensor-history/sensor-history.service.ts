import { Injectable } from '@nestjs/common';
import { UpdateSensorHistoryDto, CreateSensorHistoryDto } from './dto';

@Injectable()
export class SensorHistoryService {
  create(createSensorHistoryDto: CreateSensorHistoryDto) {
    return 'This action adds a new sensorHistory';
  }

  findAll() {
    return `This action returns all sensorHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sensorHistory`;
  }

  update(id: number, updateSensorHistoryDto: UpdateSensorHistoryDto) {
    return `This action updates a #${id} sensorHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} sensorHistory`;
  }
}
