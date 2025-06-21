import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateActuatorDto, UpdateActuatorDto } from './dto';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IPayload } from '@/auth';
import aqp from 'api-query-params';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Actuator, ActuatorDocument } from '@/schemas/actuator';
import { parse } from 'qs';
import { DeviceService } from '@/device';

@Injectable()
export class ActuatorService {
  constructor(
    @InjectModel(Actuator.name) private actuatorModel: SoftDeleteModel<ActuatorDocument>,

    private readonly deviceService: DeviceService,
  ) {}

  async create(createActuatorDto: CreateActuatorDto, user: IPayload) {
    const result = await this.actuatorModel.create({
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

    const totalItems = await this.actuatorModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.actuatorModel
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

    const result = await this.actuatorModel.findById(id).populate({ path: 'deviceId' }).exec();

    if (!result) throw new NotFoundException('Actuator not found');

    return { result };
  }

  async update(id: string, updateActuatorDto: UpdateActuatorDto, user: IPayload) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const result = await this.actuatorModel
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

    const result = await this.actuatorModel
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

    await this.actuatorModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    const result = await this.actuatorModel.softDelete({ _id: id });

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

    const totalItems = await this.actuatorModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.actuatorModel
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

    const foundDevice = await this.actuatorModel.findOne({ _id: id, isDeleted: true }).lean().exec();
    if (!foundDevice) throw new NotFoundException('Actuator not found or not deleted');

    const restoredActuator = await this.actuatorModel.restore({ _id: id });

    return { result: restoredActuator };
  }

  async updateStatus(id: string, status: boolean) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const result = await this.actuatorModel.updateOne({ _id: id }, { status }).exec();

    return { result };
  }

  async getActuatorsByDeviceCode(deviceCode: string) {
    const device = await this.deviceService.findByDeviceCode(deviceCode);
    if (!device) {
      throw new NotFoundException(`Device with code ${deviceCode} not found`);
    }

    const idDevice = (device.result as { _id: mongoose.Types.ObjectId })._id.toString();
    const actuators = await this.actuatorModel.find({ deviceId: idDevice }).populate('deviceId', 'deviceCode').exec();

    const config = {
      // deviceCode,
      actuators: actuators.map((actuator) => ({
        id: (actuator._id as mongoose.Types.ObjectId).toString(),
        pin: actuator.pin,
        type: actuator.type,
        minAngle: actuator.minAngle || 0,
        maxAngle: actuator.maxAngle || 0,
        status: actuator.status || false,
      })),
    };

    return config;
  }
}
