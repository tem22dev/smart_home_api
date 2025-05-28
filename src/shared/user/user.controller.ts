import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from './dto';
import { ReqUser, Roles } from '@/common/decorators';
import { IPayload } from '@/auth';
import { RolesGuard } from '@/common/guards';

@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto, @ReqUser() user: IPayload) {
    return this.userService.create(createUserDto, user);
  }

  @Get('deleted')
  @Roles('admin')
  findAllDeleted(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return this.userService.findDeleted(+currentPage, +limit, qs);
  }

  @Get()
  @Roles('admin')
  findAll(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return this.userService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @ReqUser() user: IPayload) {
    return this.userService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @ReqUser() user: IPayload) {
    return this.userService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @ReqUser() user: IPayload) {
    return this.userService.remove(id, user);
  }

  @Patch(':id/restore')
  @Roles('admin')
  restore(@Param('id') id: string) {
    return this.userService.restore(id);
  }

  @Patch(':id/toggle-active')
  @Roles('admin')
  toggleActive(@Param('id') id: string, @Body('active') active: boolean, @ReqUser() user: IPayload) {
    return this.userService.toggleActive(id, active, user);
  }

  @Patch(':id/password')
  updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto, @ReqUser() user: IPayload) {
    return this.userService.updatePassword(id, updatePasswordDto, user);
  }
}
