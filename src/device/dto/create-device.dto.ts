import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsString({ message: 'Tên thiết bị phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên thiết bị không được để trống' })
  name: string;

  @IsString({ message: 'Mã thiết bị phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã thiết bị không được để trống' })
  deviceId: string;

  @IsOptional()
  @IsString({ message: 'Ảnh thiết bị phải là chuỗi' })
  image: string;

  @IsOptional()
  sensors?: {
    [key: string]: { pin: number; image?: string; type: string; value?: any; unit?: string; threshold?: number };
  };

  @IsOptional()
  actuators?: {
    [key: string]: { pin: number; image?: string; type: string; state?: boolean; minAngle?: number; maxAngle?: number };
  };

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  isActive: boolean;

  @IsOptional()
  description: string;
}
