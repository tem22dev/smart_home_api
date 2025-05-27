import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

import { User, UserDocument } from '@/schemas/user';
import { getHashPassword } from './user.util';
import { CreateUserDto, UpdateUserDto } from './dto';
import { IPayload } from '@/auth';

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto, user: IPayload) {
    const isExist = await this.userModel.findOne({
      $or: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
    });

    if (isExist) {
      throw new BadRequestException(
        isExist.email === createUserDto.email ? 'Email already exists' : 'Phone number already exists',
      );
    }

    const hashedPassword = getHashPassword(createUserDto.password);

    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    const { password, refreshToken, ...result } = newUser.toObject();

    return { result };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select({ ...projection, password: 0, refreshToken: 0 })
      .populate(population)
      .exec();

    return {
      result,
      metadata: {
        currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id).select('-password -refreshToken').lean().exec();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return { result: user };
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IPayload) {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid user ID');
    }

    const userUpdate = await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return {
      result: userUpdate,
    };
  }

  async remove(id: string, user: IPayload) {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid user ID');
    }

    const founduser = await this.userModel.findById(id);
    if (founduser && founduser.email === this.configService.get<string>('EMAIL_ADMIN')) {
      throw new BadRequestException('You cannot delete the admin user');
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    const deletedUser = await this.userModel.softDelete({ _id: id });

    return { result: deletedUser };
  }

  async findOneUsername(username: string) {
    const user = await this.userModel.findOne({ $or: [{ email: username }, { phone: username }] });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async findUserByToken(refreshToken: string) {
    return await this.userModel.findOne({ refreshToken });
  }

  async updateRefreshToken(_id: string, refreshToken: string) {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  }
  async incrementTokenVersion(userId: string) {
    await this.userModel.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
  }
}
