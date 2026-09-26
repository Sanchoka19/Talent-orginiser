import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TalentDocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'US P-1 Entertainment Visa' })
  name: string;

  @ApiProperty({ enum: ['PASSPORT', 'VISA', 'ID_CARD', 'CONTRACT', 'MEDICAL', 'OTHER'] })
  type: string;

  @ApiPropertyOptional({ example: '1.4 MB' })
  fileSize?: string | null;

  @ApiProperty({ example: 'https://storage.artistent.com/docs/visa.pdf' })
  url: string;

  @ApiPropertyOptional()
  expiryDate?: Date | null;

  @ApiProperty()
  uploadedAt: Date;
}

export class GroupMembershipSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  groupId: string;

  @ApiPropertyOptional()
  roleNote?: string | null;

  @ApiPropertyOptional()
  group?: {
    id: string;
    name: string;
    colorAccent: string;
  };
}

export class TalentResponseDto {
  @ApiProperty({ example: 't-1' })
  id: string;

  @ApiProperty({ example: 'org-default' })
  organizationId: string;

  @ApiProperty({ example: 'Amélie' })
  firstName: string;

  @ApiProperty({ example: 'Laurent' })
  lastName: string;

  @ApiProperty({ example: 'amelie.laurent@artistent.com' })
  email: string;

  @ApiProperty({ example: '+33 6 12 34 56 78' })
  phone: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE'], example: 'FEMALE' })
  gender: string;

  @ApiProperty({ example: 168 })
  heightCm: number;

  @ApiPropertyOptional({ example: 54 })
  weightKg?: number | null;

  @ApiProperty({ enum: ['ACTIVE', 'REST', 'SICK_INJURED', 'TERMINATED'], example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: 'Aerialist & Silk Performer' })
  primarySkill: string;

  @ApiProperty({ type: [String], example: ['Contortion', 'Lyrical Dance'] })
  secondarySkills: string[];

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' })
  avatarUrl?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty({ enum: ['ELIGIBLE', 'NEUTRAL', 'DO_NOT_REHIRE', 'UNDER_REVIEW'], example: 'ELIGIBLE' })
  rehireStatus: string;

  @ApiPropertyOptional()
  contractExpiryDate?: Date | null;

  @ApiProperty({ enum: ['ACTIVE', 'COMPLETED', 'TERMINATED'], example: 'ACTIVE' })
  contractStatus: string;

  @ApiProperty({ example: false })
  isArchived: boolean;

  @ApiPropertyOptional()
  terminationReason?: string | null;

  @ApiPropertyOptional()
  terminationDate?: Date | null;

  @ApiProperty({ type: [TalentDocumentResponseDto] })
  documents: TalentDocumentResponseDto[];

  @ApiPropertyOptional({ type: [GroupMembershipSummaryDto] })
  groupMemberships?: GroupMembershipSummaryDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
