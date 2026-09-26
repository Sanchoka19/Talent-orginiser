import { PartialType } from '@nestjs/swagger';
import { CreateDutyDto } from './create-duty.dto.js';

export class UpdateDutyDto extends PartialType(CreateDutyDto) {}
