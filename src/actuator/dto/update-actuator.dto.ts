import { PartialType } from '@nestjs/swagger';
import { CreateActuatorDto } from './create-actuator.dto';

export class UpdateActuatorDto extends PartialType(CreateActuatorDto) {}
