import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class PinTalentDto {
  @ApiPropertyOptional({
    description: 'Whether performer is exclusively pinned (true) or part of a sub-pool (false)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isExclusive?: boolean = true;
}
