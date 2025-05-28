import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from './dto';
import { ReqUser, ResponseMessage, Roles, RolesGuard } from '@/common';
import { IPayload } from '@/auth';

@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
  @ResponseMessage('User created successfully')
  create(@Body() createUserDto: CreateUserDto, @ReqUser() user: IPayload) {
    return this.userService.create(createUserDto, user);
  }

  @Get('deleted')
  @Roles('admin')
  @ResponseMessage('Retrieved deleted users successfully')
  findAllDeleted(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return this.userService.findDeleted(+currentPage, +limit, qs);
  }

  @Get()
  @Roles('admin')
  @ResponseMessage('Retrieved all users successfully')
  findAll(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return this.userService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Retrieved user successfully')
  findOne(@Param('id') id: string, @ReqUser() user: IPayload) {
    return this.userService.findOne(id, user);
  }

  @Patch(':id')
  @ResponseMessage('User updated successfully')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @ReqUser() user: IPayload) {
    return this.userService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @Roles('admin')
  @ResponseMessage('User deleted successfully')
  remove(@Param('id') id: string, @ReqUser() user: IPayload) {
    return this.userService.remove(id, user);
  }

  @Patch(':id/restore')
  @Roles('admin')
  @ResponseMessage('User restored successfully')
  restore(@Param('id') id: string) {
    return this.userService.restore(id);
  }

  @Patch(':id/toggle-active')
  @Roles('admin')
  @ResponseMessage('User active status toggled successfully')
  toggleActive(@Param('id') id: string, @Body('active') active: boolean, @ReqUser() user: IPayload) {
    return this.userService.toggleActive(id, active, user);
  }

  @Patch(':id/password')
  @ResponseMessage('Password updated successfully')
  updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto, @ReqUser() user: IPayload) {
    return this.userService.updatePassword(id, updatePasswordDto, user);
  }
}
