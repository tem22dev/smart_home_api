import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { UserService } from '@/shared/user';
import { User, UserSchema } from '@/schemas/user';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [DatabaseController],
  providers: [DatabaseService, UserService],
})
export class DatabaseModule {}
