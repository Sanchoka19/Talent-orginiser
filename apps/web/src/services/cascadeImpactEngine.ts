import { Talent } from '../types/talent';
import { Group } from '../types/group';
import { ShowEvent } from '../types/schedule';
import { InventoryRequirement, DutyGenderRequirement } from '../types/inventory';
import { syncShowsWithGroupRequirements } from './rotationEngine';

export interface CaseAConflict {
  groupId: string;
  groupName: string;
  requirementId: string;
  requirementName: string;
  genderRule: DutyGenderRequirement;
  affectedGenderText: string;
  message: string;
  selectedResolution: 'relax_rule' | 'pause_task';
}

export interface CaseBConflict {
  groupId: string;
  groupName: string;
  requirementId: string;
  requirementName: string;
  requiredHeadcount: number;
  remainingEligibleCount: number;
  genderRule: DutyGenderRequirement;
  message: string;
  selectedResolution: 'reduce_headcount' | 'keep_vacant';
}

export interface PinnedRequirementConflict {
  groupId: string;
  groupName: string;
  requirementId: string;
  requirementName: string;
  category?: string;
}

export interface FutureShowAssignment {
  eventId: string;
  eventTitle: string;
  startDateTime: string;
  dutyItemName: string;
}

export interface CascadeImpactReport {
  talent: Talent;
  hasConflicts: boolean;
  futureShowsCount: number;
  futureDutyAssignments: FutureShowAssignment[];
  pinnedRequirements: PinnedRequirementConflict[];
  caseAConflicts: CaseAConflict[];
  caseBConflicts: CaseBConflict[];
  hasNormalRotationMembers: boolean;
  canTerminateDirectly: boolean;
}

/**
 * Runs a cascade pre-flight impact analysis before terminating a talent's contract
 * or removing them from a group.
 */
