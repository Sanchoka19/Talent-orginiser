import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

export class FindTalentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by organization ID' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Search by first name, last name, skill, or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'REST', 'SICK_INJURED', 'TERMINATED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'REST', 'SICK_INJURED', 'TERMINATED'])
  status?: 'ACTIVE' | 'REST' | 'SICK_INJURED' | 'TERMINATED';

  @ApiPropertyOptional({ description: 'Filter by archive status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isArchived?: boolean;
}
