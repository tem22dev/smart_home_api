import { PartialType } from '@nestjs/swagger';
import { CreateSensorHistoryDto } from './create-sensor-history.dto';

export class UpdateSensorHistoryDto extends PartialType(CreateSensorHistoryDto) {}
