import { Talent } from '../types/talent';
import { Group } from '../types/group';
import { InventoryRequirement, DutyGenderRequirement } from '../types/inventory';
import { DutyAssignment } from '../types/duty';
import { ShowEvent } from '../types/schedule';

/**
 * Helper to compute the cycle key for a given date and cycle duration in weeks.
 * Example: for a 2-week cycle, group weeks in blocks of 2.
 */
export function getCycleKey(date: Date | string, cycleWeeks: number = 1): string {
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  const cycleIndex = Math.floor((weekNumber - 1) / Math.max(1, cycleWeeks));
  return `${d.getFullYear()}-C${cycleIndex}_W${cycleWeeks}`;
}

/**
 * Calculates historical duty counts for talents within a specific group and cycle period.
 */
export function computeHistoricalDutyCounts(
  events: ShowEvent[],
  groupId: string,
  cycleKey: string,
  cycleWeeks: number = 1
): Map<string, number> {
  const dutyCounts = new Map<string, number>();

  for (const ev of events) {
    if (ev.groupId !== groupId || ev.status === 'Cancelled') continue;

    const evCycleKey = getCycleKey(ev.startDateTime, cycleWeeks);
    if (evCycleKey !== cycleKey) continue;

    for (const duty of ev.dutyAssignments) {
      for (const talentId of duty.assignedTalentIds) {
        dutyCounts.set(talentId, (dutyCounts.get(talentId) || 0) + 1);
      }
    }
  }

  return dutyCounts;
}

/**
 * Filters talents to only those who:
 * 1. Belong to the group.
 * 2. Are currently 'Active' (strictly excluding 'Rest' and 'Sick/Injured').
 * 3. Match the required gender condition.
 */
export function getEligibleTalentsForRequirement(
  group: Group,
  allTalents: Talent[],
  requirement: InventoryRequirement,
  alreadyAssignedInThisEvent: Set<string> = new Set()
): Talent[] {
  // If requirement specifies a restricted rotation pool (> 1 performers), restrict to pool members
  const poolIds =
    requirement.assignedTalentIds && requirement.assignedTalentIds.length > 1
      ? requirement.assignedTalentIds
      : group.memberTalentIds;

  const memberTalents = allTalents.filter(
    (t) => poolIds.includes(t.id) && group.memberTalentIds.includes(t.id)
  );

  // Exclude non-active talents (Rest, Sick/Injured)
  const activeTalents = memberTalents.filter(
    (t) => t.status === 'Active' && !alreadyAssignedInThisEvent.has(t.id)
  );

  // Filter by gender requirement
  switch (requirement.assignedGender) {
    case 'Male Only':
      return activeTalents.filter((t) => t.gender === 'Male');
    case 'Female Only':
      return activeTalents.filter((t) => t.gender === 'Female');
    case 'Any':
    default:
      return activeTalents;
  }
}

/**
 * Fair Random Round-Robin Selection Engine:
 * - Separates active talents by required gender for each inventory role.
 * - Randomly assigns candidates who have the lowest historical assignment frequency.
 * - Ensures a complete round-robin cycle: no talent is reassigned until all eligible active members
 *   of that gender have served in the current cycle.
 */
export function selectFairRandomTalents(
  candidates: Talent[],
  requiredCount: number,
  dutyCounts: Map<string, number>
): string[] {
  if (candidates.length === 0 || requiredCount <= 0) {
    return [];
  }

  if (candidates.length <= requiredCount) {
    return candidates.map((c) => c.id);
  }

  // Group candidates by their historical duty count in the current cycle
  const candidatesByCount = new Map<number, Talent[]>();
  for (const candidate of candidates) {
    const count = dutyCounts.get(candidate.id) || 0;
    if (!candidatesByCount.has(count)) {
      candidatesByCount.set(count, []);
    }
    candidatesByCount.get(count)!.push(candidate);
  }

  // Sort counts ascending (lowest duty count first = highest priority for fair rotation)
  const sortedCounts = Array.from(candidatesByCount.keys()).sort((a, b) => a - b);

  const selectedIds: string[] = [];

  for (const count of sortedCounts) {
    if (selectedIds.length >= requiredCount) break;

    const pool = candidatesByCount.get(count)!;
    // Shuffle the pool to ensure fair random selection among candidates with the same minimum count
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    const needed = requiredCount - selectedIds.length;
    const toTake = shuffled.slice(0, needed);
    for (const talent of toTake) {
      selectedIds.push(talent.id);
    }
  }

  return selectedIds;
}

