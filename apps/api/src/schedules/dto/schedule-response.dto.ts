import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DutyPerformerSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  talentId: string;

  @ApiProperty({ enum: ['PRESENT', 'ABSENT', 'EXCUSED', 'LATE'] })
  attendance: string;

  @ApiPropertyOptional()
  talent?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    gender: string;
    status: string;
  };
}

export class DutyOverrideSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  originalTalentId: string;

  @ApiProperty()
  replacementTalentId: string;

  @ApiPropertyOptional()
  reason?: string | null;

  @ApiPropertyOptional()
  originalTalent?: { id: string; firstName: string; lastName: string };

  @ApiPropertyOptional()
  replacementTalent?: { id: string; firstName: string; lastName: string };
}

export class DutyAssignmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  showEventId: string;

  @ApiProperty()
  requirementId: string;

  @ApiProperty({ example: 'Heavy Audio Rig' })
  itemName: string;

  @ApiProperty({ enum: ['INVENTORY', 'SPECIAL_TASK'] })
  category: string;

  @ApiPropertyOptional({ example: 'Stage Left' })
  position?: string | null;

  @ApiProperty({ enum: ['MALE_ONLY', 'FEMALE_ONLY', 'ANY'] })
  assignedGender: string;

  @ApiProperty({ example: 2 })
  requiredHeadcount: number;

  @ApiProperty({ type: [DutyPerformerSummaryDto] })
  assignedTalents: DutyPerformerSummaryDto[];

  @ApiPropertyOptional({ type: [DutyOverrideSummaryDto] })
  overrides?: DutyOverrideSummaryDto[];
}

export class ScheduleResponseDto {
  @ApiProperty({ example: 'ev-1' })
  id: string;

  @ApiProperty({ example: 'org-default' })
  organizationId: string;

  @ApiProperty({ example: 'grp-solaris' })
  groupId: string;

  @ApiProperty({ example: 'ven-venetian' })
  hotelId: string;

  @ApiProperty({ example: 'Solaris: Golden Odyssey Premiere' })
  title: string;

  @ApiProperty()
  startDateTime: Date;

  @ApiProperty()
  endDateTime: Date;

  @ApiPropertyOptional()
  lobbyDateTime?: Date | null;

  @ApiPropertyOptional({ example: '18:15' })
  lobbyTime?: string | null;

  @ApiProperty({ enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], example: 'SCHEDULED' })
  status: string;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional()
  recurringGroupId?: string | null;

  @ApiPropertyOptional()
  group?: {
    id: string;
    name: string;
    colorAccent: string;
  };

  @ApiPropertyOptional()
  venue?: {
    id: string;
    name: string;
    city: string;
  };

  @ApiProperty({ type: [DutyAssignmentResponseDto] })
  dutyAssignments: DutyAssignmentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
