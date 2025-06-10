import { CreateDeviceDto } from './create-device.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateDeviceDto extends OmitType(CreateDeviceDto, <const>['deviceCode']) {}
