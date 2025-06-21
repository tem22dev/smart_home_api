import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsString({ message: 'Tên thiết bị phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên thiết bị không được để trống' })
  name: string;

  @IsString({ message: 'Mã thiết bị phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã thiết bị không được để trống' })
  deviceCode: string;

  @IsString({ message: 'Loại thiết bị phải là chuỗi' })
  @IsNotEmpty({ message: 'Loại thiết bị không được để trống' })
  deviceType: string;

  @IsOptional()
  @IsString({ message: 'Ảnh thiết bị phải là chuỗi' })
  image: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  status: boolean;

  @IsOptional()
  description: string;
}
