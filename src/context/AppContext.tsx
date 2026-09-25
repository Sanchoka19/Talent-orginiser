'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Talent } from '../types/talent';
import { Group } from '../types/group';
import { HotelVenue } from '../types/venue';
import { ShowEvent, ConflictCheckResult } from '../types/schedule';
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
  resetToDemoData
} from '../services/storage';
import { checkScheduleConflicts } from '../services/conflictDetector';
import {
  generateAutomatedDutiesForEvent,
  applyManualDutyOverride
} from '../services/rotationEngine';

interface AppContextType {
  talents: Talent[];
  groups: Group[];
  venues: HotelVenue[];
  schedule: ShowEvent[];
  selectedTalent: Talent | null;
  setSelectedTalent: (talent: Talent | null) => void;
  currentUser: UserProfile;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
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
  // Reset
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [talents, setTalents] = useState<Talent[]>(getStoredTalents);
  const [groups, setGroups] = useState<Group[]>(getStoredGroups);
  const [venues, setVenues] = useState<HotelVenue[]>(getStoredVenues);
  const [schedule, setSchedule] = useState<ShowEvent[]>(getStoredSchedule);
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUserProfile);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

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
    setTalents((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    if (selectedTalent?.id === id) {
      setSelectedTalent((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteTalent = (id: string) => {
    setTalents((prev) => prev.filter((t) => t.id !== id));

    // 1. Cascade cleanup in Groups: remove member ID and clear fixed assignment from tasks/inventory
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        memberTalentIds: g.memberTalentIds.filter((mid) => mid !== id),
        inventoryRequirements: (g.inventoryRequirements || []).map((req) =>
          req.assignedTalentId === id ? { ...req, assignedTalentId: undefined } : req
        )
      }))
    );

    // 2. Cascade cleanup in Schedule: remove deleted talent from all duty assignments and overrides
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

  // GROUP ACTIONS (with cascade cleanup for orphan shows)
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
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    // Cascade cleanup: remove orphan shows scheduled for the deleted group
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

        const updatedDuties = ev.dutyAssignments.map((duty) => {
          if (duty.requirementId !== requirementId) return duty;
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

  const resetAllData = () => {
    resetToDemoData();
    setTalents(getStoredTalents());
    setGroups(getStoredGroups());
    setVenues(getStoredVenues());
    setSchedule(getStoredSchedule());
    setCurrentUser(getStoredUserProfile());
    setSelectedTalent(null);
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
        validateConflict,
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
