import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({ description: 'Workspace organization ID', example: 'org-default' })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({ description: 'Group ID this duty requirement belongs to', example: 'grp-solaris' })
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @ApiPropertyOptional({ description: 'Parent task ID if this is a sub-slot position' })
  @IsOptional()
  @IsString()
  parentTaskId?: string;

  @ApiProperty({ description: 'Item name or duty position', example: 'Heavy Audio Rig' })
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @ApiPropertyOptional({ enum: ['INVENTORY', 'SPECIAL_TASK'], default: 'INVENTORY' })
  @IsOptional()
  @IsEnum(['INVENTORY', 'SPECIAL_TASK'])
  category?: 'INVENTORY' | 'SPECIAL_TASK';

  @ApiPropertyOptional({ enum: ['MALE_ONLY', 'FEMALE_ONLY', 'ANY'], default: 'ANY' })
  @IsOptional()
  @IsEnum(['MALE_ONLY', 'FEMALE_ONLY', 'ANY'])
  assignedGender?: 'MALE_ONLY' | 'FEMALE_ONLY' | 'ANY';

  @ApiPropertyOptional({ description: 'Required number of performers', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  requiredHeadcount?: number;

  @ApiPropertyOptional({ description: 'Stage cue or position', example: 'Stage Left' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'Handling instructions or safety clearance notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ['EVERY_SHOW', 'WEEKLY', 'MONTHLY', 'FIXED', 'CUSTOM'], default: 'EVERY_SHOW' })
  @IsOptional()
  @IsEnum(['EVERY_SHOW', 'WEEKLY', 'MONTHLY', 'FIXED', 'CUSTOM'])
  rotationCycle?: 'EVERY_SHOW' | 'WEEKLY' | 'MONTHLY' | 'FIXED' | 'CUSTOM';

  @ApiPropertyOptional({ description: 'Custom rotation numeric value' })
  @IsOptional()
  @IsInt()
  @Min(1)
  customRotationValue?: number;

  @ApiPropertyOptional({ enum: ['SHOW', 'DAY', 'WEEK'] })
  @IsOptional()
  @IsEnum(['SHOW', 'DAY', 'WEEK'])
  customRotationUnit?: 'SHOW' | 'DAY' | 'WEEK';

  @ApiPropertyOptional({ description: 'Pinned fixed talent ID' })
  @IsOptional()
  @IsString()
  pinnedTalentId?: string;

  @ApiPropertyOptional({ description: 'Pinned sub-pool talent IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pinnedTalentIds?: string[];
}
