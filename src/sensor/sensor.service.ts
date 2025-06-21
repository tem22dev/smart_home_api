import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSensorDto, UpdateSensorDto } from './dto';
import { IPayload } from '@/auth';
import { InjectModel } from '@nestjs/mongoose';
import { Sensor, SensorDocument } from '@/schemas/sensor';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { parse } from 'qs';
import { DeviceService } from '@/device';

@Injectable()
export class SensorService {
  constructor(
    @InjectModel(Sensor.name) private sensorModel: SoftDeleteModel<SensorDocument>,
    private readonly deviceService: DeviceService,
  ) {}

  async create(createSensorDto: CreateSensorDto, user: IPayload) {
    const result = await this.sensorModel.create({
      ...createSensorDto,
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

    if (filter.deviceId && typeof filter.deviceId === 'object' && filter.deviceId.value) {
      filter.deviceId = filter.deviceId.value;
    }

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

  async update(id: string, updateSensorDto: UpdateSensorDto, user: IPayload) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const existingSensor = await this.sensorModel.findById(id).exec();
    if (!existingSensor) throw new NotFoundException('Sensor not found');

    const updatedData = {
      ...updateSensorDto,
      deviceId:
        typeof updateSensorDto.deviceId === 'object' &&
        updateSensorDto.deviceId !== null &&
        'value' in updateSensorDto.deviceId
          ? (updateSensorDto.deviceId as { value: string }).value
          : updateSensorDto.deviceId || existingSensor.deviceId,
      updatedBy: {
        _id: user._id,
        email: user.email,
      },
    };

    const result = await this.sensorModel
      .findByIdAndUpdate(id, { $set: updatedData }, { new: true, runValidators: true })
      .exec();

    if (!result) throw new NotFoundException('Sensor not found');

    return { result };
  }

  async updateSocket(id: string, updateSensorDto: UpdateSensorDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const result = await this.sensorModel
      .updateOne(
        { _id: id },
        {
          ...updateSensorDto,
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
        status: false,
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

  async count(qs: string) {
    const { filter } = aqp(qs);
    const total = await this.sensorModel.countDocuments(filter);
    return { total };
  }

  async getSensorsByDeviceCode(deviceCode: string) {
    const device = await this.deviceService.findByDeviceCode(deviceCode);
    if (!device) {
      throw new NotFoundException(`Device with code ${deviceCode} not found`);
    }

    const idDevice = (device.result as { _id: mongoose.Types.ObjectId })._id.toString();
    const sensors = await this.sensorModel.find({ deviceId: idDevice }).populate('deviceId', 'deviceCode').exec();

    const config = {
      // deviceCode,
      sensors: sensors.map((sensor) => ({
        id: (sensor._id as mongoose.Types.ObjectId).toString(),
        name: sensor.name,
        pin: sensor.pin,
        type: sensor.type,
        unit: sensor.unit,
        threshold: sensor.threshold || 0,
        status: sensor.status || false,
      })),
    };

    return config;
  }
}
