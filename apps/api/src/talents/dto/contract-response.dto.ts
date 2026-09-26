import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContractReviewerSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;
}

export class ContractRecordResponseDto {
  @ApiProperty({ example: 'ctr-123' })
  id: string;

  @ApiProperty({ example: 't-1' })
  talentId: string;

  @ApiPropertyOptional()
  reviewedById?: string | null;

  @ApiProperty({ example: 'Summer Palace Gala 2025' })
  projectName: string;

  @ApiProperty({ example: 'Monte Carlo Grand Hall' })
  location: string;

  @ApiProperty({ example: 'June 2025 – September 2025' })
  period: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ enum: ['COMPLETED', 'TERMINATED'], example: 'COMPLETED' })
  contractStatus: string;

  @ApiProperty({ example: 4.9 })
  rating: number;

  @ApiProperty({ enum: ['ELIGIBLE', 'NEUTRAL', 'DO_NOT_REHIRE', 'UNDER_REVIEW'], example: 'ELIGIBLE' })
  rehireStatus: string;

  @ApiPropertyOptional()
  terminationReason?: string | null;

  @ApiProperty({ enum: ['MUTUAL', 'ADMIN', 'TALENT'], example: 'MUTUAL' })
  initiator: string;

  @ApiPropertyOptional()
  internalNote?: string | null;

  @ApiProperty({ enum: ['END_OF_SEASON', 'MID_SEASON_REVIEW', 'EARLY_TERMINATION'], example: 'END_OF_SEASON' })
  reviewType: string;

  @ApiProperty()
  reviewDate: Date;

  @ApiPropertyOptional({ example: 5 })
  scorePunctuality?: number | null;

  @ApiPropertyOptional({ example: 5 })
  scorePerformance?: number | null;

  @ApiPropertyOptional({ example: 5 })
  scoreTeamwork?: number | null;

  @ApiPropertyOptional({ example: 4 })
  scoreGearCare?: number | null;

  @ApiPropertyOptional({ type: () => ContractReviewerSummaryDto })
  reviewedBy?: ContractReviewerSummaryDto | null;

  @ApiPropertyOptional()
  talent?: {
    id: string;
    firstName: string;
    lastName: string;
    primarySkill: string;
    avatarUrl?: string | null;
    email: string;
    phone: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
