import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { User } from '../user';

export type AccessLogDocument = HydratedDocument<AccessLog>;

@Schema({ timestamps: true, collection: 'access_logs' })
export class AccessLog extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: User.name, required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AccessLogSchema = SchemaFactory.createForClass(AccessLog);
