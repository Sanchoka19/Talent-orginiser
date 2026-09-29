'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Talent, ContractRecord, TalentStatus } from '../types/talent';
import { Group } from '../types/group';
import { HotelVenue } from '../types/venue';
import { ShowEvent, ConflictCheckResult } from '../types/schedule';
import { DutyAssignment } from '../types/duty';
import { UserProfile } from '../types/user';
import {
  getStoredTalents,
  saveStoredTalents,
  getStoredGroups,
  saveStoredGroups,
  getStoredVenues,
  saveStoredVenues,
  getStoredSchedule,
  saveStoredSchedule,
  getStoredUserProfile,
  saveStoredUserProfile,
  resetToDemoData,
  TimeFormat,
  getStoredTimeFormat,
  saveStoredTimeFormat
} from '../services/storage';
import { formatTimeWithFormat, formatTimeRangeWithFormat } from '../utils/timeFormat';
import { checkScheduleConflicts } from '../services/conflictDetector';
import {
  generateAutomatedDutiesForEvent,
  applyManualDutyOverride,
  computeHistoricalDutyCounts,
  computeFairnessScore,
  getCycleKey,
  syncShowsWithGroupRequirements
} from '../services/rotationEngine';
import { applyCascadeResolutions } from '../services/cascadeImpactEngine';

