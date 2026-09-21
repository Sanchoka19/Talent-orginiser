import { checkScheduleConflicts, doIntervalsOverlap } from './conflictDetector';
import {
  selectFairRandomTalents,
  generateAutomatedDutiesForEvent,
  applyManualDutyOverride,
  getEligibleTalentsForRequirement
} from './rotationEngine';
import { INITIAL_TALENTS, INITIAL_GROUPS, INITIAL_VENUES, INITIAL_SCHEDULE } from './storage';
import { Talent } from '../types/talent';
import { Group } from '../types/group';
import { ShowEvent } from '../types/schedule';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  [OK] ${message}`);
}

console.log('=== TEST SUITE: ArtistePulse Core Business Logic ===\n');

// 1. Conflict Prevention Tests
console.log('1. Testing Conflict Prevention Engine:');
{
  const testGroup = INITIAL_GROUPS[0]; // Solaris Cirque Troupe
  const testVenue1 = INITIAL_VENUES[0]; // The Venetian
  const testVenue2 = INITIAL_VENUES[1]; // Bellagio

  // Existing event: Solaris at Venetian on 2026-09-22 19:00 - 22:30
  const candidateConflict = {
    groupId: testGroup.id,
    hotelId: testVenue2.id, // Different hotel!
    startDateTime: '2026-09-22T20:00:00', // Overlaps!
    endDateTime: '2026-09-22T23:00:00'
  };

  const result = checkScheduleConflicts(
    candidateConflict,
    INITIAL_SCHEDULE,
    INITIAL_GROUPS,
    INITIAL_VENUES
  );

  assert(result.hasConflict === true, 'Blocks overlapping event for the same group');
  assert(
    result.blockingConflicts.length > 0,
    'Returns blocking conflict with double-booking error'
  );
  assert(
    result.blockingConflicts[0].type === 'GROUP_DOUBLE_BOOKED',
    'Identifies conflict type as GROUP_DOUBLE_BOOKED'
  );

  // Non-overlapping test: Same group, next morning
  const nonConflict = {
    groupId: testGroup.id,
    hotelId: testVenue2.id,
    startDateTime: '2026-09-23T10:00:00',
    endDateTime: '2026-09-23T13:00:00'
  };

  const nonResult = checkScheduleConflicts(
    nonConflict,
    INITIAL_SCHEDULE,
    INITIAL_GROUPS,
    INITIAL_VENUES
  );

  assert(nonResult.hasConflict === false, 'Allows non-overlapping shows for the same group');
}

// 2. Automated Duty Rotation (Fair Random & Availability Rules) Tests
console.log('\n2. Testing Automated Duty Rotation & Eligibility Rules:');
{
  const group = INITIAL_GROUPS[0];
  const audioRequirement = group.inventoryRequirements.find(
    (r) => r.itemName === 'Heavy Audio Rig'
  )!; // Requires 2 Males
  const costumeRequirement = group.inventoryRequirements.find(
    (r) => r.itemName === 'Costume Bags & Wardrobe'
  )!; // Requires 2 Females

  // Check exclusion of non-active talents
  const eligibleMales = getEligibleTalentsForRequirement(group, INITIAL_TALENTS, audioRequirement);
  assert(
    eligibleMales.every((t) => t.gender === 'Male' && t.status === 'Active'),
    'Eligible male pool strictly contains Active males only'
  );
  assert(
    !eligibleMales.some((t) => t.status === 'Rest' || t.status === 'Sick/Injured'),
    'Non-active talents (Rest / Sick/Injured) are strictly excluded from duty pools'
  );

  const eligibleFemales = getEligibleTalentsForRequirement(
    group,
    INITIAL_TALENTS,
    costumeRequirement
  );
  assert(
    eligibleFemales.every((t) => t.gender === 'Female' && t.status === 'Active'),
    'Eligible female pool strictly contains Active females only'
  );
  assert(
    !eligibleFemales.some((t) => t.id === 't-5'), // Elena Kovaleva is on Rest
    'Performer on Rest (Elena Kovaleva) is excluded from duty pools'
  );

  // Round-robin lowest frequency test:
  // Talent A has 1 shift, Talent B has 0 shifts, Talent C has 0 shifts
  const mockCandidates: Talent[] = [
    { id: 'c-1', firstName: 'A', lastName: 'A', gender: 'Male', status: 'Active' } as any,
    { id: 'c-2', firstName: 'B', lastName: 'B', gender: 'Male', status: 'Active' } as any,
    { id: 'c-3', firstName: 'C', lastName: 'C', gender: 'Male', status: 'Active' } as any
  ];
  const dutyCounts = new Map<string, number>([
    ['c-1', 1],
    ['c-2', 0],
    ['c-3', 0]
  ]);

  const selectedIds = selectFairRandomTalents(mockCandidates, 2, dutyCounts);
  assert(selectedIds.length === 2, 'Selects exact required headcount (2)');
  assert(
    selectedIds.includes('c-2') && selectedIds.includes('c-3'),
    'Prioritizes candidates with 0 shifts over candidates with 1 shift (round-robin fairness)'
  );
  assert(!selectedIds.includes('c-1'), 'Excludes higher-frequency candidates until round-robin completes');
}

// 3. Admin Duty Override Test
console.log('\n3. Testing Admin Duty Override / Swap:');
{
  const duty = {
    requirementId: 'ir-1',
    itemName: 'Heavy Audio Rig',
    assignedGender: 'Male Only' as any,
    requiredHeadcount: 2,
    assignedTalentIds: ['t-2', 't-4']
  };

  const overridden = applyManualDutyOverride(duty, 't-2', 't-8');
  assert(
    overridden.assignedTalentIds.includes('t-8') && !overridden.assignedTalentIds.includes('t-2'),
    'Replaces original talent with manual override replacement'
  );
  assert(
    overridden.manualOverrides?.['t-2'] === 't-8',
    'Records audit trail of manual override without breaking future cycle tracking'
  );
}

console.log('\n[SUCCESS] ALL VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
