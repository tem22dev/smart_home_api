import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ReqUser } from '@/common/decorators';
import { IPayload } from '@/auth';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @ReqUser() user: IPayload) {
    return this.userService.create(createUserDto, user);
  }

  @Get()
  findAll(@Query('page') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
    return this.userService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @ReqUser() user: IPayload) {
    return this.userService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @ReqUser() user: IPayload) {
    return this.userService.remove(id, user);
  }
}
