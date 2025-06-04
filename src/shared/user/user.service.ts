import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { parse } from 'qs';

import { User, UserDocument } from '@/schemas/user';
import { getHashPassword, isValidPassword } from './user.util';
import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from './dto';
import { IPayload } from '@/auth';
import { UpdatePasswordAdminDto } from './dto/update-password-admin.dto';

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

    const adminEmail = this.configService.get<string>('EMAIL_ADMIN');
    filter.email = { ...(filter.email || {}), $ne: adminEmail };

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.userModel.countDocuments(filter);
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
        pagination: {
          currentPage,
          pageSize: limit,
          pages: totalPages,
          total: totalItems,
        },
      },
    };
  }

  async findOne(id: string, user: IPayload) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const userView = await this.userModel.findById(id).select('-password -refreshToken').lean().exec();

    if (!userView) {
      throw new NotFoundException('User not found');
    }

    const adminEmail = this.configService.get<string>('EMAIL_ADMIN');

    if (userView.email === adminEmail && user.email !== adminEmail) {
      throw new BadRequestException('You cannot view the admin user');
    }

    return { result: userView };
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IPayload) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check exist email or phone
    const isExist = await this.userModel.findOne({
      _id: { $ne: id },
      $or: [{ email: updateUserDto.email }, { phone: updateUserDto.phone }],
    });

    if (isExist) {
      throw new BadRequestException(
        isExist.email === updateUserDto.email ? 'Email already exists' : 'Phone number already exists',
      );
    }

    const userUpdate = await this.userModel.findById(id).select('email').lean().exec();

    if (!userUpdate) {
      throw new NotFoundException('User not found');
    }

    const adminEmail = this.configService.get<string>('EMAIL_ADMIN');
    if (userUpdate.email === adminEmail && user.email !== adminEmail) {
      throw new BadRequestException('You cannot update the admin user');
    }

    if (userUpdate.email === adminEmail && user.email === adminEmail && updateUserDto.email !== adminEmail) {
      throw new BadRequestException('You cannot change the admin user email');
    }

    if (userUpdate.email === adminEmail && user.email === adminEmail && updateUserDto.active === false) {
      throw new BadRequestException('You cannot change the admin user active status');
    }
    console.log('updateUserDto', updateUserDto);

    const result = await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return { result };
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

  async findDeleted(currentPage: number, limit: number, qs: string) {
    const parsedQs = parse(qs);
    const { filter, sort, population, projection } = aqp(parsedQs as any);

    delete filter.page;
    delete filter.limit;

    filter.isDeleted = true;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.userModel.countDocuments(filter);
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
        pagination: {
          currentPage,
          pageSize: limit,
          pages: totalPages,
          total: totalItems,
        },
      },
    };
  }

  async restore(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const foundUser = await this.userModel.findOne({ _id: id, isDeleted: true }).lean().exec();
    if (!foundUser) {
      throw new NotFoundException('User not found or not deleted');
    }

    const restoredUser = await this.userModel.restore({ _id: id });
    await this.userModel.updateOne({ _id: id }, { active: true });

    return { result: restoredUser };
  }

  async toggleActive(id: string, active: boolean, user: IPayload) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const userUpdate = await this.userModel.findById(id).lean().exec();
    if (!userUpdate) {
      throw new NotFoundException('User not found');
    }

    const result = await this.userModel.updateOne(
      { _id: id },
      {
        active,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return { result };
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto, user: IPayload) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const currentUser = await this.userModel.findById(id).select('+password').lean().exec();
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const adminEmail = this.configService.get<string>('EMAIL_ADMIN');
    if (currentUser.email === adminEmail && user.email !== adminEmail) {
      throw new BadRequestException('You cannot update the admin user password');
    }
    if (currentUser._id.toString() !== user._id.toString() && user.email !== adminEmail) {
      throw new BadRequestException('You can only update your own password');
    }

    const isPasswordValid = isValidPassword(updatePasswordDto.currentPassword, currentUser.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (updatePasswordDto.newPassword !== updatePasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const hashedNewPassword = getHashPassword(updatePasswordDto.newPassword);

    const result = await this.userModel.updateOne(
      { _id: id },
      {
        password: hashedNewPassword,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    await this.incrementTokenVersion(id);

    return { result };
  }

  async updatePasswordAdmin(id: string, updatePasswordAdminDto: UpdatePasswordAdminDto, user: IPayload) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const currentUser = await this.userModel.findById(id).select('+password').lean().exec();
    if (!currentUser) throw new NotFoundException('User not found');

    if (updatePasswordAdminDto.newPassword !== updatePasswordAdminDto.confirmPassword)
      throw new BadRequestException('New password and confirm password do not match');

    const hashedNewPassword = getHashPassword(updatePasswordAdminDto.newPassword);

    const result = await this.userModel.updateOne(
      { _id: id },
      {
        password: hashedNewPassword,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    await this.incrementTokenVersion(id);

    return { result };
  }

  async findOneUsername(username: string) {
    const user = await this.userModel.findOne({ $or: [{ email: username }, { phone: username }] });

    if (!user) {
      throw new NotFoundException('User not found');
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
