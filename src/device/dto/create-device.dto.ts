import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsString({ message: 'Tên thiết bị phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên thiết bị không được để trống' })
  name: string;

  sensors?: { [key: string]: { pin: number; type: string; value?: any; unit?: string } };

  actuators?: { [key: string]: { pin: number; type: string; state?: boolean } };

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  isActive: boolean;
}
