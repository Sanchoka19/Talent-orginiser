import { DutyGenderRequirement } from './inventory';

export interface DutyAssignment {
  requirementId: string;
  itemName: string;
  assignedGender: DutyGenderRequirement;
  requiredHeadcount: number;
  assignedTalentIds: string[];
  manualOverrides?: { [originalTalentId: string]: string }; // records talent replacements
  updatedAt?: string;
}

export interface DutyShiftRecord {
  id: string;
  eventId: string;
  groupId: string;
  talentId: string;
  requirementId: string;
  itemName: string;
  assignedAt: string;
  cyclePeriodKey: string; // e.g., '2026-W38' or cycle identifier
  isManualOverride: boolean;
}
