import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class InventoryRequirementInputDto {
  @ApiProperty({ description: 'Duty or equipment item name', example: 'Heavy Audio Rig' })
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

  @ApiPropertyOptional({ description: 'Required headcount for duty', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  requiredHeadcount?: number;

  @ApiPropertyOptional({ description: 'Stage position cue', example: 'Stage Left' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'Handling or rigging instructions' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ['EVERY_SHOW', 'WEEKLY', 'MONTHLY', 'FIXED', 'CUSTOM'], default: 'EVERY_SHOW' })
  @IsOptional()
  @IsEnum(['EVERY_SHOW', 'WEEKLY', 'MONTHLY', 'FIXED', 'CUSTOM'])
  rotationCycle?: 'EVERY_SHOW' | 'WEEKLY' | 'MONTHLY' | 'FIXED' | 'CUSTOM';

  @ApiPropertyOptional({ description: 'Pinned fixed talent ID' })
  @IsOptional()
  @IsString()
  pinnedTalentId?: string;

  @ApiPropertyOptional({ description: 'Pinned sub-pool talent IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pinnedTalentIds?: string[];
}

export class CreateGroupDto {
  @ApiProperty({ description: 'Workspace organization ID', example: 'org-default' })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({ description: 'Troupe or cast ensemble name', example: 'Solaris Cirque Troupe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Troupe description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Troupe accent color hex', default: '#FF6C41', example: '#FF6C41' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'colorAccent must be a 6-digit hex color code (e.g. #FF6C41)' })
  colorAccent?: string;

  @ApiPropertyOptional({ description: 'Rotation cycle duration in weeks', default: 1, minimum: 1, maximum: 52 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(52)
  rotationCycleWeeks?: number;

  @ApiPropertyOptional({ enum: ['EVERY_SHOW', 'WEEKLY', 'MONTHLY', 'CUSTOM'], default: 'WEEKLY' })
  @IsOptional()
  @IsEnum(['EVERY_SHOW', 'WEEKLY', 'MONTHLY', 'CUSTOM'])
  rotationCycleType?: 'EVERY_SHOW' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

  @ApiPropertyOptional({ description: 'Custom rotation numeric value' })
  @IsOptional()
  @IsInt()
  @Min(1)
  customRotationValue?: number;

  @ApiPropertyOptional({ enum: ['SHOW', 'DAY', 'WEEK'] })
  @IsOptional()
  @IsEnum(['SHOW', 'DAY', 'WEEK'])
  customRotationUnit?: 'SHOW' | 'DAY' | 'WEEK';

  @ApiPropertyOptional({ description: 'Whether fairness pool rotation is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  fairnessPoolEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Member talent IDs enrolled in this group', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberTalentIds?: string[];

  @ApiPropertyOptional({ description: 'Inventory requirements and special duty templates', type: [InventoryRequirementInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryRequirementInputDto)
  inventoryRequirements?: InventoryRequirementInputDto[];
}
