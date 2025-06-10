import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateActuatorDto {
  @IsNotEmpty({ message: 'Mã thiết bị không được để trống' })
  deviceId: mongoose.Schema.Types.ObjectId;

  @IsString({ message: 'Tên thiết bị chấp hành phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên thiết bị chấp hành không được để trống' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Ảnh thiết bị chấp hành phải là chuỗi' })
  image: string;

  @IsInt({ message: 'Chân pin phải là số nguyên' })
  @IsNotEmpty({ message: 'Chân pin không được để trống' })
  pin: number;

  @IsString({ message: 'Loại thiết bị chấp hành phải là chuỗi' })
  @IsNotEmpty({ message: 'Loại thiết bị chấp hành không được để trống' })
  type: string;

  @IsOptional()
  minAngle: number;

  @IsOptional()
  maxAngle: number;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  status: boolean;

  @IsOptional()
  description: string;
}