export function analyzeContractTerminationImpact(
  talent: Talent,
  talents: Talent[],
  groups: Group[],
  schedule: ShowEvent[],
  targetGroupId?: string
): CascadeImpactReport {
  const now = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Determine affected groups
  const relevantGroups = groups.filter((g) => {
    if (targetGroupId) return g.id === targetGroupId;
    return (g.memberTalentIds || []).includes(talent.id);
  });

  const relevantGroupIds = new Set(relevantGroups.map((g) => g.id));

  // 2. Identify future upcoming shows
  const upcomingShows = schedule.filter(
    (ev) =>
      relevantGroupIds.has(ev.groupId) &&
      ev.status !== 'Completed' &&
      ev.status !== 'Cancelled' &&
      new Date(ev.startDateTime).getTime() >= now
  );

  const futureShowsCount = upcomingShows.length;
  const futureDutyAssignments: FutureShowAssignment[] = [];

  for (const show of upcomingShows) {
    for (const duty of show.dutyAssignments || []) {
      if (duty.assignedTalentIds && duty.assignedTalentIds.includes(talent.id)) {
        futureDutyAssignments.push({
          eventId: show.id,
          eventTitle: show.title,
          startDateTime: show.startDateTime,
          dutyItemName: duty.itemName
        });
      }
    }
  }

  // 3. Identify pinned/dedicated requirements
  const pinnedRequirements: PinnedRequirementConflict[] = [];
  for (const group of relevantGroups) {
    for (const req of group.inventoryRequirements || []) {
      const isPinned =
        req.assignedTalentId === talent.id ||
        (req.assignedTalentIds && req.assignedTalentIds.includes(talent.id));
      if (isPinned) {
        pinnedRequirements.push({
          groupId: group.id,
          groupName: group.name,
          requirementId: req.id,
          requirementName: req.itemName,
          category: req.category
        });
      }
    }
  }

  // 4. Rule violations: Case A & Case B
  const caseAConflicts: CaseAConflict[] = [];
  const caseBConflicts: CaseBConflict[] = [];
  let hasNormalRotationMembers = false;

  const talentFullName = `${talent.firstName} ${talent.lastName}`.trim();

  for (const group of relevantGroups) {
    // Current group talents
    const currentMemberTalents = talents.filter(
      (t) => (group.memberTalentIds || []).includes(t.id)
    );

    // Remaining talents after removal
    const remainingMembers = currentMemberTalents.filter((t) => t.id !== talent.id);
    const remainingActiveMembers = remainingMembers.filter((t) => t.status === 'Active');
    const remainingActiveMales = remainingActiveMembers.filter((t) => t.gender === 'Male');
    const remainingActiveFemales = remainingActiveMembers.filter((t) => t.gender === 'Female');

    for (const req of group.inventoryRequirements || []) {
      // Skip inactive or expired requirements
      if (req.status === 'paused' || req.status === 'needs_attention') continue;
      if (req.endDate && req.endDate < todayStr) continue;

      const headcount = Math.max(1, req.requiredHeadcount || 1);

      // Determine eligible pool
      let pool = remainingActiveMembers;
      if (req.assignedTalentIds && req.assignedTalentIds.length > 1) {
        pool = remainingActiveMembers.filter((t) => req.assignedTalentIds!.includes(t.id));
      }

      if (req.assignedGender === 'Female Only') {
        pool = pool.filter((t) => t.gender === 'Female');
      } else if (req.assignedGender === 'Male Only') {
        pool = pool.filter((t) => t.gender === 'Male');
      }

      const remainingEligibleCount = pool.length;

      // Check Case A:
      // Last female/male and rule requires that gender (leaving 0 performers eligible)
      if (
        req.assignedGender === 'Female Only' &&
        talent.gender === 'Female' &&
        remainingActiveFemales.length === 0
      ) {
        caseAConflicts.push({
          groupId: group.id,
          groupName: group.name,
          requirementId: req.id,
          requirementName: req.itemName,
          genderRule: 'Female Only',
          affectedGenderText: 'ქალი',
          message: `${talentFullName} არის ჯგუფში ერთადერთი ქალი. მისი წასვლით დავალება «${req.itemName} (Female Only)» დარჩება შემსრულებლის გარეშე.`,
          selectedResolution: 'relax_rule'
        });
      } else if (
        req.assignedGender === 'Male Only' &&
        talent.gender === 'Male' &&
        remainingActiveMales.length === 0
      ) {
        caseAConflicts.push({
          groupId: group.id,
          groupName: group.name,
          requirementId: req.id,
          requirementName: req.itemName,
          genderRule: 'Male Only',
          affectedGenderText: 'კაცი',
          message: `${talentFullName} არის ჯგუფში ერთადერთი კაცი. მისი წასვლით დავალება «${req.itemName} (Male Only)» დარჩება შემსრულებლის გარეშე.`,
          selectedResolution: 'relax_rule'
        });
      } else if (remainingEligibleCount === 0 && headcount > 0) {
        // Zero eligible overall
        caseAConflicts.push({
          groupId: group.id,
          groupName: group.name,
          requirementId: req.id,
          requirementName: req.itemName,
          genderRule: req.assignedGender,
          affectedGenderText: req.assignedGender,
          message: `${talentFullName}-ს წასვლით დავალება «${req.itemName}» დარჩება შემსრულებლის გარეშე (ჯგუფში აღარ რჩება შესაფერისი წევრი).`,
          selectedResolution: 'relax_rule'
        });
      } else if (remainingEligibleCount > 0 && remainingEligibleCount < headcount) {
        // Check Case B:
        // Shortage: remaining count is positive but less than required headcount
        caseBConflicts.push({
          groupId: group.id,
          groupName: group.name,
          requirementId: req.id,
          requirementName: req.itemName,
          requiredHeadcount: headcount,
          remainingEligibleCount,
          genderRule: req.assignedGender,
          message: `დავალებას «${req.itemName}» ესაჭიროება ${headcount} წევრი, ჯგუფში კი დარჩება ${remainingEligibleCount}. შემცირდეს მოთხოვნა ${remainingEligibleCount} წევრამდე?`,
          selectedResolution: 'reduce_headcount'
        });
      } else {
        // Case C: Normal rotation member
        hasNormalRotationMembers = true;
      }
    }
  }

  const hasConflicts =
    caseAConflicts.length > 0 ||
    caseBConflicts.length > 0 ||
    pinnedRequirements.length > 0 ||
    futureDutyAssignments.length > 0;

  return {
    talent,
    hasConflicts,
    futureShowsCount,
    futureDutyAssignments,
    pinnedRequirements,
    caseAConflicts,
    caseBConflicts,
    hasNormalRotationMembers,
    canTerminateDirectly: !hasConflicts
  };
}

/**
 * Applies the manager's chosen resolutions to group requirements and recalculates upcoming shows.
 */
