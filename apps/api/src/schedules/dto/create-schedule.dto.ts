import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ description: 'Workspace organization ID', example: 'org-default' })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({ description: 'Group/troupe performing the show', example: 'grp-solaris' })
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @ApiProperty({ description: 'Hotel venue hosting the show', example: 'ven-venetian' })
  @IsNotEmpty()
  @IsString()
  hotelId: string;

  @ApiProperty({ description: 'Show title', example: 'Solaris: Golden Odyssey Premiere' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Show start timestamp (ISO 8601)', example: '2026-09-22T19:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  startDateTime: string;

  @ApiProperty({ description: 'Show end timestamp (ISO 8601)', example: '2026-09-22T22:30:00Z' })
  @IsNotEmpty()
  @IsDateString()
  endDateTime: string;

  @ApiPropertyOptional({ description: 'Optional lobby gathering timestamp (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  lobbyDateTime?: string;

  @ApiPropertyOptional({ description: 'Optional lobby time string', example: '18:15' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'lobbyTime must be in 24-hour HH:MM format (e.g. 18:15)',
  })
  lobbyTime?: string;

  @ApiPropertyOptional({ enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' })
  @IsOptional()
  @IsEnum(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

  @ApiPropertyOptional({ description: 'Optional show notes or stage cues' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Optional recurrence group UUID' })
  @IsOptional()
  @IsString()
  recurringGroupId?: string;

  @ApiPropertyOptional({ description: 'Whether to automatically generate duty assignments', default: true })
  @IsOptional()
  @IsBoolean()
  autoAssignDuties?: boolean;
}