interface AppContextType {
  talents: Talent[];
  groups: Group[];
  venues: HotelVenue[];
  schedule: ShowEvent[];
  selectedTalent: Talent | null;
  setSelectedTalent: (talent: Talent | null) => void;
  currentUser: UserProfile;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  // Time Format Preferences
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  formatTime: (timeOrDate: Date | string | number | undefined | null) => string;
  formatTimeRange: (
    start: Date | string | number | undefined | null,
    end: Date | string | number | undefined | null
  ) => string;
  // Talent Actions
  addTalent: (talent: Omit<Talent, 'id' | 'createdAt'>) => Talent;
  updateTalent: (id: string, updates: Partial<Talent>) => void;
  deleteTalent: (id: string) => void;
  // Group Actions
  addGroup: (group: Omit<Group, 'id' | 'createdAt'>) => Group;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  // Venue Actions
  addVenue: (venue: Omit<HotelVenue, 'id' | 'createdAt'>) => HotelVenue;
  updateVenue: (id: string, updates: Partial<HotelVenue>) => void;
  deleteVenue: (id: string) => void;
  // Schedule Actions
  addShowEvent: (
    event: Omit<ShowEvent, 'id' | 'createdAt' | 'dutyAssignments'>,
    autoAssignDuties?: boolean
  ) => { event?: ShowEvent; conflictResult?: ConflictCheckResult };
  updateShowEvent: (
    id: string,
    updates: Partial<ShowEvent>,
    recomputeDuties?: boolean
  ) => { success: boolean; conflictResult?: ConflictCheckResult };
  deleteShowEvent: (id: string) => void;
  // Duty Actions
  swapDutyTalent: (
    eventId: string,
    requirementId: string,
    originalTalentId: string,
    replacementTalentId: string
  ) => void;
  regenerateDutiesForEvent: (eventId: string) => void;
  getGroupFairnessScore: (groupId: string) => number;
  // Check conflicts
  validateConflict: (candidate: {
    id?: string;
    groupId: string;
    hotelId: string;
    startDateTime: string;
    endDateTime: string;
    lobbyTime?: string;
    lobbyDateTime?: string;
  }) => ConflictCheckResult;
  // Cascade Termination
  terminateTalentWithCascade: (
    talentId: string,
    resolutions: {
      caseAResolutions: Record<string, 'relax_rule' | 'pause_task'>;
      caseBResolutions: Record<string, 'reduce_headcount' | 'keep_vacant'>;
    },
    reviewData?: Partial<ContractRecord>
  ) => void;
  // Status Change with Duty Resolution
  changeTalentStatusWithDutyResolution: (
    talentId: string,
    newStatus: TalentStatus,
    resolution: {
      mode: 'auto' | 'manual';
      replacements?: Record<string, string>;
    }
  ) => void;
  // Reset
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [talents, setTalents] = useState<Talent[]>(() => getStoredTalents());
  const [groups, setGroups] = useState<Group[]>(() => getStoredGroups());
  const [venues, setVenues] = useState<HotelVenue[]>(() => getStoredVenues());
  const [schedule, setSchedule] = useState<ShowEvent[]>(() => getStoredSchedule());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getStoredUserProfile());
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => getStoredTimeFormat());

  const setTimeFormat = (fmt: TimeFormat) => {
    setTimeFormatState(fmt);
    saveStoredTimeFormat(fmt);
  };

  const formatTime = (timeOrDate: Date | string | number | undefined | null) => {
    return formatTimeWithFormat(timeOrDate, timeFormat);
  };

  const formatTimeRange = (
    start: Date | string | number | undefined | null,
    end: Date | string | number | undefined | null
  ) => {
    return formatTimeRangeWithFormat(start, end, timeFormat);
  };

  // Sync to storage
  useEffect(() => {
    saveStoredTalents(talents);
  }, [talents]);

  useEffect(() => {
    saveStoredGroups(groups);
  }, [groups]);

  useEffect(() => {
    saveStoredVenues(venues);
  }, [venues]);

  useEffect(() => {
    saveStoredSchedule(schedule);
  }, [schedule]);

  useEffect(() => {
    saveStoredUserProfile(currentUser);
  }, [currentUser]);

  // One-time initial sync: attach duties to any existing group shows that have missing duty assignments
  useEffect(() => {
    setSchedule((prevSchedule) => {
      let current = prevSchedule;
      for (const group of groups) {
        if (group.inventoryRequirements && group.inventoryRequirements.length > 0) {
          current = syncShowsWithGroupRequirements(group, current, talents);
        }
      }
      return current;
    });
  }, []);

  const updateCurrentUser = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  // TALENT ACTIONS (with cascade cleanup)
  const addTalent = (talentData: Omit<Talent, 'id' | 'createdAt'>): Talent => {
    const newTalent: Talent = {
      ...talentData,
      id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    setTalents((prev) => [newTalent, ...prev]);
    return newTalent;
  };

  const updateTalent = (id: string, updates: Partial<Talent>) => {
    const isTerminatedOrArchived =
      updates.isArchived === true ||
      updates.contractStatus === 'terminated' ||
      updates.status === 'Terminated';

    setTalents((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    if (isTerminatedOrArchived) {
      if (selectedTalent?.id === id) {
        setSelectedTalent(null);
      }

      // Remove from all group memberships & requirement bindings
      let affectedGroupIds: string[] = [];
      setGroups((prev) =>
        prev.map((g) => {
          const hasMember = (g.memberTalentIds || []).includes(id);
          const hasReq = (g.inventoryRequirements || []).some(
            (r) => r.assignedTalentId === id || (r.assignedTalentIds || []).includes(id)
          );
          if (!hasMember && !hasReq) return g;

          affectedGroupIds.push(g.id);
          return {
            ...g,
            memberTalentIds: (g.memberTalentIds || []).filter((mid) => mid !== id),
            inventoryRequirements: (g.inventoryRequirements || []).map((req) => ({
              ...req,
              assignedTalentId: req.assignedTalentId === id ? undefined : req.assignedTalentId,
              assignedTalentIds: req.assignedTalentIds
                ? req.assignedTalentIds.filter((tid) => tid !== id)
                : undefined
            }))
          };
        })
      );

      // Clean up from shows & duty assignments
      setSchedule((prev) => {
        const cleanedSchedule = prev.map((ev) => ({
          ...ev,
          dutyAssignments: (ev.dutyAssignments || []).map((duty) => {
            const hasTalent = duty.assignedTalentIds.includes(id);
            const hasOverride =
              duty.manualOverrides &&
              (duty.manualOverrides[id] || Object.values(duty.manualOverrides).includes(id));

            if (!hasTalent && !hasOverride) return duty;

            const newOverrides = { ...(duty.manualOverrides || {}) };
            delete newOverrides[id];
            for (const [origKey, replVal] of Object.entries(newOverrides)) {
              if (replVal === id) delete newOverrides[origKey];
            }

            return {
              ...duty,
              assignedTalentIds: duty.assignedTalentIds.filter((tid) => tid !== id),
              manualOverrides: Object.keys(newOverrides).length > 0 ? newOverrides : undefined
            };
          })
        }));

        // Resync affected groups shows with remaining talents
        let resynced = cleanedSchedule;
        for (const gId of affectedGroupIds) {
          const targetGroup = groups.find((g) => g.id === gId);
          if (targetGroup) {
            const updatedG = {
              ...targetGroup,
              memberTalentIds: (targetGroup.memberTalentIds || []).filter((mid) => mid !== id)
            };
            const remainingTalents = talents.filter((t) => t.id !== id);
            resynced = syncShowsWithGroupRequirements(updatedG, resynced, remainingTalents);
          }
        }
        return resynced;
      });
    } else if (updates.status === 'Rest' || updates.status === 'Sick/Injured') {
      const now = Date.now();
      const updatedTalents = talents.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );

      setSchedule((prev) => {
        const cleanedSchedule = prev.map((ev) => {
          if (
            ev.status === 'Completed' ||
            ev.status === 'Cancelled' ||
            new Date(ev.startDateTime).getTime() < now
          ) {
            return ev;
          }

          let hasChanges = false;
          const updatedDuties = (ev.dutyAssignments || []).map((duty) => {
            if (!duty.assignedTalentIds.includes(id)) return duty;
            hasChanges = true;
            return {
              ...duty,
              assignedTalentIds: duty.assignedTalentIds.filter((tid) => tid !== id),
              updatedAt: new Date().toISOString()
            };
          });

          return hasChanges ? { ...ev, dutyAssignments: updatedDuties } : ev;
        });

        const memberGroups = groups.filter((g) =>
          (g.memberTalentIds || []).includes(id)
        );

        let resynced = cleanedSchedule;
        for (const g of memberGroups) {
          resynced = syncShowsWithGroupRequirements(g, resynced, updatedTalents);
        }
        return resynced;
      });

      if (selectedTalent?.id === id) {
        setSelectedTalent((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } else if (selectedTalent?.id === id) {
      setSelectedTalent((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteTalent = (id: string) => {
    setTalents((prev) => prev.filter((t) => t.id !== id));

    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        memberTalentIds: g.memberTalentIds.filter((mid) => mid !== id),
        inventoryRequirements: (g.inventoryRequirements || []).map((req) =>
          req.assignedTalentId === id ? { ...req, assignedTalentId: undefined } : req
        )
      }))
    );

    setSchedule((prev) =>
      prev.map((ev) => ({
        ...ev,
        dutyAssignments: ev.dutyAssignments.map((duty) => {
          const hasTalent = duty.assignedTalentIds.includes(id);
          const hasOverride =
            duty.manualOverrides &&
            (duty.manualOverrides[id] || Object.values(duty.manualOverrides).includes(id));

          if (!hasTalent && !hasOverride) return duty;

          const newOverrides = { ...(duty.manualOverrides || {}) };
          delete newOverrides[id];
          for (const [origKey, replVal] of Object.entries(newOverrides)) {
            if (replVal === id) delete newOverrides[origKey];
          }

          return {
            ...duty,
            assignedTalentIds: duty.assignedTalentIds.filter((tid) => tid !== id),
            manualOverrides: Object.keys(newOverrides).length > 0 ? newOverrides : undefined
          };
        })
      }))
    );

    if (selectedTalent?.id === id) {
      setSelectedTalent(null);
    }
  };

  // GROUP ACTIONS
  const addGroup = (groupData: Omit<Group, 'id' | 'createdAt'>): Group => {
    const newGroup: Group = {
      ...groupData,
      id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    setGroups((prev) => [newGroup, ...prev]);
    return newGroup;
  };

  const updateGroup = (id: string, updates: Partial<Group>) => {
    let nextGroup: Group | undefined;

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          nextGroup = { ...g, ...updates };
          return nextGroup;
        }
        return g;
      })
    );

    // When inventoryRequirements, memberTalentIds, or allowMultiDuty rules are updated, automatically attach/sync to all shows of this group!
    if (updates.inventoryRequirements || updates.memberTalentIds || updates.allowMultiDuty !== undefined) {
      setSchedule((prevSchedule) => {
        const targetGroup = nextGroup || groups.find((g) => g.id === id);
        if (!targetGroup) return prevSchedule;
        const fullyUpdated = { ...targetGroup, ...updates };
        return syncShowsWithGroupRequirements(fullyUpdated, prevSchedule, talents);
      });
    }
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setSchedule((prev) => prev.filter((ev) => ev.groupId !== id));
  };

  // VENUE ACTIONS
  const addVenue = (venueData: Omit<HotelVenue, 'id' | 'createdAt'>): HotelVenue => {
    const newVenue: HotelVenue = {
      ...venueData,
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    setVenues((prev) => [newVenue, ...prev]);
    return newVenue;
  };

  const updateVenue = (id: string, updates: Partial<HotelVenue>) => {
    setVenues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const deleteVenue = (id: string) => {
    setVenues((prev) => prev.filter((v) => v.id !== id));
  };

  // CONFLICT VALIDATOR
  const validateConflict = (candidate: {
    id?: string;
    groupId: string;
    hotelId: string;
    startDateTime: string;
    endDateTime: string;
    lobbyTime?: string;
    lobbyDateTime?: string;
  }) => {
    return checkScheduleConflicts(candidate, schedule, groups, venues);
  };

  // SCHEDULE ACTIONS
  const addShowEvent = (
    eventData: Omit<ShowEvent, 'id' | 'createdAt' | 'dutyAssignments'>,
    autoAssignDuties: boolean = true
  ): { event?: ShowEvent; conflictResult?: ConflictCheckResult } => {
    if (new Date(eventData.endDateTime).getTime() <= new Date(eventData.startDateTime).getTime()) {
      return {
        conflictResult: {
          hasConflict: true,
          blockingConflicts: [
            {
              type: 'GROUP_DOUBLE_BOOKED',
              reason: 'Show end time must be after start time'
            }
          ],
          warningConflicts: []
        }
      };
    }

    const conflictResult = validateConflict(eventData);
    if (conflictResult.hasConflict) {
      return { conflictResult };
    }

    const group = groups.find((g) => g.id === eventData.groupId);
    let duties: any[] = [];
    if (group && autoAssignDuties) {
      duties = generateAutomatedDutiesForEvent(
        group,
        talents,
        schedule,
        eventData.startDateTime
      );
    }

    const newEvent: ShowEvent = {
      ...eventData,
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      dutyAssignments: duties,
      createdAt: new Date().toISOString()
    };

    setSchedule((prev) => [...prev, newEvent]);
    return { event: newEvent, conflictResult };
  };

  const updateShowEvent = (
    id: string,
    updates: Partial<ShowEvent>,
    recomputeDuties: boolean = false
  ): { success: boolean; conflictResult?: ConflictCheckResult } => {
    const existing = schedule.find((e) => e.id === id);
    if (!existing) return { success: false };

    const candidate = {
      id,
      groupId: updates.groupId || existing.groupId,
      hotelId: updates.hotelId || existing.hotelId,
      startDateTime: updates.startDateTime || existing.startDateTime,
      endDateTime: updates.endDateTime || existing.endDateTime
    };

    if (new Date(candidate.endDateTime).getTime() <= new Date(candidate.startDateTime).getTime()) {
      return {
        success: false,
        conflictResult: {
          hasConflict: true,
          blockingConflicts: [
            {
              type: 'GROUP_DOUBLE_BOOKED',
              reason: 'Show end time must be after start time'
            }
          ],
          warningConflicts: []
        }
      };
    }

    const conflictResult = validateConflict(candidate);
    if (conflictResult.hasConflict) {
      return { success: false, conflictResult };
    }

    setSchedule((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;

        let dutyAssignments = updates.dutyAssignments || e.dutyAssignments;
        if (recomputeDuties) {
          const group = groups.find((g) => g.id === candidate.groupId);
          if (group) {
            dutyAssignments = generateAutomatedDutiesForEvent(
              group,
              talents,
              prev.filter((ev) => ev.id !== id),
              candidate.startDateTime
            );
          }
        }

        return {
          ...e,
          ...updates,
          dutyAssignments
        };
      })
    );

    return { success: true, conflictResult };
  };

  const deleteShowEvent = (id: string) => {
    setSchedule((prev) => prev.filter((e) => e.id !== id));
  };

  // DUTY ROTATION ACTIONS
  const swapDutyTalent = (
    eventId: string,
    requirementId: string,
    originalTalentId: string,
    replacementTalentId: string
  ) => {
    setSchedule((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;

        const dutyIndex = ev.dutyAssignments.findIndex(
          (duty) => duty.requirementId === requirementId || duty.itemName === requirementId
        );

        if (dutyIndex === -1) {
          // If duty entry is not yet in event dutyAssignments, add it
          const group = groups.find((g) => g.id === ev.groupId);
          const req = group?.inventoryRequirements?.find(
            (r) => r.id === requirementId || r.itemName === requirementId
          );

          const newDuty: DutyAssignment = {
            requirementId: req?.id || requirementId,
            itemName: req?.itemName || requirementId,
            assignedGender: req?.assignedGender || 'Any',
            requiredHeadcount: req?.requiredHeadcount || 1,
            assignedTalentIds: [replacementTalentId],
            manualOverrides: originalTalentId
              ? { [originalTalentId]: replacementTalentId }
              : {},
            updatedAt: new Date().toISOString()
          };

          return {
            ...ev,
            dutyAssignments: [...ev.dutyAssignments, newDuty]
          };
        }

        const updatedDuties = ev.dutyAssignments.map((duty, idx) => {
          if (idx !== dutyIndex) return duty;
          return applyManualDutyOverride(duty, originalTalentId, replacementTalentId);
        });

        return {
          ...ev,
          dutyAssignments: updatedDuties
        };
      })
    );
  };

  const regenerateDutiesForEvent = (eventId: string) => {
    const ev = schedule.find((e) => e.id === eventId);
    if (!ev) return;
    const group = groups.find((g) => g.id === ev.groupId);
    if (!group) return;

    const newDuties = generateAutomatedDutiesForEvent(
      group,
      talents,
      schedule.filter((e) => e.id !== eventId),
      ev.startDateTime
    );

    setSchedule((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, dutyAssignments: newDuties } : e))
    );
  };

  // FAIRNESS METRIC HELPER
  const getGroupFairnessScore = (groupId: string): number => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || !group.memberTalentIds || group.memberTalentIds.length === 0) {
      return 100;
    }

    const cycleWeeks = group.rotationCycleWeeks || 1;
    const cycleKey = getCycleKey(new Date(), cycleWeeks);
    const dutyCounts = computeHistoricalDutyCounts(schedule, group.id, cycleKey, cycleWeeks);
    const score = computeFairnessScore(dutyCounts, group.memberTalentIds);

    return isNaN(score) ? 100 : score;
  };

  const resetAllData = () => {
    resetToDemoData();
    setTalents(getStoredTalents());
    setGroups(getStoredGroups());
    setVenues(getStoredVenues());
    setSchedule(getStoredSchedule());
    setCurrentUser(getStoredUserProfile());
    setSelectedTalent(null);
  };

  const terminateTalentWithCascade = (
    talentId: string,
    resolutions: {
      caseAResolutions: Record<string, 'relax_rule' | 'pause_task'>;
      caseBResolutions: Record<string, 'reduce_headcount' | 'keep_vacant'>;
    },
    reviewData?: Partial<ContractRecord>
  ) => {
    const talent = talents.find((t) => t.id === talentId);
    if (!talent) return;

    // 1. Run cascade resolution engine on groups and schedule
    const { updatedGroups, updatedSchedule } = applyCascadeResolutions({
      talent,
      caseAResolutions: resolutions.caseAResolutions,
      caseBResolutions: resolutions.caseBResolutions,
      groups,
      talents,
      schedule
    });

    setGroups(updatedGroups);
    setSchedule(updatedSchedule);

    // 2. Mark talent as Terminated & Archived
    const todayStr = new Date().toISOString().split('T')[0];
    const newReview: ContractRecord = {
      id: `ctr-${Date.now()}`,
      talentId: talent.id,
      talentName: `${talent.firstName} ${talent.lastName}`,
      talentRole: talent.primarySkill,
      avatarUrl: talent.avatarUrl,
      projectName: reviewData?.projectName || 'Early Termination',
      location: (talent as any).location || 'Tbilisi',
      period: reviewData?.period || 'Current Season 2026',
      startDate: (talent as any).contractStart || '2026-05-01',
      endDate: talent.contractExpiryDate || todayStr,
      contractStatus: 'terminated',
      rating: reviewData?.rating || 5,
      rehireStatus: reviewData?.rehireStatus || 'do_not_rehire',
      terminationReason: reviewData?.terminationReason || 'Administrative',
      initiator: 'admin',
      internalNote: reviewData?.internalNote || '',
      reviewedBy: currentUser?.fullName || 'Administrator',
      reviewDate: todayStr,
      overallRating: reviewData?.overallRating || 5,
      privateNote: reviewData?.privateNote || '',
      reviewerName: currentUser?.fullName || 'Administrator',
      createdAt: new Date().toISOString(),
      completionStatus: 'Terminated Early',
      reviewType: 'Early Termination',
      ...reviewData
    };

    const updatedReviews = [newReview, ...(talent.reviews || [])];

    setTalents((prev) =>
      prev.map((t) =>
        t.id === talentId
          ? {
              ...t,
              reviews: updatedReviews,
              rehireStatus: newReview.rehireStatus,
              contractExpiryDate: undefined,
              status: 'Terminated',
              isArchived: true,
              contractStatus: 'terminated',
              terminationReason: newReview.terminationReason,
              terminationDate: todayStr
            }
          : t
      )
    );

    if (selectedTalent?.id === talentId) {
      setSelectedTalent(null);
    }
  };

  const changeTalentStatusWithDutyResolution = (
    talentId: string,
    newStatus: TalentStatus,
    resolution: {
      mode: 'auto' | 'manual';
      replacements?: Record<string, string>;
    }
  ) => {
    const talent = talents.find((t) => t.id === talentId);
    if (!talent) return;

    // 1. Update talent status
    const updatedTalents = talents.map((t) =>
      t.id === talentId ? { ...t, status: newStatus } : t
    );
    setTalents(updatedTalents);

    if (selectedTalent?.id === talentId) {
      setSelectedTalent({ ...selectedTalent, status: newStatus });
    }

    const now = Date.now();

    // 2. Handle affected future shows
    if (resolution.mode === 'manual' && resolution.replacements) {
      setSchedule((prev) =>
        prev.map((ev) => {
          if (
            ev.status === 'Completed' ||
            ev.status === 'Cancelled' ||
            new Date(ev.startDateTime).getTime() < now
          ) {
            return ev;
          }

          let hasChanges = false;
          const updatedDuties = (ev.dutyAssignments || []).map((duty) => {
            if (!duty.assignedTalentIds.includes(talentId)) return duty;

            const repKey = `${ev.id}_${duty.requirementId || duty.itemName}`;
            const repKeySimple = `${ev.id}_${duty.itemName}`;
            const replacementId =
              resolution.replacements?.[repKey] ||
              resolution.replacements?.[repKeySimple] ||
              resolution.replacements?.[ev.id];

            if (replacementId) {
              hasChanges = true;
              return {
                ...duty,
                assignedTalentIds: duty.assignedTalentIds.map((tid) =>
                  tid === talentId ? replacementId : tid
                ),
                manualOverrides: {
                  ...(duty.manualOverrides || {}),
                  [talentId]: replacementId
                },
                updatedAt: new Date().toISOString()
              };
            }
            return duty;
          });

          return hasChanges ? { ...ev, dutyAssignments: updatedDuties } : ev;
        })
      );
    } else {
      // mode === 'auto':
      // Remove talent from upcoming future show duties
      const cleanedSchedule = schedule.map((ev) => {
        if (
          ev.status === 'Completed' ||
          ev.status === 'Cancelled' ||
          new Date(ev.startDateTime).getTime() < now
        ) {
          return ev;
        }

        let hasChanges = false;
        const updatedDuties = (ev.dutyAssignments || []).map((duty) => {
          if (!duty.assignedTalentIds.includes(talentId)) return duty;
          hasChanges = true;
          return {
            ...duty,
            assignedTalentIds: duty.assignedTalentIds.filter((tid) => tid !== talentId),
            updatedAt: new Date().toISOString()
          };
        });

        return hasChanges ? { ...ev, dutyAssignments: updatedDuties } : ev;
      });

      // Find groups this talent belongs to
      const memberGroups = groups.filter((g) =>
        (g.memberTalentIds || []).includes(talentId)
      );

      // Resync these groups shows with updated talents (talent is now non-Active)
      let resyncedSchedule = cleanedSchedule;
      for (const g of memberGroups) {
        resyncedSchedule = syncShowsWithGroupRequirements(
          g,
          resyncedSchedule,
          updatedTalents
        );
      }

      setSchedule(resyncedSchedule);
    }
  };

  return (
    <AppContext.Provider
      value={{
        talents,
        groups,
        venues,
        schedule,
        selectedTalent,
        setSelectedTalent,
        currentUser,
        updateCurrentUser,
        timeFormat,
        setTimeFormat,
        formatTime,
        formatTimeRange,
        addTalent,
        updateTalent,
        deleteTalent,
        addGroup,
        updateGroup,
        deleteGroup,
        addVenue,
        updateVenue,
        deleteVenue,
        addShowEvent,
        updateShowEvent,
        deleteShowEvent,
        swapDutyTalent,
        regenerateDutiesForEvent,
        getGroupFairnessScore,
        validateConflict,
        terminateTalentWithCascade,
        changeTalentStatusWithDutyResolution,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};