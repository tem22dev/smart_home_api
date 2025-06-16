import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSensorHistoryDto {
  @IsNotEmpty({ message: 'Mã cảm biến không được để trống' })
  sensorId: string;

  @IsNotEmpty({ message: 'Giá trị không được để trống' })
  value: any;

  @IsOptional()
  unit?: string;
}
