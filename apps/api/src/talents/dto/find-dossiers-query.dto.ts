import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

export class FindDossiersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by organization ID' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Filter reviews by year', example: 2025 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ enum: ['COMPLETED', 'TERMINATED'] })
  @IsOptional()
  @IsEnum(['COMPLETED', 'TERMINATED'])
  contractStatus?: 'COMPLETED' | 'TERMINATED';

  @ApiPropertyOptional({ enum: ['ELIGIBLE', 'NEUTRAL', 'DO_NOT_REHIRE', 'UNDER_REVIEW'] })
  @IsOptional()
  @IsEnum(['ELIGIBLE', 'NEUTRAL', 'DO_NOT_REHIRE', 'UNDER_REVIEW'])
  rehireStatus?: 'ELIGIBLE' | 'NEUTRAL' | 'DO_NOT_REHIRE' | 'UNDER_REVIEW';
}
