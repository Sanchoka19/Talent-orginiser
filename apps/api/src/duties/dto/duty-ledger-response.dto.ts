import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DutyLedgerResponseDto {
  @ApiProperty({ example: 'led-1' })
  id: string;

  @ApiProperty({ example: 'org-default' })
  organizationId: string;

  @ApiProperty({ example: 'ev-1' })
  showEventId: string;

  @ApiProperty({ example: 'grp-solaris' })
  groupId: string;

  @ApiProperty({ example: 't-1' })
  talentId: string;

  @ApiProperty({ example: 'ir-1' })
  requirementId: string;

  @ApiProperty({ example: '2026-C38_W1' })
  cyclePeriodKey: string;

  @ApiProperty({ example: false })
  isManualOverride: boolean;

  @ApiProperty({ enum: ['PRESENT', 'ABSENT', 'EXCUSED', 'LATE'], example: 'PRESENT' })
  attendance: string;

  @ApiProperty()
  assignedAt: Date;

  @ApiPropertyOptional()
  talent?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };

  @ApiPropertyOptional()
  requirement?: {
    id: string;
    itemName: string;
    position?: string | null;
  };

  @ApiPropertyOptional()
  showEvent?: {
    id: string;
    title: string;
    startDateTime: Date;
  };
}
