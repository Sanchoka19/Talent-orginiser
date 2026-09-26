import { ShowEvent, ConflictCheckResult, ScheduleConflict } from '../types/schedule';
import { Group } from '../types/group';
import { HotelVenue } from '../types/venue';
import { getStoredTimeFormat } from './storage';
import { formatTimeRangeWithFormat } from '../utils/timeFormat';

/**
 * Checks if two time intervals overlap.
 * Intervals are [startA, endA) and [startB, endB).
 */
export function doIntervalsOverlap(
  startA: Date | string,
  endA: Date | string,
  startB: Date | string,
  endB: Date | string
): boolean {
  const tStartA = new Date(startA).getTime();
  const tEndA = new Date(endA).getTime();
  const tStartB = new Date(startB).getTime();
  const tEndB = new Date(endB).getTime();

  return tStartA < tEndB && tEndA > tStartB;
}

/**
 * Detects scheduling conflicts for a candidate event against the existing schedule.
 * Rule: The same group cannot be booked in two different hotels at the same time.
 */
export function checkScheduleConflicts(
  candidate: {
    id?: string;
    groupId: string;
    hotelId: string;
    startDateTime: string;
    endDateTime: string;
    lobbyTime?: string;
    lobbyDateTime?: string;
  },
  existingEvents: ShowEvent[],
  groups: Group[],
  venues: HotelVenue[]
): ConflictCheckResult {
  const blockingConflicts: ScheduleConflict[] = [];
  const warningConflicts: ScheduleConflict[] = [];

  const groupMap = new Map(groups.map((g) => [g.id, g.name]));
  const venueMap = new Map(venues.map((v) => [v.id, v.name]));

  // Candidate group busy window starts from lobby/gathering time
  const candidateGroupStart =
    candidate.lobbyDateTime ||
    (candidate.lobbyTime
      ? `${candidate.startDateTime.split('T')[0]}T${candidate.lobbyTime}:00`
      : candidate.startDateTime);

  for (const event of existingEvents) {
    // Skip checking against itself when editing an existing event
    if (candidate.id && event.id === candidate.id) {
      continue;
    }

    // Skip cancelled events
    if (event.status === 'Cancelled') {
      continue;
    }

    // Existing event group busy window starts from lobby/gathering time
    const eventGroupStart =
      event.lobbyDateTime ||
      (event.lobbyTime
        ? `${event.startDateTime.split('T')[0]}T${event.lobbyTime}:00`
        : event.startDateTime);

    // 1. Group Double-Booking (HARD BLOCK): Check overlap from lobby time to show end
    const groupOverlaps = doIntervalsOverlap(
      candidateGroupStart,
      candidate.endDateTime,
      eventGroupStart,
      event.endDateTime
    );

    if (groupOverlaps && event.groupId === candidate.groupId) {
      const groupName = groupMap.get(candidate.groupId) || 'Group';
      const venueName = venueMap.get(event.hotelId) || 'Hotel';
      const existingLobby = event.lobbyTime ? ` (Lobby: ${event.lobbyTime})` : '';
      const timeFormat = getStoredTimeFormat();
      const timeRangeStr = formatTimeRangeWithFormat(event.startDateTime, event.endDateTime, timeFormat);
      blockingConflicts.push({
        type: 'GROUP_DOUBLE_BOOKED',
        conflictingEvent: event,
        reason: `Group "${groupName}" is already booked at "${venueName}" during this timeframe${existingLobby} (${timeRangeStr}). Double-booking is strictly prohibited.`
      });
    }

    // 2. Venue Overlap (Warning if different group at same venue stage)
    const venueOverlaps = doIntervalsOverlap(
      candidate.startDateTime,
      candidate.endDateTime,
      event.startDateTime,
      event.endDateTime
    );

    if (venueOverlaps && event.hotelId === candidate.hotelId && event.groupId !== candidate.groupId) {
      const otherGroupName = groupMap.get(event.groupId) || 'Another Group';
      const venueName = venueMap.get(candidate.hotelId) || 'Hotel';
      warningConflicts.push({
        type: 'VENUE_OVERLAP',
        conflictingEvent: event,
        reason: `Venue "${venueName}" already has a show scheduled for "${otherGroupName}" during this timeframe.`
      });
    }
  }

  return {
    hasConflict: blockingConflicts.length > 0,
    blockingConflicts,
    warningConflicts
  };
}
