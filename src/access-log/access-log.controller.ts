import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AccessLogService } from './access-log.service';
import { ResponseMessage, Roles, RolesGuard } from '@/common';

@UseGuards(RolesGuard)
@Controller('access-logs')
export class AccessLogController {
  constructor(private readonly accessLogService: AccessLogService) {}

  @Get()
  @Roles('admin')
  @ResponseMessage('Retrieved all access logged successfully')
  findAll(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return this.accessLogService.findAll(+currentPage, +limit, qs);
  }

  @Get('count')
  @ResponseMessage('Retrieved access logged count successfully')
  async count(@Query() qs: string) {
    return await this.accessLogService.count(qs);
  }
}
