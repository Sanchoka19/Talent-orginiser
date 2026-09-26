import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ScheduleConflict {
  type: 'GROUP_DOUBLE_BOOKED' | 'VENUE_OVERLAP';
  conflictingEventId?: string;
  conflictingEventTitle?: string;
  reason: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  blockingConflicts: ScheduleConflict[];
  warningConflicts: ScheduleConflict[];
}

export interface CandidateEvent {
  id?: string;
  organizationId: string;
  groupId: string;
  hotelId: string;
  startDateTime: Date | string;
  endDateTime: Date | string;
  lobbyDateTime?: Date | string | null;
  lobbyTime?: string | null;
}

@Injectable()
export class ConflictDetectorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Checks if two time intervals [startA, endA) and [startB, endB) overlap.
   */
  doIntervalsOverlap(
    startA: Date | string,
    endA: Date | string,
    startB: Date | string,
    endB: Date | string,
  ): boolean {
    const tStartA = new Date(startA).getTime();
    const tEndA = new Date(endA).getTime();
    const tStartB = new Date(startB).getTime();
    const tEndB = new Date(endB).getTime();

    return tStartA < tEndB && tEndA > tStartB;
  }

  /**
   * Resolves the start time for the group's busy window, which includes lobby/gathering time.
   */
  private resolveGroupStartTime(event: {
    startDateTime: Date | string;
    lobbyDateTime?: Date | string | null;
    lobbyTime?: string | null;
  }): Date {
    if (event.lobbyDateTime) {
      return new Date(event.lobbyDateTime);
    }
    if (event.lobbyTime) {
      const datePart = new Date(event.startDateTime).toISOString().split('T')[0];
      return new Date(`${datePart}T${event.lobbyTime}:00`);
    }
    return new Date(event.startDateTime);
  }

  /**
   * Validates a candidate show event against database records for potential collisions.
   */
  async checkConflicts(candidate: CandidateEvent): Promise<ConflictCheckResult> {
    const blockingConflicts: ScheduleConflict[] = [];
    const warningConflicts: ScheduleConflict[] = [];

    const candidateStart = new Date(candidate.startDateTime);
    const candidateEnd = new Date(candidate.endDateTime);

    if (candidateEnd.getTime() <= candidateStart.getTime()) {
      return {
        hasConflict: true,
        blockingConflicts: [
          {
            type: 'GROUP_DOUBLE_BOOKED',
            reason: 'Show end time must be after start time',
          },
        ],
        warningConflicts: [],
      };
    }

    const candidateGroupStart = this.resolveGroupStartTime(candidate);

    // Fetch relevant non-cancelled shows for the organization that could overlap
    const potentialOverlaps = await this.prisma.showEvent.findMany({
      where: {
        organizationId: candidate.organizationId,
        status: { not: 'CANCELLED' },
        ...(candidate.id ? { id: { not: candidate.id } } : {}),
        OR: [{ groupId: candidate.groupId }, { hotelId: candidate.hotelId }],
      },
      include: {
        group: { select: { id: true, name: true } },
        venue: { select: { id: true, name: true } },
      },
    });

    for (const event of potentialOverlaps) {
      const eventEnd = new Date(event.endDateTime);
      const eventGroupStart = this.resolveGroupStartTime(event);

      // 1. Group Double-Booking (HARD BLOCKING CONFLICT)
      if (event.groupId === candidate.groupId) {
        const groupOverlaps = this.doIntervalsOverlap(
          candidateGroupStart,
          candidateEnd,
          eventGroupStart,
          eventEnd,
        );

        if (groupOverlaps) {
          const lobbyNote = event.lobbyTime ? ` (Lobby: ${event.lobbyTime})` : '';
          blockingConflicts.push({
            type: 'GROUP_DOUBLE_BOOKED',
            conflictingEventId: event.id,
            conflictingEventTitle: event.title,
            reason: `Group "${event.group.name}" is already booked at "${event.venue.name}" during this timeframe${lobbyNote}. Double-booking is strictly prohibited.`,
          });
        }
      }

      // 2. Venue Overlap (WARNING CONFLICT)
      if (event.hotelId === candidate.hotelId && event.groupId !== candidate.groupId) {
        const eventStart = new Date(event.startDateTime);
        const venueOverlaps = this.doIntervalsOverlap(
          candidateStart,
          candidateEnd,
          eventStart,
          eventEnd,
        );

        if (venueOverlaps) {
          warningConflicts.push({
            type: 'VENUE_OVERLAP',
            conflictingEventId: event.id,
            conflictingEventTitle: event.title,
            reason: `Venue "${event.venue.name}" already has a show scheduled for "${event.group.name}" during this timeframe.`,
          });
        }
      }
    }

    return {
      hasConflict: blockingConflicts.length > 0,
      blockingConflicts,
      warningConflicts,
    };
  }
}
