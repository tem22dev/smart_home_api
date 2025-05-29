import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

import { User, UserDocument } from '@/schemas/user';
import { getHashPassword } from '@/shared/user/user.util';
import { Gender, Role } from '@/shared/enums';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');

    if (isInit === 'true') {
      await this.initializeData();
    }
  }

  private async initializeData() {
    // Initialize users
    const userCount = await this.userModel.countDocuments({});
    if (userCount === 0) {
      await this.userModel.insertMany([
        {
          _id: '6837f3e99113dd792bf4daf3',
          fullName: 'Admin',
          email: this.configService.get<string>('EMAIL_ADMIN'),
          phone: '0987654321',
          password: getHashPassword(this.configService.get<string>('INIT_PASSWORD') || '123456'),
          age: 30,
          gender: Gender.Male,
          address: 'vietnam',
          roles: Role.Admin,
          active: true,
        },
        {
          _id: '6837f3e99113dd792bf4daf4',
          fullName: 'trungem',
          email: 'trungem@gmail.com',
          phone: '0912345678',
          password: getHashPassword(this.configService.get<string>('INIT_PASSWORD') || '123456'),
          age: 20,
          gender: Gender.Male,
          address: 'KG - AG - Vietnam',
          roles: Role.User,
          active: true,
          createdBy: {
            _id: '6837f3e99113dd792bf4daf3',
            email: this.configService.get<string>('EMAIL_ADMIN'),
          },
        },
      ]);
    }

    if (userCount > 0) {
      this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
    }
  }
}
