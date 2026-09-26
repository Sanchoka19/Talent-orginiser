import { DutyAssignment } from './duty';

export type CalendarViewMode = 'day' | 'week' | 'month' | 'year';

export interface ShowEvent {
  id: string;
  title: string;
  groupId: string;
  hotelId: string;
  startDateTime: string; // ISO 8601 string, e.g. "2026-09-22T19:00:00"
  endDateTime: string;   // ISO 8601 string, e.g. "2026-09-22T22:00:00"
  lobbyTime?: string;    // HH:MM string, e.g. "18:00"
  lobbyDateTime?: string;// ISO 8601 string, e.g. "2026-09-22T18:00:00"
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  dutyAssignments: DutyAssignment[];
  notes?: string;
  recurringGroupId?: string;
  createdAt: string;
}

export interface ScheduleConflict {
  type: 'GROUP_DOUBLE_BOOKED' | 'VENUE_OVERLAP';
  conflictingEvent?: ShowEvent;
  reason: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  blockingConflicts: ScheduleConflict[];
  warningConflicts: ScheduleConflict[];
}
