import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Device } from '../device';

export type SensorDocument = HydratedDocument<Sensor>;

@Schema({ timestamps: true, collection: 'sensors' })
export class Sensor extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: Device.name, required: true })
  deviceId: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  pin: number;

  @Prop({ required: true })
  type: string;

  @Prop()
  unit: string;

  @Prop()
  threshold: number;

  @Prop()
  status: boolean;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop()
  isDeleted: Boolean;
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);
