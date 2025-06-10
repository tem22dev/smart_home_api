import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateSensorDto {
  @IsNotEmpty({ message: 'Mã thiết bị không được để trống' })
  deviceId: mongoose.Schema.Types.ObjectId;

  @IsString({ message: 'Tên cảm biến phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên cảm biến không được để trống' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Ảnh cảm biến phải là chuỗi' })
  image: string;

  @IsInt({ message: 'Chân pin phải là số nguyên' })
  @IsNotEmpty({ message: 'Chân pin không được để trống' })
  pin: number;

  @IsString({ message: 'Loại cảm biến phải là chuỗi' })
  @IsNotEmpty({ message: 'Loại cảm biến không được để trống' })
  type: string;

  @IsOptional()
  @IsString({ message: 'Đơn vị cảm biến phải là chuỗi' })
  unit: string;

  @IsOptional()
  threshold: number;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  status: boolean;

  @IsOptional()
  description: string;
}