/**
 * Generates automated duty assignments for all inventory requirements and stage tasks of a group for a show.
 * - Supports fixed assigned performers (assignedTalentId) if active and available.
 * - If fixed performer is sick or unavailable, gracefully falls back to fair rotation pool.
 * - Respects the group's rotation cycle weeks for historical duty counting.
 */
export function generateAutomatedDutiesForEvent(
  group: Group,
  allTalents: Talent[],
  allEvents: ShowEvent[],
  eventDate: Date | string
): DutyAssignment[] {
  const cycleWeeks = group.rotationCycleWeeks || 1;
  const cycleKey = getCycleKey(eventDate, cycleWeeks);
  const dutyCounts = computeHistoricalDutyCounts(allEvents, group.id, cycleKey, cycleWeeks);
  const assignedInEvent = new Set<string>();

  const assignments: DutyAssignment[] = [];

  for (const req of group.inventoryRequirements) {
    const selectedIds: string[] = [];

    // 1. Check if a fixed talent was explicitly designated for this requirement/slot
    const fixedTalentId =
      req.assignedTalentId ||
      (req.assignedTalentIds && req.assignedTalentIds.length === 1 ? req.assignedTalentIds[0] : undefined);

    if (fixedTalentId) {
      const designatedTalent = allTalents.find((t) => t.id === fixedTalentId);
      // Ensure the designated talent is an active member of this group
      if (
        designatedTalent &&
        designatedTalent.status === 'Active' &&
        group.memberTalentIds.includes(designatedTalent.id)
      ) {
        selectedIds.push(designatedTalent.id);
      }
    }

    // 2. If additional headcount is needed (or fixed talent was unavailable/not specified)
    const neededCount = Math.max(0, req.requiredHeadcount - selectedIds.length);
    if (neededCount > 0) {
      // Exclude already assigned talents in this event, plus the already selected fixed talent
      const currentExcluded = new Set([...assignedInEvent, ...selectedIds]);
      const eligible = getEligibleTalentsForRequirement(group, allTalents, req, currentExcluded);
      const remainingIds = selectFairRandomTalents(eligible, neededCount, dutyCounts);
      selectedIds.push(...remainingIds);
    }

    // Track assigned members so they aren't double-assigned to heavy duties on the same show
    for (const id of selectedIds) {
      assignedInEvent.add(id);
      // Update local duty count for subsequent items within this event
      dutyCounts.set(id, (dutyCounts.get(id) || 0) + 1);
    }

    assignments.push({
      requirementId: req.id,
      itemName: req.itemName,
      position: req.position,
      category: req.category,
      assignedGender: req.assignedGender,
      requiredHeadcount: req.requiredHeadcount,
      assignedTalentIds: selectedIds,
      updatedAt: new Date().toISOString()
    });
  }

  return assignments;
}

/**
 * Admin override: Manually swap or reassign a talent for a specific duty on a show.
 */
export function applyManualDutyOverride(
  duty: DutyAssignment,
  originalTalentId: string,
  replacementTalentId: string
): DutyAssignment {
  const newAssignedIds = duty.assignedTalentIds.map((id) =>
    id === originalTalentId ? replacementTalentId : id
  );

  return {
    ...duty,
    assignedTalentIds: newAssignedIds,
    manualOverrides: {
      ...(duty.manualOverrides || {}),
      [originalTalentId]: replacementTalentId
    },
    updatedAt: new Date().toISOString()
  };
}
