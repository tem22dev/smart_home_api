import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { CreateSensorDto, UpdateSensorDto } from './dto';
import { ReqUser, ResponseMessage } from '@/common';
import { IPayload } from '@/auth';

@Controller('sensors')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Post()
  @ResponseMessage('Sensor created successfully')
  async create(@Body() createDeviceDto: CreateSensorDto, @ReqUser() user: IPayload) {
    return await this.sensorService.create(createDeviceDto, user);
  }

  @Get('deleted')
  @ResponseMessage('Retrieved deleted sensor successfully')
  async findAllDeleted(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return await this.sensorService.findDeleted(+currentPage, +limit, qs);
  }

  @Get()
  @ResponseMessage('Retrieved all sensors successfully')
  async findAll(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return await this.sensorService.findAll(+currentPage, +limit, qs);
  }

  @Get('count')
  @ResponseMessage('Retrieved sensor count successfully')
  async count(@Query() qs: string) {
    return await this.sensorService.count(qs);
  }

  @Get(':id')
  @ResponseMessage('Retrieved sensor successfully')
  async findOne(@Param('id') id: string) {
    return await this.sensorService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Sensor updated successfully')
  async update(@Param('id') id: string, @Body() updateDeviceDto: UpdateSensorDto, @ReqUser() user: IPayload) {
    return await this.sensorService.update(id, updateDeviceDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Sensor deleted successfully')
  async remove(@Param('id') id: string, @ReqUser() user: IPayload) {
    return await this.sensorService.remove(id, user);
  }

  @Patch(':id/restore')
  @ResponseMessage('Sensor restored successfully')
  async restore(@Param('id') id: string) {
    return await this.sensorService.restore(id);
  }

  @Patch(':id/toggle-status')
  @ResponseMessage('Sensor status toggled successfully')
  async toggleActive(@Param('id') id: string, @Body('status') status: boolean) {
    return await this.sensorService.updateStatus(id, status);
  }
}
