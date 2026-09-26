import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

export class FindSchedulesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by organization ID' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Filter shows by group/troupe ID' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Filter shows by venue/hotel ID' })
  @IsOptional()
  @IsString()
  hotelId?: string;

  @ApiPropertyOptional({ enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] })
  @IsOptional()
  @IsEnum(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

  @ApiPropertyOptional({ description: 'Start date range lower bound (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Start date range upper bound (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
