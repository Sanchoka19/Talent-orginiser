import { Talent } from '../types/talent';
import { Group } from '../types/group';
import { InventoryRequirement, DutyGenderRequirement } from '../types/inventory';
import { DutyAssignment } from '../types/duty';
import { ShowEvent } from '../types/schedule';

// ─────────────────────────────────────────────────────────────────────────────
// FIX 1: getCycleKey — ISO week number calculation
// Bug: previous code used `startOfYear.getDay()` (0-6 weekday of Jan 1)
// as if it were a day-offset, which produced wrong week numbers every year.
// Fix: compute the day-of-year purely from the millisecond difference.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the ISO week number (1–53) for a given date.
 * Weeks start on Monday; week 1 is the week containing the year's first Thursday.
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current ISO day number
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Computes a deterministic cycle-key string for a given date and cycle duration in weeks.
 * Two dates that fall in the same cycle block share the same key.
 *
 * Example: cycleWeeks=2 groups ISO weeks in pairs:
 *   week 1–2 → C0_W2, week 3–4 → C1_W2, …
 */
export function getCycleKey(date: Date | string, cycleWeeks: number = 1): string {
  const d = new Date(date);
  const isoWeek = getISOWeekNumber(d);
  const cycleIndex = Math.floor((isoWeek - 1) / Math.max(1, cycleWeeks));
  return `${d.getFullYear()}-C${cycleIndex}_W${cycleWeeks}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Historical duty-count computation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates how many times each talent has been assigned a duty
 * within the current rotation cycle (matching cycleKey).
 * Cancelled shows are ignored.
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

// ─────────────────────────────────────────────────────────────────────────────
// Eligibility filter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the eligible talents for a given inventory requirement, filtered by:
 *  1. Group membership.
 *  2. Active status (Rest / Sick-Injured are strictly excluded).
 *  3. Gender requirement (Any / Male Only / Female Only).
 *  4. Not already assigned elsewhere in this event.
 *
 * If `requirement.assignedTalentIds` contains more than one ID, rotation is
 * restricted to that explicit pool (custom fairness sub-pool).
 */
export function getEligibleTalentsForRequirement(
  group: Group,
  allTalents: Talent[],
  requirement: InventoryRequirement,
  alreadyAssignedInThisEvent: Set<string> = new Set()
): Talent[] {
  // Restrict to explicit sub-pool when > 1 IDs are pinned
  const poolIds =
    requirement.assignedTalentIds && requirement.assignedTalentIds.length > 1
      ? requirement.assignedTalentIds
      : group.memberTalentIds;

  const memberTalents = allTalents.filter(
    (t) => poolIds.includes(t.id) && group.memberTalentIds.includes(t.id)
  );

  // Active-only and not yet assigned in this event
  const activeTalents = memberTalents.filter(
    (t) => t.status === 'Active' && !alreadyAssignedInThisEvent.has(t.id)
  );

  // Gender filter
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

// ─────────────────────────────────────────────────────────────────────────────
// Fair Random Round-Robin selection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Selects `requiredCount` talent IDs from `candidates` using a fair round-robin:
 *  - Candidates with the lowest historical duty count get priority.
 *  - Within the same count bucket, selection is random (prevents positional bias).
 *  - If fewer candidates exist than required, all available are returned (partial fill).
 */
export function selectFairRandomTalents(
  candidates: Talent[],
  requiredCount: number,
  dutyCounts: Map<string, number>
): string[] {
  if (candidates.length === 0 || requiredCount <= 0) {
    return [];
  }

  // If supply ≤ demand, return everyone (shortage situation — caller must handle)
  if (candidates.length <= requiredCount) {
    return candidates.map((c) => c.id);
  }

  // Bucket candidates by their current-cycle duty count
  const candidatesByCount = new Map<number, Talent[]>();
  for (const candidate of candidates) {
    const count = dutyCounts.get(candidate.id) || 0;
    if (!candidatesByCount.has(count)) {
      candidatesByCount.set(count, []);
    }
    candidatesByCount.get(count)!.push(candidate);
  }

  // Sort buckets ascending: lowest-served performers first
  const sortedCounts = Array.from(candidatesByCount.keys()).sort((a, b) => a - b);

  const selectedIds: string[] = [];

  for (const count of sortedCounts) {
    if (selectedIds.length >= requiredCount) break;

    const pool = candidatesByCount.get(count)!;
    // Shuffle within the same-count bucket to avoid ordering bias
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    const needed = requiredCount - selectedIds.length;
    for (const talent of shuffled.slice(0, needed)) {
      selectedIds.push(talent.id);
    }
  }

  return selectedIds;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 2: computeFairnessScore — real metric (was hardcoded "100%" string)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes a fairness score (0–100) for a group's duty distribution in a cycle.
 *
 * Method: Coefficient of Variation (CV) of duty counts across all active members.
 *   CV = stddev / mean
 *   score = max(0, round((1 - CV) * 100))
 *
 * - 100  → perfect equality (everyone served the same number of duties)
 * -  0   → extreme inequality (one person did everything)
 * - Returns 100 when all counts are 0 (cycle just started).
 */
export function computeFairnessScore(
  dutyCounts: Map<string, number>,
  activeMemberIds: string[]
): number {
  if (activeMemberIds.length === 0) return 100;

  const counts = activeMemberIds.map((id) => dutyCounts.get(id) || 0);
  const total = counts.reduce((a, b) => a + b, 0);

  // Nobody has served yet → perfectly fair by definition
  if (total === 0) return 100;

  const mean = total / counts.length;
  const variance =
    counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length;
  const stddev = Math.sqrt(variance);
  const cv = stddev / mean; // 0 = perfect, >0 = unequal

  return Math.max(0, Math.round((1 - cv) * 100));
}

// ─────────────────────────────────────────────────────────────────────────────
// Main duty-generation entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates automated duty assignments for all inventory requirements of a group
 * for a single show event.
 *
 * Key guarantees:
 *  - A talent is assigned **at most once** per show (1-to-1 rule).
 *  - Fixed/pinned performers are honoured IF they are Active AND not already
 *    assigned to an earlier requirement in the same show (FIX 2 — prevents
 *    double-assignment when the same talent is pinned to multiple requirements).
 *  - When supply < demand, partial assignment is returned without blocking.
 *  - Duty counts are updated locally per requirement so the fairness pool
 *    accounts for assignments made within the same event.
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

  // Tracks every talent assigned so far in this show — enforces 1-to-1
  const assignedInEvent = new Set<string>();

  const assignments: DutyAssignment[] = [];

  for (const req of group.inventoryRequirements) {
    const selectedIds: string[] = [];

    // ── Step 1: Honour fixed/pinned talent if available ──────────────────────
    // A single pinned talent is determined by assignedTalentId or a singleton
    // assignedTalentIds array. If the same talent is pinned to multiple
    // requirements, the second occurrence gracefully falls back to pool rotation.
    const fixedTalentId =
      req.assignedTalentId ||
      (req.assignedTalentIds && req.assignedTalentIds.length === 1
        ? req.assignedTalentIds[0]
        : undefined);

    if (fixedTalentId) {
      const designatedTalent = allTalents.find((t) => t.id === fixedTalentId);

      // FIX: also check !assignedInEvent — prevents double-booking the same
      // fixed performer when they are pinned to more than one requirement.
      if (
        designatedTalent &&
        designatedTalent.status === 'Active' &&
        group.memberTalentIds.includes(designatedTalent.id) &&
        !assignedInEvent.has(fixedTalentId) // ← FIX 2 applied here
      ) {
        selectedIds.push(designatedTalent.id);
      }
    }

    // ── Step 2: Fill remaining headcount from the fairness pool ──────────────
    const neededCount = Math.max(0, req.requiredHeadcount - selectedIds.length);
    if (neededCount > 0) {
      // Exclude everyone already assigned (including the fixed talent above)
      const currentExcluded = new Set([...assignedInEvent, ...selectedIds]);
      const eligible = getEligibleTalentsForRequirement(
        group,
        allTalents,
        req,
        currentExcluded
      );
      const remainingIds = selectFairRandomTalents(eligible, neededCount, dutyCounts);
      selectedIds.push(...remainingIds);
    }

    // ── Step 3: Record assignments to prevent reuse later in this show ───────
    for (const id of selectedIds) {
      assignedInEvent.add(id);
      // Increment local duty count so subsequent requirements in the same event
      // factor in duties already allocated above
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

// ─────────────────────────────────────────────────────────────────────────────
// Admin manual override
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin override: replaces one talent with another in a specific duty assignment.
 * Records the substitution in `manualOverrides` so the UI can display an
 * "Admin Override" badge on the replacement performer.
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

/**
 * Automatically attaches and syncs all group inventory requirements (and special duties)
 * to all scheduled shows belonging to that group.
 *
 * Rules:
 * 1. Preserves existing manual overrides.
 * 2. If a requirement has a fixed performer, binds that performer across all shows.
 * 3. If a requirement has auto-rotation or a pool, distributes eligible active members fairly
 *    and rotates them sequentially across shows (Show 0 -> Member 0, Show 1 -> Member 1, etc.).
 * 4. Removes duty assignments for requirements that were deleted from the group.
 * 5. Guarantees 1-to-1 performer assignment per show where supply allows.
 */
export function syncShowsWithGroupRequirements(
  group: Group,
  currentSchedule: ShowEvent[],
  allTalents: Talent[]
): ShowEvent[] {
  const groupShows = currentSchedule
    .filter((ev) => ev.groupId === group.id)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  if (groupShows.length === 0) return currentSchedule;

  const reqs = group.inventoryRequirements || [];
  const memberTalentIds = group.memberTalentIds || [];

  return currentSchedule.map((ev) => {
    if (ev.groupId !== group.id) return ev;

    // Protect completed shows from being modified by rotation sync
    const isPastOrCompleted = ev.status === 'Completed';
    if (isPastOrCompleted) return ev;

    const showIndex = groupShows.findIndex((s) => s.id === ev.id);
    const existingDuties = ev.dutyAssignments || [];
    const newDuties: DutyAssignment[] = [];
    const assignedInEvent = new Set<string>();

    for (const req of reqs) {
      const fixedTalentId =
        req.assignedTalentId ||
        (req.assignedTalentIds && req.assignedTalentIds.length === 1
          ? req.assignedTalentIds[0]
          : undefined);

      const existingDuty = existingDuties.find(
        (d) => d.requirementId === req.id || (d.itemName === req.itemName && d.position === req.position)
      );

      // 1. Manual override preserved
      if (existingDuty?.manualOverrides && Object.keys(existingDuty.manualOverrides).length > 0) {
        newDuties.push(existingDuty);
        existingDuty.assignedTalentIds.forEach((id) => assignedInEvent.add(id));
        continue;
      }

      // 2. Fixed talent rule
      if (fixedTalentId) {
        const talent = allTalents.find((t) => t.id === fixedTalentId);
        if (talent && talent.status === 'Active') {
          newDuties.push({
            requirementId: req.id,
            itemName: req.itemName,
            position: req.position,
            category: req.category,
            assignedGender: req.assignedGender,
            requiredHeadcount: Math.max(1, req.requiredHeadcount || 1),
            assignedTalentIds: [fixedTalentId],
            updatedAt: new Date().toISOString()
          });
          assignedInEvent.add(fixedTalentId);
          continue;
        }
      }

      // 3. Existing valid assignment without change
      if (
        existingDuty &&
        existingDuty.assignedTalentIds &&
        existingDuty.assignedTalentIds.length >= Math.max(1, req.requiredHeadcount || 1)
      ) {
        const poolIds =
          req.assignedTalentIds && req.assignedTalentIds.length > 1
            ? req.assignedTalentIds
            : memberTalentIds;

        const stillEligible = existingDuty.assignedTalentIds.every((id) => {
          const t = allTalents.find((tal) => tal.id === id);
          if (!t || t.status !== 'Active' || !poolIds.includes(t.id)) return false;
          if (req.assignedGender === 'Male Only' && t.gender !== 'Male') return false;
          if (req.assignedGender === 'Female Only' && t.gender !== 'Female') return false;
          return true;
        });

        if (stillEligible) {
          newDuties.push(existingDuty);
          existingDuty.assignedTalentIds.forEach((id) => assignedInEvent.add(id));
          continue;
        }
      }

      // 4. Generate assignment via fair rotation pool
      const poolIds =
        req.assignedTalentIds && req.assignedTalentIds.length > 1
          ? req.assignedTalentIds
          : memberTalentIds;

      let eligible = allTalents.filter(
        (t) =>
          poolIds.includes(t.id) &&
          memberTalentIds.includes(t.id) &&
          t.status === 'Active'
      );

      if (req.assignedGender === 'Male Only') {
        eligible = eligible.filter((t) => t.gender === 'Male');
      } else if (req.assignedGender === 'Female Only') {
        eligible = eligible.filter((t) => t.gender === 'Female');
      }

      const headcount = Math.max(1, req.requiredHeadcount || 1);
      const pickedIds: string[] = [];

      if (eligible.length > 0) {
        const notAssignedYet = eligible.filter((t) => !assignedInEvent.has(t.id));
        const candidatePool = notAssignedYet.length >= headcount ? notAssignedYet : eligible;

        const effectiveShowIndex = showIndex >= 0 ? showIndex : 0;
        const startIndex = (effectiveShowIndex * headcount) % candidatePool.length;
        for (let i = 0; i < headcount; i++) {
          const idx = (startIndex + i) % candidatePool.length;
          pickedIds.push(candidatePool[idx].id);
        }
      }

      pickedIds.forEach((id) => assignedInEvent.add(id));

      newDuties.push({
        requirementId: req.id,
        itemName: req.itemName,
        position: req.position,
        category: req.category,
        assignedGender: req.assignedGender,
        requiredHeadcount: headcount,
        assignedTalentIds: pickedIds,
        updatedAt: new Date().toISOString()
      });
    }

    return {
      ...ev,
      dutyAssignments: newDuties
    };
  });
}

