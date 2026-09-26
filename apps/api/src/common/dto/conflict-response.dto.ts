import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduleConflictDetailDto {
  @ApiProperty({
    enum: ['GROUP_DOUBLE_BOOKED', 'VENUE_OVERLAP'],
    example: 'GROUP_DOUBLE_BOOKED',
    description: 'Category of detected schedule conflict',
  })
  type: string;

  @ApiPropertyOptional({ description: 'ID of conflicting show event' })
  conflictingEventId?: string;

  @ApiPropertyOptional({ description: 'Title of conflicting show event' })
  conflictingEventTitle?: string;

  @ApiProperty({
    description: 'Human-readable explanation of why this booking is blocked or warned',
    example: 'Group "Solaris Cirque Troupe" is already booked at "The Venetian Resort" during this timeframe.',
  })
  reason: string;
}

export class ConflictResponseDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Schedule conflict detected' })
  message: string;

  @ApiProperty({
    type: [ScheduleConflictDetailDto],
    description: 'List of strictly blocking conflicts (e.g. group double-booked)',
  })
  blockingConflicts: ScheduleConflictDetailDto[];

  @ApiProperty({
    type: [ScheduleConflictDetailDto],
    description: 'List of warning conflicts (e.g. stage overlap with another group)',
  })
  warningConflicts: ScheduleConflictDetailDto[];
}
