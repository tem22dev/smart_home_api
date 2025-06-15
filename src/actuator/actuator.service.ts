import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateActuatorDto, UpdateActuatorDto } from './dto';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IPayload } from '@/auth';
import aqp from 'api-query-params';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Actuator, ActuatorDocument } from '@/schemas/actuator';
import { parse } from 'qs';

@Injectable()
export class ActuatorService {
  constructor(@InjectModel(Actuator.name) private sensorModel: SoftDeleteModel<ActuatorDocument>) {}

  async create(createActuatorDto: CreateActuatorDto, user: IPayload) {
    const result = await this.sensorModel.create({
      ...createActuatorDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return { result };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.sensorModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.sensorModel
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

    const result = await this.sensorModel.findById(id).populate({ path: 'deviceId' }).exec();

    if (!result) throw new NotFoundException('Sensor not found');

    return { result };
  }

  async update(id: string, updateActuatorDto: UpdateActuatorDto, user: IPayload) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const result = await this.sensorModel
      .updateOne(
        { _id: id },
        {
          ...updateActuatorDto,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      )
      .exec();

    return { result };
  }

  async updateSocket(id: string, updateActuatorDto: UpdateActuatorDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const result = await this.sensorModel
      .updateOne(
        { _id: id },
        {
          ...updateActuatorDto,
        },
      )
      .exec();

    return { result };
  }

  async remove(id: string, user: IPayload) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    await this.sensorModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    const result = await this.sensorModel.softDelete({ _id: id });

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

    const totalItems = await this.sensorModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.sensorModel
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
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const foundDevice = await this.sensorModel.findOne({ _id: id, isDeleted: true }).lean().exec();
    if (!foundDevice) throw new NotFoundException('Sensor not found or not deleted');

    const restoredSensor = await this.sensorModel.restore({ _id: id });

    return { result: restoredSensor };
  }

  async updateStatus(id: string, status: boolean) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const result = await this.sensorModel.updateOne({ _id: id }, { status }).exec();

    return { result };
  }
}
