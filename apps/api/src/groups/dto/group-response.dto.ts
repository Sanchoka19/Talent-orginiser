import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddMemberDto {
  @ApiPropertyOptional({ description: 'Optional role note within troupe (e.g. Lead Soloist)' })
  @IsOptional()
  @IsString()
  roleNote?: string;
}

export class GroupMemberSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  groupId: string;

  @ApiProperty()
  talentId: string;

  @ApiPropertyOptional()
  roleNote?: string | null;

  @ApiPropertyOptional()
  talent?: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    status: string;
    avatarUrl?: string | null;
    primarySkill: string;
  };
}

export class GroupCountDto {
  @ApiProperty({ example: 10 })
  members: number;

  @ApiProperty({ example: 4 })
  shows: number;
}

export class GroupResponseDto {
  @ApiProperty({ example: 'grp-solaris' })
  id: string;

  @ApiProperty({ example: 'org-default' })
  organizationId: string;

  @ApiProperty({ example: 'Solaris Cirque Troupe' })
  name: string;

  @ApiPropertyOptional({ example: 'High-altitude acrobatic show' })
  description?: string | null;

  @ApiProperty({ example: '#FF6C41' })
  colorAccent: string;

  @ApiProperty({ example: 1 })
  rotationCycleWeeks: number;

  @ApiProperty({ enum: ['EVERY_SHOW', 'WEEKLY', 'MONTHLY', 'CUSTOM'], example: 'WEEKLY' })
  rotationCycleType: string;

  @ApiPropertyOptional()
  customRotationValue?: number | null;

  @ApiPropertyOptional({ enum: ['SHOW', 'DAY', 'WEEK'] })
  customRotationUnit?: string | null;

  @ApiProperty({ example: true })
  fairnessPoolEnabled: boolean;

  @ApiPropertyOptional({ type: [GroupMemberSummaryDto] })
  members?: GroupMemberSummaryDto[];

  @ApiPropertyOptional({ type: GroupCountDto })
  _count?: GroupCountDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
