import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SwapDutyDto {
  @ApiProperty({ description: 'Show event ID', example: 'ev-1' })
  @IsNotEmpty()
  @IsString()
  showEventId: string;

  @ApiProperty({ description: 'Duty assignment ID', example: 'da-1' })
  @IsNotEmpty()
  @IsString()
  dutyAssignmentId: string;

  @ApiProperty({ description: 'Original talent ID being replaced', example: 't-1' })
  @IsNotEmpty()
  @IsString()
  originalTalentId: string;

  @ApiProperty({ description: 'Replacement talent ID taking the duty', example: 't-2' })
  @IsNotEmpty()
  @IsString()
  replacementTalentId: string;

  @ApiPropertyOptional({ description: 'Optional explanation for the swap', example: 'Artist requested rest day' })
  @IsOptional()
  @IsString()
  reason?: string;
}
