import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '@/shared/user';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ms from 'ms';

import { JwtStrategy, LocalStrategy } from './strategies';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: ms(configService.get<string>('JWT_ACCESS_EXPIRATION') as ms.StringValue) / 1000,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
