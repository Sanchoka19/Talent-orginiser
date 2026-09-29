'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Group } from '../../types/group';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Search, Check, X, UserPlus, Users, AlertTriangle } from 'lucide-react';
import { getTalentAvatar } from '../../utils/avatarUtils';
import { MemberGroupConflictModal, ConflictedMemberInfo } from './MemberGroupConflictModal';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroup: Group;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  currentGroup,
}) => {
  const { talents, groups, updateGroup } = useApp();
  const { language } = useLanguage();
  const toast = useToast();
  const isKa = language === 'ka';

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState<'all' | 'male' | 'female' | 'active'>('all');

  // Conflict confirmation modal state
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictedMembers, setConflictedMembers] = useState<ConflictedMemberInfo[]>([]);

  const availableTalents = useMemo(
    () => talents.filter((t) => !currentGroup.memberTalentIds.includes(t.id)),
    [talents, currentGroup.memberTalentIds]
  );

  const filteredTalents = useMemo(() => {
    return availableTalents.filter((t) => {
      if (quickFilter === 'male' && t.gender !== 'Male') return false;
      if (quickFilter === 'female' && t.gender !== 'Female') return false;
      if (quickFilter === 'active' && t.status !== 'Active') return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
        t.primarySkill.toLowerCase().includes(q)
      );
    });
  }, [availableTalents, quickFilter, search]);

  const selectedTalents = useMemo(
    () => talents.filter((t) => selected.includes(t.id)),
    [talents, selected]
  );

  // Helper to find other groups a talent belongs to
  const getTalentOtherGroups = useCallback(
    (talentId: string): Group[] => {
      return groups.filter(
        (g) => g.id !== currentGroup.id && (g.memberTalentIds || []).includes(talentId)
      );
    },
    [groups, currentGroup.id]
  );

  // Number of currently selected talents who belong to other groups
  const selectedConflictedCount = useMemo(() => {
    return selected.filter((id) => getTalentOtherGroups(id).length > 0).length;
  }, [selected, getTalentOtherGroups]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelected([]);
      setQuickFilter('all');
      setIsConflictModalOpen(false);
      setConflictedMembers([]);
    }
  }, [isOpen]);

  const toggleTalent = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const executeAddMembers = () => {
    updateGroup(currentGroup.id, {
      memberTalentIds: [...currentGroup.memberTalentIds, ...selected],
    });
    toast.success(
      isKa
        ? `${selected.length} შემსრულებელი დასში დაემატა`
        : `${selected.length} performer${selected.length > 1 ? 's' : ''} added to cast`
    );
    setIsConflictModalOpen(false);
    onClose();
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      toast.error(
        isKa
          ? 'გთხოვთ აირჩიოთ მინიმუმ ერთი შემსრულებელი'
          : 'Please select at least one performer'
      );
      return;
    }

    // Check if any selected performer is already a member of another group
    const conflicts: ConflictedMemberInfo[] = [];
    for (const talentId of selected) {
      const otherGroups = getTalentOtherGroups(talentId);
      if (otherGroups.length > 0) {
        const talent = talents.find((t) => t.id === talentId);
        if (talent) {
          conflicts.push({ talent, existingGroups: otherGroups });
        }
      }
    }

    if (conflicts.length > 0) {
      setConflictedMembers(conflicts);
      setIsConflictModalOpen(true);
      return;
    }

    executeAddMembers();
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <span className="text-xs text-text-secondary">
        {selected.length > 0
          ? isKa
            ? `${selected.length} არჩეულია`
            : `${selected.length} selected`
          : isKa
          ? 'არჩეული არ არის'
          : 'None selected'}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-pill text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
        >
          {isKa ? 'გაუქმება' : 'Cancel'}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-pill text-xs sm:text-sm font-bold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <UserPlus size={14} />
          {isKa ? 'დასში დამატება' : 'Add to Cast'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isKa ? 'წევრის დამატება' : 'Add Member'}
        subtitle={
          isKa
            ? `${currentGroup.name} — ბაზიდან შემსრულებლის მიბმა`
            : `${currentGroup.name} — add performers from roster`
        }
        maxWidth="560px"
        footer={footer}
      >
        {availableTalents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <Users size={40} className="text-text-muted opacity-40" />
            <p className="text-sm font-semibold text-text-primary">
              {isKa ? 'ყველა შემსრულებელი ჯგუფშია' : 'All performers are already in this group'}
            </p>
            <p className="text-xs text-text-secondary">
              {isKa
                ? 'ახალი შემსრულებლის დასამატებლად ჯერ შექმენით ტალანტი'
                : 'Create a new talent first to add them here'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isKa ? 'მოძებნეთ სახელით ან სპეციალობით...' : 'Search by name or discipline...'
                }
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-300 dark:border-border-medium bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
              />
            </div>

            {/* Quick filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-text-tertiary mr-0.5">
                {isKa ? 'ფილტრი:' : 'Filter:'}
              </span>
              {(
                [
                  { id: 'all' as const, label: isKa ? 'ყველა' : 'All' },
                  { id: 'male' as const, label: isKa ? 'კაცები' : 'Males' },
                  { id: 'female' as const, label: isKa ? 'ქალები' : 'Females' },
                  { id: 'active' as const, label: isKa ? 'აქტიური' : 'Active' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setQuickFilter(f.id)}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    quickFilter === f.id
                      ? 'bg-brand-primary text-white'
                      : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              {filteredTalents.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const ids = filteredTalents.map((t) => t.id);
                    setSelected((prev) => Array.from(new Set([...prev, ...ids])));
                  }}
                  className="ml-auto text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                >
                  {isKa ? 'ყველას მონიშვნა' : 'Select all'}
                </button>
              )}
            </div>

            {/* Warning banner if selected talents belong to other groups */}
            {selectedConflictedCount > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="leading-snug">
                  {isKa
                    ? `არჩეულიდან ${selectedConflictedCount} შემსრულებელი უკვე ირიცხება სხვა ჯგუფში. დამატებისას სისტემა მოგთხოვთ დადასტურებას.`
                    : `${selectedConflictedCount} selected performer(s) already belong to another group. Confirmation will be required.`}
                </span>
              </div>
            )}

            {/* Talent list */}
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-0.5">
              {filteredTalents.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-secondary">
                  {isKa ? 'შემსრულებელი ვერ მოიძებნა' : 'No performers found'}
                </div>
              ) : (
                filteredTalents.map((talent) => {
                  const isSelected = selected.includes(talent.id);
                  const isActive = talent.status === 'Active';
                  const otherGroups = getTalentOtherGroups(talent.id);
                  const hasOtherGroup = otherGroups.length > 0;

                  return (
                    <div
                      key={talent.id}
                      onClick={() => toggleTalent(talent.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-primary/10 border border-brand-primary/25'
                          : 'hover:bg-surface-secondary border border-transparent hover:border-border-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={getTalentAvatar(talent)}
                          alt={talent.firstName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-border-subtle"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-text-primary truncate">
                            {talent.firstName} {talent.lastName}
                          </div>
                          <div className="text-xs text-text-secondary truncate">
                            {talent.primarySkill}
                          </div>

                          {/* Badge showing existing group(s) */}
                          {hasOtherGroup && (
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                {isKa ? 'სხვა ჯგუფი:' : 'Other group:'}
                              </span>
                              {otherGroups.map((grp) => (
                                <span
                                  key={grp.id}
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs"
                                  style={{
                                    backgroundColor: `${grp.colorAccent || '#6366f1'}15`,
                                    borderColor: `${grp.colorAccent || '#6366f1'}35`,
                                    color: grp.colorAccent || '#6366f1',
                                  }}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: grp.colorAccent || '#6366f1' }}
                                  />
                                  {grp.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {talent.status}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                            isSelected
                              ? 'bg-brand-primary border-brand-primary text-white'
                              : 'border-slate-300 dark:border-border-medium bg-surface'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected chips */}
            {selectedTalents.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border-subtle">
                {selectedTalents.map((talent) => {
                  const otherGroups = getTalentOtherGroups(talent.id);
                  const hasOtherGroup = otherGroups.length > 0;

                  return (
                    <div
                      key={talent.id}
                      className={`inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full border text-xs font-semibold ${
                        hasOtherGroup
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                          : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                      }`}
                    >
                      <img
                        src={getTalentAvatar(talent)}
                        alt={talent.firstName}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>
                        {talent.firstName} {talent.lastName}
                      </span>
                      {hasOtherGroup && (
                        <span className="text-[10px] font-normal opacity-75">
                          ({otherGroups.map((g) => g.name).join(', ')})
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleTalent(talent.id)}
                        className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center hover:text-danger transition-colors cursor-pointer"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirmation modal for cross-group talent addition */}
      <MemberGroupConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        onConfirm={executeAddMembers}
        targetGroupName={currentGroup.name}
        conflictedMembers={conflictedMembers}
      />
    </>
  );
};
