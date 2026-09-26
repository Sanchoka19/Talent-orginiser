import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RotationEngineService } from './rotation-engine.service.js';
import { SwapDutyDto } from './dto/swap-duty.dto.js';
import { FindLedgerQueryDto } from './dto/find-ledger-query.dto.js';

@Injectable()
export class DutiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rotationEngine: RotationEngineService,
  ) {}

  async swapTalent(swapDto: SwapDutyDto) {
    await this.rotationEngine.swapDutyTalent(
      swapDto.showEventId,
      swapDto.dutyAssignmentId,
      swapDto.originalTalentId,
      swapDto.replacementTalentId,
      swapDto.reason,
    );

    return {
      success: true,
      message: 'Duty assignment swapped successfully',
    };
  }

  async getFairnessScore(groupId: string, cycleWeeks: number = 1) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            talent: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const cycleKey = this.rotationEngine.getCycleKey(new Date(), cycleWeeks || group.rotationCycleWeeks || 1);
    const dutyCounts = await this.rotationEngine.getHistoricalDutyCounts(groupId, cycleKey);

    const activeMemberIds = group.members
      .filter((m) => m.talent.status === 'ACTIVE')
      .map((m) => m.talent.id);

    const score = this.rotationEngine.computeFairnessScore(dutyCounts, activeMemberIds);

    return {
      groupId,
      cycleKey,
      score,
    };
  }

  async getHistoricalLedger(query?: FindLedgerQueryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    return this.prisma.dutyShiftLedger.findMany({
      where: {
        ...(query?.groupId ? { groupId: query.groupId } : {}),
        ...(query?.talentId ? { talentId: query.talentId } : {}),
        ...(query?.cycleKey ? { cyclePeriodKey: query.cycleKey } : {}),
      },
      include: {
        talent: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        requirement: {
          select: { id: true, itemName: true, position: true },
        },
        showEvent: {
          select: { id: true, title: true, startDateTime: true },
        },
      },
      skip,
      take: limit,
      orderBy: { assignedAt: query?.sortOrder || 'desc' },
    });
  }
}
