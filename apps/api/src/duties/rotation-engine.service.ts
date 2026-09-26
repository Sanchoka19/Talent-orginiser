import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface TalentEligibilityCandidate {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  status: 'ACTIVE' | 'REST' | 'SICK_INJURED' | 'TERMINATED';
}

@Injectable()
export class RotationEngineService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the ISO week number (1-53) for a given date.
   */
  getISOWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Computes a deterministic cycle-key string for a given date and cycle duration in weeks.
   * Example: 2026-C0_W1, 2026-C1_W2
   */
  getCycleKey(date: Date | string, cycleWeeks: number = 1): string {
    const d = new Date(date);
    const isoWeek = this.getISOWeekNumber(d);
    const cycleIndex = Math.floor((isoWeek - 1) / Math.max(1, cycleWeeks));
    return `${d.getFullYear()}-C${cycleIndex}_W${cycleWeeks}`;
  }

  /**
   * Computes a fairness score (0-100) using the Coefficient of Variation (CV) of duty counts.
   * score = max(0, round((1 - (stddev / mean)) * 100))
   */
  computeFairnessScore(
    dutyCounts: Map<string, number>,
    activeMemberIds: string[],
  ): number {
    if (activeMemberIds.length === 0) return 100;

    const counts = activeMemberIds.map((id) => dutyCounts.get(id) || 0);
    const total = counts.reduce((a, b) => a + b, 0);

    if (total === 0) return 100;

    const mean = total / counts.length;
    const variance =
      counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length;
    const stddev = Math.sqrt(variance);
    const cv = stddev / mean;

    return Math.max(0, Math.round((1 - cv) * 100));
  }

  /**
   * Fair Random Round-Robin selection prioritizing talents with lowest historical count in cycle.
   */
  selectFairRandomTalents(
    candidates: TalentEligibilityCandidate[],
    requiredCount: number,
    dutyCounts: Map<string, number>,
  ): string[] {
    if (candidates.length === 0 || requiredCount <= 0) return [];
    if (candidates.length <= requiredCount) return candidates.map((c) => c.id);

    const candidatesByCount = new Map<number, TalentEligibilityCandidate[]>();
    for (const candidate of candidates) {
      const count = dutyCounts.get(candidate.id) || 0;
      if (!candidatesByCount.has(count)) {
        candidatesByCount.set(count, []);
      }
      candidatesByCount.get(count)!.push(candidate);
    }

    const sortedCounts = Array.from(candidatesByCount.keys()).sort((a, b) => a - b);
    const selectedIds: string[] = [];

    for (const count of sortedCounts) {
      if (selectedIds.length >= requiredCount) break;

      const pool = candidatesByCount.get(count)!;
      // Random shuffle within same bucket
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const needed = requiredCount - selectedIds.length;

      for (const talent of shuffled.slice(0, needed)) {
        selectedIds.push(talent.id);
      }
    }

    return selectedIds;
  }

  /**
   * Retrieves historical duty counts for talents in a group during a specific rotation cycle.
   */
  async getHistoricalDutyCounts(
    groupId: string,
    cycleKey: string,
  ): Promise<Map<string, number>> {
    const records = await this.prisma.dutyShiftLedger.groupBy({
      by: ['talentId'],
      where: {
        groupId,
        cyclePeriodKey: cycleKey,
      },
      _count: {
        talentId: true,
      },
    });

    const dutyCounts = new Map<string, number>();
    for (const r of records) {
      dutyCounts.set(r.talentId, r._count.talentId);
    }
    return dutyCounts;
  }

  /**
   * Generates and persists automated duty assignments for a given show event.
   */
  async generateDutiesForShow(showEventId: string): Promise<void> {
    const show = await this.prisma.showEvent.findUnique({
      where: { id: showEventId },
      include: {
        group: {
          include: {
            members: {
              include: {
                talent: true,
              },
            },
            requirements: {
              include: {
                pinnedTalents: true,
              },
            },
          },
        },
      },
    });

    if (!show || !show.group) return;

    const group = show.group;
    const cycleWeeks = group.rotationCycleWeeks || 1;
    const cycleKey = this.getCycleKey(show.startDateTime, cycleWeeks);
    const dutyCounts = await this.getHistoricalDutyCounts(group.id, cycleKey);

    const activeMembers = group.members
      .map((m) => m.talent)
      .filter((t) => t.status === 'ACTIVE');

    const assignedInEvent = new Set<string>();

    // Clear existing duty assignments for this show before regenerating
    await this.prisma.dutyAssignment.deleteMany({
      where: { showEventId },
    });
    await this.prisma.dutyShiftLedger.deleteMany({
      where: { showEventId },
    });

    for (const req of group.requirements) {
      const selectedIds: string[] = [];

      // Step 1: Check for pinned fixed performers
      const exclusivePinned = req.pinnedTalents.find((p) => p.isExclusive);
      if (exclusivePinned) {
        const talent = activeMembers.find((t) => t.id === exclusivePinned.talentId);
        if (talent && !assignedInEvent.has(talent.id)) {
          selectedIds.push(talent.id);
        }
      }

      // Step 2: Fill remaining headcount from eligible fairness pool
      const neededCount = Math.max(0, req.requiredHeadcount - selectedIds.length);
      if (neededCount > 0) {
        const currentlyExcluded = new Set([...assignedInEvent, ...selectedIds]);

        // Filter candidates by sub-pool (if configured) and gender requirement
        const subPoolIds = req.pinnedTalents
          .filter((p) => !p.isExclusive)
          .map((p) => p.talentId);

        let candidates = activeMembers.filter(
          (t) =>
            !currentlyExcluded.has(t.id) &&
            (subPoolIds.length === 0 || subPoolIds.includes(t.id)),
        );

        if (req.assignedGender === 'MALE_ONLY') {
          candidates = candidates.filter((t) => t.gender === 'MALE');
        } else if (req.assignedGender === 'FEMALE_ONLY') {
          candidates = candidates.filter((t) => t.gender === 'FEMALE');
        }

        const chosenIds = this.selectFairRandomTalents(
          candidates.map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            gender: c.gender,
            status: c.status,
          })),
          neededCount,
          dutyCounts,
        );
        selectedIds.push(...chosenIds);
      }

      // Step 3: Record local duty tracking to prevent reuse
      for (const id of selectedIds) {
        assignedInEvent.add(id);
        dutyCounts.set(id, (dutyCounts.get(id) || 0) + 1);
      }

      // Create DutyAssignment and Performers
      const assignment = await this.prisma.dutyAssignment.create({
        data: {
          showEventId,
          requirementId: req.id,
          itemName: req.itemName,
          category: req.category,
          position: req.position,
          assignedGender: req.assignedGender,
          requiredHeadcount: req.requiredHeadcount,
          assignedTalents: {
            create: selectedIds.map((talentId) => ({
              talentId,
              attendance: 'PRESENT',
            })),
          },
        },
      });

      // Create DutyShiftLedger entries for historical tracking
      if (selectedIds.length > 0) {
        await this.prisma.dutyShiftLedger.createMany({
          data: selectedIds.map((talentId) => ({
            organizationId: show.organizationId,
            showEventId,
            groupId: group.id,
            talentId,
            requirementId: req.id,
            cyclePeriodKey: cycleKey,
            isManualOverride: false,
            attendance: 'PRESENT',
          })),
        });
      }
    }
  }

  /**
   * Applies a manual swap/override for a talent on a duty assignment.
   */
  async swapDutyTalent(
    showEventId: string,
    dutyAssignmentId: string,
    originalTalentId: string,
    replacementTalentId: string,
    reason?: string,
  ): Promise<void> {
    const assignment = await this.prisma.dutyAssignment.findUnique({
      where: { id: dutyAssignmentId },
      include: { showEvent: true },
    });

    if (!assignment) {
      throw new Error(`DutyAssignment ${dutyAssignmentId} not found`);
    }

    // 1. Remove original performer and attach replacement performer
    await this.prisma.dutyAssignmentPerformer.deleteMany({
      where: {
        dutyAssignmentId,
        talentId: originalTalentId,
      },
    });

    await this.prisma.dutyAssignmentPerformer.upsert({
      where: {
        dutyAssignmentId_talentId: {
          dutyAssignmentId,
          talentId: replacementTalentId,
        },
      },
      create: {
        dutyAssignmentId,
        talentId: replacementTalentId,
        attendance: 'PRESENT',
      },
      update: {},
    });

    // 2. Record DutyOverride audit trail
    await this.prisma.dutyOverride.create({
      data: {
        dutyAssignmentId,
        originalTalentId,
        replacementTalentId,
        reason: reason || 'Manual duty swap by coordinator',
      },
    });

    // 3. Update DutyShiftLedger for historical fairness calculation
    const cycleWeeks = 1;
    const cycleKey = this.getCycleKey(assignment.showEvent.startDateTime, cycleWeeks);

    await this.prisma.dutyShiftLedger.deleteMany({
      where: {
        showEventId,
        requirementId: assignment.requirementId,
        talentId: originalTalentId,
      },
    });

    await this.prisma.dutyShiftLedger.create({
      data: {
        organizationId: assignment.showEvent.organizationId,
        showEventId,
        groupId: assignment.showEvent.groupId,
        talentId: replacementTalentId,
        requirementId: assignment.requirementId,
        cyclePeriodKey: cycleKey,
        isManualOverride: true,
        attendance: 'PRESENT',
      },
    });
  }
}
