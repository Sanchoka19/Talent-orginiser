import { PartialType } from '@nestjs/swagger';
import { CreateVenueDto } from './create-venue.dto.js';

export class UpdateVenueDto extends PartialType(CreateVenueDto) {}
