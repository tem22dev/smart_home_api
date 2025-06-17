import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { AccessLog, AccessLogDocument } from '@/schemas/access-log';
import aqp from 'api-query-params';

@Injectable()
export class AccessLogService {
  constructor(@InjectModel(AccessLog.name) private accessLogModel: SoftDeleteModel<AccessLogDocument>) {}

  async logAccess(userId: string, ipAddress: string, userAgent: string) {
    const result = await this.accessLogModel.create({
      userId,
      ipAddress,
      userAgent,
    });

    return { result };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.accessLogModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.accessLogModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select({ ...projection })
      .populate({ path: 'userId', select: { fullName: 1, email: 1 } })
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

  async count(qs: string) {
    const { filter } = aqp(qs);
    const total = await this.accessLogModel.countDocuments(filter);
    return { total };
  }
}
