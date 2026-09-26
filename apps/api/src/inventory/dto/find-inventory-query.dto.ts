import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

export class FindInventoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by troupe group ID' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Filter by workspace organization ID' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Search duty requirement by item name or position' })
  @IsOptional()
  @IsString()
  search?: string;
}
