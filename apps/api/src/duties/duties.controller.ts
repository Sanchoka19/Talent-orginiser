import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DutiesService } from './duties.service.js';
import { SwapDutyDto } from './dto/swap-duty.dto.js';
import { FairnessScoreResponseDto, DutySwapResponseDto } from './dto/fairness-response.dto.js';
import { FindLedgerQueryDto } from './dto/find-ledger-query.dto.js';
import { DutyLedgerResponseDto } from './dto/duty-ledger-response.dto.js';

@ApiTags('duties')
@Controller('duties')
export class DutiesController {
  constructor(private readonly dutiesService: DutiesService) {}

  @Post('swap')
  @ApiOperation({ summary: 'Swap a performer on a duty assignment (manual override)' })
  @ApiResponse({ status: 200, description: 'Talent successfully replaced and ledger updated', type: DutySwapResponseDto })
  swapTalent(@Body() swapDto: SwapDutyDto) {
    return this.dutiesService.swapTalent(swapDto);
  }

  @Get('fairness-score/:groupId')
  @ApiOperation({ summary: 'Calculate real-time Coefficient of Variation fairness score for a group' })
  @ApiQuery({ name: 'cycleWeeks', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Fairness score response', type: FairnessScoreResponseDto })
  getFairnessScore(
    @Param('groupId') groupId: string,
    @Query('cycleWeeks') cycleWeeks?: number,
  ) {
    return this.dutiesService.getFairnessScore(groupId, cycleWeeks ? +cycleWeeks : 1);
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Query the duty shift historical ledger with pagination' })
  @ApiResponse({ status: 200, description: 'Historical ledger shifts', type: [DutyLedgerResponseDto] })
  getLedger(@Query() query: FindLedgerQueryDto) {
    return this.dutiesService.getHistoricalLedger(query);
  }
}
