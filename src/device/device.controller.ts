import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto, UpdateDeviceDto } from './dto';
import { ReqUser, ResponseMessage } from '@/common';
import { IPayload } from '@/auth';
import { MqttService } from '@/base/services';

@Controller('devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly mqttService: MqttService,
  ) {}

  @Post()
  @ResponseMessage('Device created successfully')
  async create(@Body() createDeviceDto: CreateDeviceDto, @ReqUser() user: IPayload) {
    return await this.deviceService.create(createDeviceDto, user);
  }

  @Get('deleted')
  @ResponseMessage('Retrieved deleted devices successfully')
  findAllDeleted(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return this.deviceService.findDeleted(+currentPage, +limit, qs);
  }

  @Get()
  @ResponseMessage('Retrieved all devices successfully')
  async findAll(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return await this.deviceService.findAll(+currentPage, +limit, qs);
  }

  @Get('count')
  @ResponseMessage('Retrieved devices count successfully')
  async count(@Query() qs: string) {
    return await this.deviceService.count(qs);
  }

  @Get(':id')
  @ResponseMessage('Retrieved device successfully')
  async findOne(@Param('id') id: string) {
    return await this.deviceService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Device updated successfully')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto, @ReqUser() user: IPayload) {
    return this.deviceService.update(id, updateDeviceDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Device deleted successfully')
  remove(@Param('id') id: string, @ReqUser() user: IPayload) {
    return this.deviceService.remove(id, user);
  }

  @Patch(':id/restore')
  @ResponseMessage('Device restored successfully')
  restore(@Param('id') id: string) {
    return this.deviceService.restore(id);
  }

  @Patch(':id/toggle-status')
  @ResponseMessage('Device status toggled successfully')
  toggleActive(@Param('id') id: string, @Body('status') status: boolean) {
    return this.deviceService.updateStatus(id, status);
  }
}
