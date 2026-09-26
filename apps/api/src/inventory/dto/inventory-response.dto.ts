import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PinnedTalentSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  talentId: string;

  @ApiProperty({ example: true })
  isExclusive: boolean;

  @ApiPropertyOptional()
  talent?: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    status: string;
    avatarUrl?: string | null;
  };
}

export class InventoryRequirementResponseDto {
  @ApiProperty({ example: 'ir-1' })
  id: string;

  @ApiProperty({ example: 'org-default' })
  organizationId: string;

  @ApiProperty({ example: 'grp-solaris' })
  groupId: string;

  @ApiPropertyOptional()
  parentTaskId?: string | null;

  @ApiProperty({ example: 'Heavy Audio Rig' })
  itemName: string;

  @ApiProperty({ enum: ['INVENTORY', 'SPECIAL_TASK'], example: 'INVENTORY' })
  category: string;

  @ApiProperty({ enum: ['MALE_ONLY', 'FEMALE_ONLY', 'ANY'], example: 'MALE_ONLY' })
  assignedGender: string;

  @ApiProperty({ example: 2 })
  requiredHeadcount: number;

  @ApiPropertyOptional({ example: 'Stage Left' })
  position?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty({ enum: ['EVERY_SHOW', 'WEEKLY', 'MONTHLY', 'FIXED', 'CUSTOM'], example: 'EVERY_SHOW' })
  rotationCycle: string;

  @ApiPropertyOptional()
  customRotationValue?: number | null;

  @ApiPropertyOptional({ enum: ['SHOW', 'DAY', 'WEEK'] })
  customRotationUnit?: string | null;

  @ApiPropertyOptional({ type: [PinnedTalentSummaryDto] })
  pinnedTalents?: PinnedTalentSummaryDto[];

  @ApiPropertyOptional({ type: [InventoryRequirementResponseDto] })
  subSlots?: InventoryRequirementResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
