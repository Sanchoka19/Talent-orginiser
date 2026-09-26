import { ApiProperty } from '@nestjs/swagger';

export class FairnessScoreResponseDto {
  @ApiProperty({ example: 'grp-solaris' })
  groupId: string;

  @ApiProperty({ example: '2026-C38_W1' })
  cycleKey: string;

  @ApiProperty({
    example: 94,
    description: 'Real-time fairness score (0 to 100) computed using Coefficient of Variation (CV)',
  })
  score: number;
}

export class DutySwapResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Duty assignment swapped successfully' })
  message: string;
}
