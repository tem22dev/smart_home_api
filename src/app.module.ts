import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Connection } from 'mongoose';
import { LoggerModule } from 'nestjs-pino';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { loggerOptions } from './config';
import { AuthModule } from './auth';
import { BaseModule } from './base';
import { UserModule } from './shared/user';
import { ExceptionsFilter } from './common';
import { DatabaseModule } from './database';
// import { CommonModule } from './common';
import { UploadModule } from './upload';
import { DeviceModule } from './device';
import { SensorModule } from './sensor';
import { ActuatorModule } from './actuator';
import { SensorHistoryModule } from './sensor-history';
@Module({
  imports: [
    // https://github.com/iamolegga/nestjs-pino
    LoggerModule.forRoot(loggerOptions),

    // https://docs.nestjs.com/security/rate-limiting
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),

    // Import MongooseModule with async configuration
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/mydatabase',
        connectionFactory: (connection: Connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    // Static folder
    ServeStaticModule.forRoot({
      rootPath: `${__dirname}/../../public`,
      renderPath: '/',
    }),

    // Makes the configuration available globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Modules
    AuthModule,
    // CommonModule,
    UploadModule,
    DeviceModule,
    BaseModule,
    UserModule,
    DatabaseModule,
    SensorModule,
    ActuatorModule,
    SensorHistoryModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
