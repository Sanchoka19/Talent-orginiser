// Shared Domain Models & Contracts

export interface Talent {
  id: string;
  stageName: string;
  legalName?: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  skills?: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  organizationId: string;
  description?: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  talentId: string;
  roleNote?: string;
  talent?: Talent;
}

export interface Venue {
  id: string;
  name: string;
  organizationId: string;
  location?: string;
}

export interface Schedule {
  id: string;
  name: string;
  organizationId: string;
  groupId?: string;
  hotelId?: string;
  startDate: string;
  endDate: string;
}

export interface DutySwapRequest {
  showEventId: string;
  dutyAssignmentId: string;
  originalTalentId: string;
  replacementTalentId: string;
  reason?: string;
}

export interface FairnessScoreResponse {
  groupId: string;
  cycleKey: string;
  score: number;
}
