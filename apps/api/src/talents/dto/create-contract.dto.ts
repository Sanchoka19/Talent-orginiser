import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateContractRecordDto {
  @ApiPropertyOptional({ description: 'Reviewer user ID' })
  @IsOptional()
  @IsString()
  reviewedById?: string;

  @ApiProperty({ description: 'Production or tour project name', example: 'Summer Palace Gala 2025' })
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @ApiProperty({ description: 'Performance location', example: 'Monte Carlo Grand Hall' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ description: 'Contract period display string', example: 'June 2025 – September 2025' })
  @IsNotEmpty()
  @IsString()
  period: string;

  @ApiProperty({ description: 'Start date (ISO 8601)', example: '2025-06-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date (ISO 8601)', example: '2025-09-30' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: ['COMPLETED', 'TERMINATED'], default: 'COMPLETED' })
  @IsOptional()
  @IsEnum(['COMPLETED', 'TERMINATED'])
  contractStatus?: 'COMPLETED' | 'TERMINATED';

  @ApiProperty({ description: 'Overall rating 1.0 to 5.0', example: 4.9 })
  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  rating: number;

  @ApiPropertyOptional({ enum: ['ELIGIBLE', 'NEUTRAL', 'DO_NOT_REHIRE', 'UNDER_REVIEW'], default: 'ELIGIBLE' })
  @IsOptional()
  @IsEnum(['ELIGIBLE', 'NEUTRAL', 'DO_NOT_REHIRE', 'UNDER_REVIEW'])
  rehireStatus?: 'ELIGIBLE' | 'NEUTRAL' | 'DO_NOT_REHIRE' | 'UNDER_REVIEW';

  @ApiPropertyOptional({ description: 'Termination reason if terminated early' })
  @IsOptional()
  @IsString()
  terminationReason?: string;

  @ApiPropertyOptional({ enum: ['MUTUAL', 'ADMIN', 'TALENT'], default: 'MUTUAL' })
  @IsOptional()
  @IsEnum(['MUTUAL', 'ADMIN', 'TALENT'])
  initiator?: 'MUTUAL' | 'ADMIN' | 'TALENT';

  @ApiPropertyOptional({ description: 'Internal dossier evaluation notes' })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @ApiPropertyOptional({ enum: ['END_OF_SEASON', 'MID_SEASON_REVIEW', 'EARLY_TERMINATION'], default: 'END_OF_SEASON' })
  @IsOptional()
  @IsEnum(['END_OF_SEASON', 'MID_SEASON_REVIEW', 'EARLY_TERMINATION'])
  reviewType?: 'END_OF_SEASON' | 'MID_SEASON_REVIEW' | 'EARLY_TERMINATION';

  @ApiPropertyOptional({ description: 'Review date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @ApiPropertyOptional({ description: 'Punctuality score (1-5)', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  scorePunctuality?: number;

  @ApiPropertyOptional({ description: 'Performance score (1-5)', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  scorePerformance?: number;

  @ApiPropertyOptional({ description: 'Teamwork score (1-5)', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  scoreTeamwork?: number;

  @ApiPropertyOptional({ description: 'Gear care score (1-5)', example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  scoreGearCare?: number;
}
