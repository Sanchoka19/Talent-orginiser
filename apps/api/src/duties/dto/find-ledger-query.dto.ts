import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

export class FindLedgerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by troupe group ID' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Filter by performer talent ID' })
  @IsOptional()
  @IsString()
  talentId?: string;

  @ApiPropertyOptional({ description: 'Filter by cycle key (e.g. 2026-C38_W1)' })
  @IsOptional()
  @IsString()
  cycleKey?: string;
}