export function applyCascadeResolutions(params: {
  talent: Talent;
  caseAResolutions: Record<string, 'relax_rule' | 'pause_task'>;
  caseBResolutions: Record<string, 'reduce_headcount' | 'keep_vacant'>;
  groups: Group[];
  talents: Talent[];
  schedule: ShowEvent[];
  targetGroupId?: string;
}): {
  updatedGroups: Group[];
  updatedSchedule: ShowEvent[];
} {
  const {
    talent,
    caseAResolutions,
    caseBResolutions,
    groups,
    talents,
    schedule,
    targetGroupId
  } = params;

  const now = Date.now();
  const remainingTalents = talents.filter((t) => t.id !== talent.id);

  // 1. Update groups & requirements
  const affectedGroupIds: string[] = [];
  const updatedGroups = groups.map((g) => {
    if (targetGroupId && g.id !== targetGroupId) return g;
    const isMember = (g.memberTalentIds || []).includes(talent.id);
    const hasReqBinding = (g.inventoryRequirements || []).some(
      (r) =>
        r.assignedTalentId === talent.id ||
        (r.assignedTalentIds || []).includes(talent.id) ||
        caseAResolutions[r.id] ||
        caseBResolutions[r.id]
    );

    if (!isMember && !hasReqBinding) return g;

    affectedGroupIds.push(g.id);

    const updatedRequirements: InventoryRequirement[] = (
      g.inventoryRequirements || []
    ).map((req) => {
      let r: InventoryRequirement = { ...req };

      // Case A resolution
      const aChoice = caseAResolutions[r.id];
      if (aChoice === 'relax_rule') {
        r.assignedGender = 'Any';
      } else if (aChoice === 'pause_task') {
        r.status = 'needs_attention';
      }

      // Case B resolution
      const bChoice = caseBResolutions[r.id];
      if (bChoice === 'reduce_headcount') {
        // Calculate remaining eligible members
        const groupMembers = remainingTalents.filter((t) =>
          (g.memberTalentIds || []).includes(t.id) && t.id !== talent.id
        );
        let pool = groupMembers.filter((t) => t.status === 'Active');
        if (r.assignedGender === 'Female Only') {
          pool = pool.filter((t) => t.gender === 'Female');
        } else if (r.assignedGender === 'Male Only') {
          pool = pool.filter((t) => t.gender === 'Male');
        }
        r.requiredHeadcount = Math.max(1, pool.length);
      }
      // If 'keep_vacant', we leave requiredHeadcount untouched

      // Clear pinned talent if it was this talent
      if (r.assignedTalentId === talent.id) {
        r.assignedTalentId = undefined;
      }
      if (r.assignedTalentIds && r.assignedTalentIds.includes(talent.id)) {
        r.assignedTalentIds = r.assignedTalentIds.filter((id) => id !== talent.id);
      }

      return r;
    });

    return {
      ...g,
      memberTalentIds: (g.memberTalentIds || []).filter((id) => id !== talent.id),
      inventoryRequirements: updatedRequirements
    };
  });

  // 2. Clean upcoming schedule and preserve past shows!
  const cleanedSchedule = schedule.map((ev) => {
    const isPast =
      ev.status === 'Completed' || new Date(ev.startDateTime).getTime() < now;
    if (isPast) return ev; // Preserve history!

    return {
      ...ev,
      dutyAssignments: (ev.dutyAssignments || []).map((duty) => {
        const hasTalent = (duty.assignedTalentIds || []).includes(talent.id);
        const hasOverride =
          duty.manualOverrides &&
          (duty.manualOverrides[talent.id] ||
            Object.values(duty.manualOverrides).includes(talent.id));

        if (!hasTalent && !hasOverride) return duty;

        const newOverrides = { ...(duty.manualOverrides || {}) };
        delete newOverrides[talent.id];
        for (const [origKey, replVal] of Object.entries(newOverrides)) {
          if (replVal === talent.id) delete newOverrides[origKey];
        }

        return {
          ...duty,
          assignedTalentIds: (duty.assignedTalentIds || []).filter(
            (tid) => tid !== talent.id
          ),
          manualOverrides:
            Object.keys(newOverrides).length > 0 ? newOverrides : undefined
        };
      })
    };
  });

  // 3. Re-run rotation on upcoming shows for affected groups
  let resyncedSchedule = cleanedSchedule;
  for (const gId of affectedGroupIds) {
    const updatedGroup = updatedGroups.find((g) => g.id === gId);
    if (updatedGroup) {
      resyncedSchedule = syncShowsWithGroupRequirements(
        updatedGroup,
        resyncedSchedule,
        remainingTalents
      );
    }
  }

  return {
    updatedGroups,
    updatedSchedule: resyncedSchedule
  };
}
