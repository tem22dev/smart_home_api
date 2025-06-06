import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

import { CreateDeviceDto, UpdateDeviceDto } from './dto';
import { Device, DeviceDocument } from '@/schemas/device';
import { IPayload } from '@/auth';
import aqp from 'api-query-params';
import { parse } from 'qs';
import mongoose from 'mongoose';
import { SensorHistory, SensorHistoryDocument } from '@/schemas/sensor-history';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name) private deviceModel: SoftDeleteModel<DeviceDocument>,
    @InjectModel(SensorHistory.name) private sensorHistoryModel: SoftDeleteModel<SensorHistoryDocument>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto, user: IPayload) {
    const isExist = await this.deviceModel.findOne({
      deviceId: createDeviceDto.deviceId,
    });

    if (isExist) {
      throw new BadRequestException('Mã thiết bị đã tồn tại');
    }

    const device = await this.deviceModel.create({
      ...createDeviceDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    const result = device.toObject();

    return { result, id: result._id?.toString() };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.deviceModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.deviceModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select({ ...projection })
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const result = await this.deviceModel.findById(id).exec();

    if (!result) throw new NotFoundException('User not found');

    return { result };
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto, user: IPayload) {
    const result = await this.deviceModel
      .updateOne(
        { _id: id },
        {
          ...updateDeviceDto,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      )
      .exec();

    return { result };
  }

  async remove(id: string, user: IPayload) {
    await this.deviceModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    const result = await this.deviceModel.softDelete({ _id: id });

    return { result };
  }

  async findDeleted(currentPage: number, limit: number, qs: string) {
    const parsedQs = parse(qs);
    const { filter, sort, population, projection } = aqp(parsedQs as any);

    delete filter.page;
    delete filter.limit;

    filter.isDeleted = true;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.deviceModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.deviceModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select({ ...projection })
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
    const foundDevice = await this.deviceModel.findOne({ _id: id, isDeleted: true }).lean().exec();
    if (!foundDevice) {
      throw new NotFoundException('User not found or not deleted');
    }
    const restoredUser = await this.deviceModel.restore({ _id: id });

    return { result: restoredUser };
  }

  async updateStatus(id: string, status: 'on' | 'off') {
    const result = await this.deviceModel.updateOne({ _id: id }, { status }).exec();

    return { result };
  }

  async updateSensorValue(id: string, sensorId: string, value: any, unit: string) {
    const device = await this.deviceModel
      .findOneAndUpdate(
        { _id: id },
        { $set: { [`sensors.${sensorId}.value`]: value, [`sensors.${sensorId}.unit`]: unit } },
        { new: true },
      )
      .exec();

    if (device) {
      await this.sensorHistoryModel.create({
        deviceId: device._id,
        sensorId,
        value,
        unit,
      });
    }

    return { result: device };
  }

  async updateActuatorState(id: string, actuatorId: string, state: boolean) {
    const result = await this.deviceModel
      .findOneAndUpdate({ _id: id }, { $set: { [`actuators.${actuatorId}.state`]: state } }, { new: true })
      .exec();

    return { result };
  }
}
