import { PartialType } from '@nestjs/swagger';
import { CreateTalentDto } from './create-talent.dto.js';

export class UpdateTalentDto extends PartialType(CreateTalentDto) {}
