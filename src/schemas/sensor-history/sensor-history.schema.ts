import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Sensor } from '../sensor';

export type SensorHistoryDocument = HydratedDocument<SensorHistory>;

@Schema({ timestamps: true, collection: 'sensor_history' })
export class SensorHistory extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: Sensor.name, required: true })
  sensorId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  value: any;

  @Prop({ required: true })
  unit: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SensorHistorySchema = SchemaFactory.createForClass(SensorHistory);

SensorHistorySchema.index({ sensorId: 1, timestamp: -1 });
