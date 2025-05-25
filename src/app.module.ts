import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Connection } from 'mongoose';
import { LoggerModule } from 'nestjs-pino';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';

import { loggerOptions } from './config';
import { AuthModule } from './auth';
import { BaseModule } from './base';
import { UserModule } from './shared/user';

@Module({
  imports: [
    // https://github.com/iamolegga/nestjs-pino
    LoggerModule.forRoot(loggerOptions),

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
    // AuthModule,
    // BaseModule,
    UserModule,
  ],
  providers: [],
})
export class AppModule {}
