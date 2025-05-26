import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import * as controllers from './controllers';
import { AuthModule } from '@/auth';

@Module({
  imports: [TerminusModule, HttpModule, AuthModule],
  controllers: Object.values(controllers),
})
export class BaseModule {}
