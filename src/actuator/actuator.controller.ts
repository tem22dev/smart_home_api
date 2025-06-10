import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ActuatorService } from './actuator.service';
import { CreateActuatorDto } from './dto/create-actuator.dto';
import { UpdateActuatorDto } from './dto/update-actuator.dto';
import { ReqUser, ResponseMessage } from '@/common';
import { IPayload } from '@/auth';

@Controller('actuators')
export class ActuatorController {
  constructor(private readonly actuatorService: ActuatorService) {}

  @Post()
  @ResponseMessage('Actuator created successfully')
  async create(@Body() createActuatorDto: CreateActuatorDto, @ReqUser() user: IPayload) {
    return await this.actuatorService.create(createActuatorDto, user);
  }

  @Get('deleted')
  @ResponseMessage('Retrieved deleted actuator successfully')
  async findAllDeleted(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return await this.actuatorService.findDeleted(+currentPage, +limit, qs);
  }

  @Get()
  @ResponseMessage('Retrieved all actuators successfully')
  async findAll(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return await this.actuatorService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Retrieved actuator successfully')
  async findOne(@Param('id') id: string) {
    return await this.actuatorService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Actuator updated successfully')
  async update(@Param('id') id: string, @Body() updateDeviceDto: UpdateActuatorDto, @ReqUser() user: IPayload) {
    return await this.actuatorService.update(id, updateDeviceDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Actuator deleted successfully')
  async remove(@Param('id') id: string, @ReqUser() user: IPayload) {
    return await this.actuatorService.remove(id, user);
  }

  @Patch(':id/restore')
  @ResponseMessage('Actuator restored successfully')
  async restore(@Param('id') id: string) {
    return await this.actuatorService.restore(id);
  }

  @Patch(':id/toggle-status')
  @ResponseMessage('Actuator status toggled successfully')
  async toggleActive(@Param('id') id: string, @Body('status') status: boolean) {
    return await this.actuatorService.updateStatus(id, status);
  }
}
