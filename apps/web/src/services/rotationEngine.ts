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

  // Tracks duty counts per talent in this specific show
  const assignedInEventCounts = new Map<string, number>();
  const allowMultiDuty = group.allowMultiDuty !== false; // Enabled by default so duties are never left unhandled

  const assignments: DutyAssignment[] = [];

  for (const req of group.inventoryRequirements) {
    // Check duty active date range
    if (req.startDate || req.endDate) {
      const evDateStr = typeof eventDate === 'string' ? eventDate.split('T')[0] : eventDate.toISOString().split('T')[0];
      if (req.startDate && evDateStr < req.startDate) continue;
      if (req.endDate && evDateStr > req.endDate) continue;
    }

    const selectedIds: string[] = [];

    // ── Step 1: Honour fixed/pinned talent if available ──────────────────────
    const isExplicitPool = Boolean(req.assignedTalentIds && req.assignedTalentIds.length > 1);
    const fixedTalentId = isExplicitPool
      ? undefined
      : (req.assignedTalentId ||
        (req.assignedTalentIds && req.assignedTalentIds.length === 1
          ? req.assignedTalentIds[0]
          : undefined));

    if (fixedTalentId) {
      const designatedTalent = allTalents.find((t) => t.id === fixedTalentId);
      const inEventCount = assignedInEventCounts.get(fixedTalentId) || 0;

      if (
        designatedTalent &&
        designatedTalent.status === 'Active' &&
        group.memberTalentIds.includes(designatedTalent.id) &&
        (allowMultiDuty || inEventCount === 0)
      ) {
        selectedIds.push(designatedTalent.id);
        assignedInEventCounts.set(designatedTalent.id, inEventCount + 1);
        dutyCounts.set(designatedTalent.id, (dutyCounts.get(designatedTalent.id) || 0) + 1);
      }
    }

    // ── Step 2: Fill remaining headcount from the fairness pool ──────────────
    const neededCount = Math.max(0, req.requiredHeadcount - selectedIds.length);
    if (neededCount > 0) {
      const poolIds = isExplicitPool
        ? req.assignedTalentIds!
        : group.memberTalentIds;

      const memberTalents = allTalents.filter(
        (t) => poolIds.includes(t.id) && group.memberTalentIds.includes(t.id)
      );

      // Active talents, not already assigned to THIS exact requirement
      let eligible = memberTalents.filter(
        (t) => t.status === 'Active' && !selectedIds.includes(t.id)
      );

      // Gender filter
      if (req.assignedGender === 'Male Only') {
        eligible = eligible.filter((t) => t.gender === 'Male');
      } else if (req.assignedGender === 'Female Only') {
        eligible = eligible.filter((t) => t.gender === 'Female');
      }

      // First pass: Candidates with 0 duties in this show (1-to-1 rule)
      const unassignedInEvent = eligible.filter(
        (t) => (assignedInEventCounts.get(t.id) || 0) === 0
      );

      const pickedFirstPass = selectFairRandomTalents(
        unassignedInEvent,
        neededCount,
        dutyCounts
      );

      for (const id of pickedFirstPass) {
        selectedIds.push(id);
        assignedInEventCounts.set(id, (assignedInEventCounts.get(id) || 0) + 1);
        dutyCounts.set(id, (dutyCounts.get(id) || 0) + 1);
      }

      // Second pass: Multi-Duty allowance
      // If headcount is still needed and allowMultiDuty is enabled:
      // Distribute extra duties to members with the lowest historical duty load
      const stillNeeded = neededCount - pickedFirstPass.length;
      if (stillNeeded > 0 && allowMultiDuty) {
        const multiCandidates = eligible.filter((t) => !selectedIds.includes(t.id));

        if (multiCandidates.length > 0) {
          const sortedMulti = [...multiCandidates].sort((a, b) => {
            const countInEventA = assignedInEventCounts.get(a.id) || 0;
            const countInEventB = assignedInEventCounts.get(b.id) || 0;
            if (countInEventA !== countInEventB) {
              return countInEventA - countInEventB; // Prioritize 1-duty before 2-duty members
            }
            const histA = dutyCounts.get(a.id) || 0;
            const histB = dutyCounts.get(b.id) || 0;
            if (histA !== histB) {
              return histA - histB; // Lowest historical duty load gets the extra duty!
            }
            return Math.random() - 0.5;
          });

          const pickedSecondPass = sortedMulti.slice(0, stillNeeded).map((t) => t.id);
          for (const id of pickedSecondPass) {
            selectedIds.push(id);
            assignedInEventCounts.set(id, (assignedInEventCounts.get(id) || 0) + 1);
            dutyCounts.set(id, (dutyCounts.get(id) || 0) + 1);
          }
        }
      }
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
  const isReplacing = originalTalentId && duty.assignedTalentIds.includes(originalTalentId);
  const newAssignedIds = isReplacing
    ? duty.assignedTalentIds.map((id) => (id === originalTalentId ? replacementTalentId : id))
    : Array.from(new Set([...duty.assignedTalentIds, replacementTalentId]));

  const overrideKey = originalTalentId || `manual_assigned_${Date.now()}`;

  return {
    ...duty,
    assignedTalentIds: newAssignedIds,
    manualOverrides: {
      ...(duty.manualOverrides || {}),
      [overrideKey]: replacementTalentId
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
  const allowMultiDuty = group.allowMultiDuty !== false; // Enabled by default

  // Cumulative duty counts to track rotation history across shows
  const cumulativeDutyCounts = new Map<string, number>();

  // Pre-seed cumulative counts with past events in this group
  for (const ev of currentSchedule) {
    if (ev.groupId !== group.id || ev.status === 'Cancelled') continue;
    const isPast =
      ev.status === 'Completed' ||
      new Date(ev.startDateTime).getTime() < Date.now();
    if (isPast && ev.dutyAssignments) {
      for (const d of ev.dutyAssignments) {
        for (const id of d.assignedTalentIds || []) {
          cumulativeDutyCounts.set(id, (cumulativeDutyCounts.get(id) || 0) + 1);
        }
      }
    }
  }

  return currentSchedule.map((ev) => {
    if (ev.groupId !== group.id) return ev;

    // Protect past and completed shows from being modified by rotation sync
    const isPastOrCompleted =
      ev.status === 'Completed' ||
      new Date(ev.startDateTime).getTime() < Date.now();
    if (isPastOrCompleted) return ev;

    const showIndex = groupShows.findIndex((s) => s.id === ev.id);
    const existingDuties = ev.dutyAssignments || [];
    const newDuties: DutyAssignment[] = [];
    const assignedInEventCounts = new Map<string, number>();

    for (const req of reqs) {
      // 1. Check validity dates!
      if (req.startDate || req.endDate) {
        const evDateStr = ev.startDateTime.split('T')[0];
        if (req.startDate && evDateStr < req.startDate) continue;
        if (req.endDate && evDateStr > req.endDate) continue;
      }

      // Check paused / needs attention status
      if (req.status === 'paused' || req.status === 'needs_attention') {
        newDuties.push({
          requirementId: req.id,
          itemName: req.itemName,
          position: req.position,
          category: req.category,
          assignedGender: req.assignedGender,
          requiredHeadcount: Math.max(1, req.requiredHeadcount || 1),
          assignedTalentIds: [],
          updatedAt: new Date().toISOString()
        });
        continue;
      }

      const isExplicitPool = Boolean(req.assignedTalentIds && req.assignedTalentIds.length > 1);
      const fixedTalentId = isExplicitPool
        ? undefined
        : (req.assignedTalentId ||
          (req.assignedTalentIds && req.assignedTalentIds.length === 1
            ? req.assignedTalentIds[0]
            : undefined));

      const existingDuty = existingDuties.find(
        (d) => d.requirementId === req.id || (d.itemName === req.itemName && d.position === req.position)
      );

      // 1. Manual override preserved
      if (existingDuty?.manualOverrides && Object.keys(existingDuty.manualOverrides).length > 0) {
        newDuties.push(existingDuty);
        existingDuty.assignedTalentIds.forEach((id) => {
          assignedInEventCounts.set(id, (assignedInEventCounts.get(id) || 0) + 1);
          cumulativeDutyCounts.set(id, (cumulativeDutyCounts.get(id) || 0) + 1);
        });
        continue;
      }

      // 2. Fixed talent rule
      if (fixedTalentId) {
        const talent = allTalents.find((t) => t.id === fixedTalentId);
        const inEventCount = assignedInEventCounts.get(fixedTalentId) || 0;
        if (talent && talent.status === 'Active' && (allowMultiDuty || inEventCount === 0)) {
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
          assignedInEventCounts.set(fixedTalentId, inEventCount + 1);
          cumulativeDutyCounts.set(fixedTalentId, (cumulativeDutyCounts.get(fixedTalentId) || 0) + 1);
          continue;
        }
      }

      // 3. Existing valid assignment without change
      if (
        existingDuty &&
        existingDuty.assignedTalentIds &&
        existingDuty.assignedTalentIds.length >= Math.max(1, req.requiredHeadcount || 1)
      ) {
        const poolIds = isExplicitPool
          ? req.assignedTalentIds!
          : memberTalentIds;

        const stillEligible = existingDuty.assignedTalentIds.every((id) => {
          const t = allTalents.find((tal) => tal.id === id);
          if (!t || t.status !== 'Active' || !poolIds.includes(t.id)) return false;
          if (req.assignedGender === 'Male Only' && t.gender !== 'Male') return false;
          if (req.assignedGender === 'Female Only' && t.gender !== 'Female') return false;
          if (!allowMultiDuty && (assignedInEventCounts.get(id) || 0) > 0) return false;
          return true;
        });

        if (stillEligible) {
          newDuties.push(existingDuty);
          existingDuty.assignedTalentIds.forEach((id) => {
            assignedInEventCounts.set(id, (assignedInEventCounts.get(id) || 0) + 1);
            cumulativeDutyCounts.set(id, (cumulativeDutyCounts.get(id) || 0) + 1);
          });
          continue;
        }
      }

      // 4. Generate assignment via fair rotation pool
      const poolIds = isExplicitPool
        ? req.assignedTalentIds!
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
        // First pass: Candidates not assigned to any duty in this show yet (1-to-1 rule)
        const notAssignedYet = eligible.filter((t) => (assignedInEventCounts.get(t.id) || 0) === 0);

        const evDate = new Date(ev.startDateTime);
        const baseDate = groupShows[0] ? new Date(groupShows[0].startDateTime) : evDate;
        const diffDays = Math.max(0, Math.floor((evDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)));
        const effectiveShowIndex = showIndex >= 0 ? showIndex : 0;

        let rotationStep = effectiveShowIndex;
        if (req.rotationCycle === 'weekly') {
          rotationStep = Math.floor(diffDays / 7);
        } else if (req.rotationCycle === 'monthly') {
          rotationStep = Math.max(0, (evDate.getFullYear() - baseDate.getFullYear()) * 12 + (evDate.getMonth() - baseDate.getMonth()));
        } else if (req.rotationCycle === 'custom') {
          const val = Math.max(1, req.customRotationValue || 2);
          if (req.customRotationUnit === 'day') {
            rotationStep = Math.floor(diffDays / val);
          } else if (req.customRotationUnit === 'week') {
            rotationStep = Math.floor(diffDays / (val * 7));
          } else {
            rotationStep = Math.floor(effectiveShowIndex / val);
          }
        } else if (req.rotationCycle === 'fixed') {
          rotationStep = 0;
        } else {
          rotationStep = effectiveShowIndex;
        }

        if (notAssignedYet.length > 0) {
          // Sort unassigned candidates primarily by cumulative duty history (fairness)
          const sortedUnassigned = [...notAssignedYet].sort((a, b) => {
            const histA = cumulativeDutyCounts.get(a.id) || 0;
            const histB = cumulativeDutyCounts.get(b.id) || 0;
            if (histA !== histB) return histA - histB;
            return notAssignedYet.indexOf(a) - notAssignedYet.indexOf(b);
          });

          const countToPick = Math.min(headcount, sortedUnassigned.length);
          const startIndex = sortedUnassigned.length > 0 ? (rotationStep * headcount) % sortedUnassigned.length : 0;
          for (let i = 0; i < countToPick; i++) {
            const idx = (startIndex + i) % sortedUnassigned.length;
            const candId = sortedUnassigned[idx].id;
            if (!pickedIds.includes(candId)) {
              pickedIds.push(candId);
            }
          }
        }

        // Second pass: Multi-Duty allowance
        // "თუ წესებში ჩართულია მრავალჯერადი მოვალეობა, სისტემა 4 ადამიანს გაანაწილებს 4 ინვენტარზე,
        // ხოლო მე-5 ინვენტარს დაუმატებს იმ ადამიანს, ვისაც როტაციის ისტორიით ყველაზე ნაკლები დატვირთვა ჰქონდა.
        // შესაბამისად, ერთ ადამიანს ექნება 2 ინვენტარი, დანარჩენ სამს კი — თითო."
        const stillNeeded = headcount - pickedIds.length;
        if (stillNeeded > 0 && allowMultiDuty) {
          const multiCandidates = eligible.filter((t) => !pickedIds.includes(t.id));

          if (multiCandidates.length > 0) {
            const sortedMulti = [...multiCandidates].sort((a, b) => {
              const inEventA = assignedInEventCounts.get(a.id) || 0;
              const inEventB = assignedInEventCounts.get(b.id) || 0;
              if (inEventA !== inEventB) {
                return inEventA - inEventB; // Prioritize members with fewer duties in this show
              }
              const histA = cumulativeDutyCounts.get(a.id) || 0;
              const histB = cumulativeDutyCounts.get(b.id) || 0;
              if (histA !== histB) {
                return histA - histB; // Lowest historical duty load gets the extra duty!
              }
              return eligible.indexOf(a) - eligible.indexOf(b);
            });

            const pickedSecond = sortedMulti.slice(0, stillNeeded).map((t) => t.id);
            for (const id of pickedSecond) {
              if (!pickedIds.includes(id)) {
                pickedIds.push(id);
              }
            }
          }
        }
      }

      pickedIds.forEach((id) => {
        assignedInEventCounts.set(id, (assignedInEventCounts.get(id) || 0) + 1);
        cumulativeDutyCounts.set(id, (cumulativeDutyCounts.get(id) || 0) + 1);
      });

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

