import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

import { Gender, Role } from '@/shared/enums';
import { Exclude } from 'class-transformer';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Exclude()
  @Prop({ required: true })
  password: string;

  @Prop()
  age: number;

  @Prop({ enum: Gender })
  gender: Gender;

  @Prop()
  address: string;

  @Prop({ required: true, enum: Role, default: [Role.User], type: [String] })
  roles: Role[];

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Exclude()
  @Prop()
  refreshToken: string;

  @Prop({ default: 0 })
  tokenVersion: number;

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
  isDeleted: Boolean;

  @Prop()
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
