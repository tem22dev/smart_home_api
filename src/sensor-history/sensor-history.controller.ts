import { Controller, Post, Body } from '@nestjs/common';
import { SensorHistoryService } from './sensor-history.service';
import { CreateSensorHistoryDto } from './dto';

@Controller('sensor-history')
export class SensorHistoryController {
  constructor(private readonly sensorHistoryService: SensorHistoryService) {}

  @Post()
  create(@Body() createSensorHistoryDto: CreateSensorHistoryDto) {
    return this.sensorHistoryService.create(createSensorHistoryDto);
  }
}
