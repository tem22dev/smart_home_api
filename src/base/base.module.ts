import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import * as controllers from './controllers';
import { AuthModule } from '@/auth';
import { MqttService } from './services';
import { DeviceModule } from '@/device';

@Module({
  imports: [TerminusModule, HttpModule, AuthModule, forwardRef(() => DeviceModule)],
  controllers: Object.values(controllers),
  providers: [MqttService],
  exports: [MqttService],
})
export class BaseModule {}
