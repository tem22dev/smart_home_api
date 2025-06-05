import { IsNotEmpty, IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class SensorConfigDto {
  @IsInt({ message: 'Chân GPIO của cảm biến phải là số nguyên' })
  @IsNotEmpty({ message: 'Chân GPIO của cảm biến không được để trống' })
  pin: number;

  @IsString({ message: 'Loại cảm biến phải là chuỗi' })
  @IsNotEmpty({ message: 'Loại cảm biến không được để trống' })
  type: string;

  @IsOptional()
  @IsString({ message: 'Đơn vị của cảm biến phải là chuỗi' })
  unit?: string;

  @IsOptional()
  value?: any;
}

export class ActuatorConfigDto {
  @IsInt({ message: 'Chân GPIO của thiết bị điều khiển phải là số nguyên' })
  @IsNotEmpty({ message: 'Chân GPIO của thiết bị điều khiển không được để trống' })
  pin: number;

  @IsString({ message: 'Loại thiết bị điều khiển phải là chuỗi' })
  @IsNotEmpty({ message: 'Loại thiết bị điều khiển không được để trống' })
  type: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  state?: boolean;
}
