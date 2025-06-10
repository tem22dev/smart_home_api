import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SensorHistoryService } from './sensor-history.service';
import { CreateSensorHistoryDto } from './dto/create-sensor-history.dto';
import { UpdateSensorHistoryDto } from './dto/update-sensor-history.dto';

@Controller('sensor-history')
export class SensorHistoryController {
  constructor(private readonly sensorHistoryService: SensorHistoryService) {}

  @Post()
  create(@Body() createSensorHistoryDto: CreateSensorHistoryDto) {
    return this.sensorHistoryService.create(createSensorHistoryDto);
  }

  @Get()
  findAll() {
    return this.sensorHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensorHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSensorHistoryDto: UpdateSensorHistoryDto) {
    return this.sensorHistoryService.update(+id, updateSensorHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sensorHistoryService.remove(+id);
  }
}
