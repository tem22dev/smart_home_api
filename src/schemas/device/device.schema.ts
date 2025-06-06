import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema({ timestamps: true, collection: 'devices' })
export class Device extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  deviceId: string;

  @Prop({ required: true, default: 'images/sensor-default.png' })
  image: string;

  @Prop({ type: Object })
  sensors: {
    [sensorId: string]: {
      image?: string;
      pin: number;
      type: string;
      value?: any;
      unit?: string;
      threshold?: number;
    };
  };

  @Prop({ type: Object })
  actuators: {
    [actuatorId: string]: {
      image?: string;
      pin: number;
      type: string;
      state?: boolean;
      minAngle?: number;
      maxAngle?: number;
    };
  };

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: String, enum: ['on', 'off'], default: 'off' })
  status: string;

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

export const DeviceSchema = SchemaFactory.createForClass(Device);
