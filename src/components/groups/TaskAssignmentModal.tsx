'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Talent } from '../../types/talent';
import { Group } from '../../types/group';
import {
  DutySlot,
  DutyGenderRequirement,
  TaskRotationCycle,
  COMMON_SPECIAL_TASKS,
  COMMON_STAGE_POSITIONS
} from '../../types/inventory';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Plus,
  Trash2,
  X,
  SlidersHorizontal,
  MapPin,
  Clock,
  User,
  Users,
  Search,
  Check,
  AlertTriangle
} from 'lucide-react';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroup: Group;
  members: Talent[];
  initialPerformerId?: string;
  initialTalentIds?: string[];
  selectedTalentIds?: string[];
  onSaveSpecialTask: (taskName: string, slots: DutySlot[], performerIds?: string[]) => void;
  dict: any;
  isKa: boolean;
}

type FormSlot = Omit<DutySlot, 'headcount'> & { headcount: number | '' };

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  members,
  initialPerformerId = '',
  initialTalentIds,
  selectedTalentIds: propSelectedTalentIds,
  onSaveSpecialTask,
  dict,
  isKa
}) => {
  const toast = useToast();
  const [taskName, setTaskName] = useState('');
  const [slots, setSlots] = useState<FormSlot[]>([
    { id: 'slot-1', position: '', assignedGender: 'Any', headcount: 1, rotationCycle: 'every_show' }
  ]);

  // Performer Assignment (Auto-Rotation vs Custom Pool / Fixed)
  const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual'>('auto');
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);
  const [talentSearch, setTalentSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'male' | 'female' | 'active'>('all');
  const [inactiveNotice, setInactiveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTaskName('');
      setSlots([
        {
          id: `slot_${Date.now()}_1`,
          position: '',
          assignedGender: 'Any',
          headcount: 1,
          rotationCycle: 'every_show'
        }
      ]);

      const initial =
        initialTalentIds && initialTalentIds.length > 0
          ? initialTalentIds
          : propSelectedTalentIds && propSelectedTalentIds.length > 0
            ? propSelectedTalentIds
            : initialPerformerId
              ? [initialPerformerId]
              : [];

      setSelectedTalentIds(initial);
      setAssignmentMode(initial.length > 0 ? 'manual' : 'auto');
      setTalentSearch('');
      setQuickFilter('all');
      setInactiveNotice(null);
    }
  }, [isOpen, initialPerformerId, initialTalentIds, propSelectedTalentIds]);

  // Filtered members by search and quick filter (only members of this group)
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (quickFilter === 'male' && m.gender !== 'Male') return false;
      if (quickFilter === 'female' && m.gender !== 'Female') return false;
      if (quickFilter === 'active' && m.status !== 'Active') return false;

      if (!talentSearch.trim()) return true;
      const q = talentSearch.toLowerCase();
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      const skill = (m.primarySkill || '').toLowerCase();
      return fullName.includes(q) || skill.includes(q);
    });
  }, [members, quickFilter, talentSearch]);

  const selectedTalents = useMemo(
    () => members.filter((m) => selectedTalentIds.includes(m.id)),
    [members, selectedTalentIds]
  );

  if (!isOpen) return null;

  // Toggle talent selection
  const handleToggleTalent = (talentId: string) => {
    const tal = members.find((tItem) => tItem.id === talentId);
    if (selectedTalentIds.includes(talentId)) {
      setSelectedTalentIds((prev) => prev.filter((id) => id !== talentId));
      setInactiveNotice(null);
    } else {
      if (tal && tal.status !== 'Active') {
        const statusLabel =
          tal.status === 'Sick/Injured'
            ? isKa
              ? 'ავად/ტრავმირებული'
              : 'Sick/Injured'
            : isKa
              ? 'დასვენებაზე'
              : 'On Rest';
        setInactiveNotice(
          isKa
            ? `ყურადღება: „${tal.firstName} ${tal.lastName}“ იმყოფება სტატუსში [${statusLabel}], თუმცა როტაციის პულში დამატება დაშვებულია.`
            : `Notice: "${tal.firstName} ${tal.lastName}" is currently [${statusLabel}], but can still be added to the pool.`
        );
      } else {
        setInactiveNotice(null);
      }
      setSelectedTalentIds((prev) => [...prev, talentId]);
    }
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredMembers.map((m) => m.id);
    const newSelected = Array.from(new Set([...selectedTalentIds, ...filteredIds]));
    setSelectedTalentIds(newSelected);
  };

  const handleDeselectAll = () => {
    setSelectedTalentIds([]);
    setInactiveNotice(null);
  };

  // Slot management
  const handleAddSlot = () => {
    setSlots((prev) => [
      ...prev,
      {
        id: `slot_${Date.now()}_${prev.length + 1}`,
        position: '',
        assignedGender: 'Any',
        rotationCycle: 'every_show',
        headcount: 1
      }
    ]);
  };

  const handleRemoveSlot = (slotId: string) => {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleUpdateSlot = (slotId: string, updated: Partial<FormSlot>) => {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, ...updated } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (assignmentMode === 'manual' && selectedTalentIds.length === 0) {
      toast.error(
        isKa
          ? 'გთხოვთ მონიშნოთ მინიმუმ ერთი შემსრულებელი'
          : 'Please select at least one performer for the pool'
      );
      return;
    }

    const performerIds =
      assignmentMode === 'manual' && selectedTalentIds.length > 0
        ? selectedTalentIds
        : undefined;

    const sanitizedSlots: DutySlot[] = slots.map((s) => ({
      ...s,
      headcount: Math.max(1, Number(s.headcount) || 1)
    }));

    onSaveSpecialTask(taskName, sanitizedSlots, performerIds);
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex justify-center items-start overflow-y-auto p-3 sm:p-4 pt-6 sm:pt-[6vh] md:pt-[7vh] pb-8 bg-surface-overlay backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[88vh] bg-surface border border-border-subtle rounded-2xl shadow-modal overflow-hidden flex flex-col transition-[max-height,transform] duration-300 ease-out animate-in zoom-in-95 duration-200 my-auto sm:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-start justify-between gap-3 bg-surface shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-text-primary leading-tight truncate">
                {dict.newTaskTitle}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5 truncate">
                {dict.newTaskSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 scroll-smooth transition-all duration-300 ease-in-out">
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
            {/* Task Name */}
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                {dict.taskNameLabel} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder={dict.taskNamePlaceholder}
                className="w-full h-10 px-3.5 rounded-lg border border-slate-300 dark:border-border-medium bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all"
              />

              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[0.7rem] text-text-secondary font-medium">
                  {dict.suggestions}
                </span>
                {COMMON_SPECIAL_TASKS.slice(0, 5).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTaskName(preset)}
                    className="text-[0.7rem] px-2 py-0.5 rounded-md bg-surface-secondary hover:bg-surface-tertiary border border-border-subtle text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Slot Builder */}
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-200/80 dark:border-border-subtle transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-text-primary">
                    {dict.stagePositionsAndSlots}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
                    {slots.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 hover:bg-purple-100 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>{dict.addSlot}</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5 transition-all duration-300">
                {slots.map((slot, sIdx) => {
                  const datalistId = `stage-pos-list-${sIdx}`;
                  return (
                    <div
                      key={slot.id || sIdx}
                      className="p-3 rounded-lg border border-slate-200/70 dark:border-border-subtle bg-slate-50/50 dark:bg-surface-secondary/40 space-y-2.5 shadow-2xs hover:border-slate-300 dark:hover:border-border-medium transition-all duration-200 slide-down-fade"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <MapPin
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                          />
                          <input
                            type="text"
                            list={datalistId}
                            placeholder={dict.slotPositionPlaceholder}
                            value={slot.position}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, { position: e.target.value })
                            }
                            className="w-full text-xs font-medium pl-8 pr-3 py-2 rounded-lg border border-border-medium bg-surface text-text-primary outline-none focus:border-purple-600 transition-all placeholder:text-text-muted"
                            required
                          />
                          <datalist id={datalistId}>
                            {COMMON_STAGE_POSITIONS.map((pos) => (
                              <option key={pos} value={pos} />
                            ))}
                          </datalist>
                        </div>

                        {slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="p-2 text-text-secondary hover:text-danger rounded-lg hover:bg-danger/10 transition-colors cursor-pointer shrink-0"
                            title={dict.delete}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <select
                            value={slot.assignedGender}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, {
                                assignedGender: e.target.value as DutyGenderRequirement
                              })
                            }
                            className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-border-medium bg-surface text-text-primary outline-none focus:border-purple-600 cursor-pointer"
                          >
                            <option value="Any">{dict.genderAny}</option>
                            <option value="Female Only">{dict.genderFemaleOnly}</option>
                            <option value="Male Only">{dict.genderMaleOnly}</option>
                          </select>
                        </div>

                        <div>
                          <select
                            value={slot.rotationCycle || 'every_show'}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, {
                                rotationCycle: e.target.value as TaskRotationCycle
                              })
                            }
                            className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-border-medium bg-surface text-text-primary outline-none focus:border-purple-600 cursor-pointer"
                          >
                            <option value="every_show">{dict.slotCycleEveryShow}</option>
                            <option value="weekly">{dict.slotCycleWeekly}</option>
                            <option value="monthly">{dict.slotCycleMonthly}</option>
                            <option value="fixed">{dict.slotCycleFixed}</option>
                          </select>
                        </div>

                        <div>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={slot.headcount}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, {
                                headcount: e.target.value === '' ? '' : Math.max(1, Math.min(10, Number(e.target.value)))
                              })
                            }
                            onBlur={() => {
                              if (slot.headcount === '' || Number(slot.headcount) < 1) {
                                handleUpdateSlot(slot.id, { headcount: 1 });
                              }
                            }}
                            className="w-full text-xs font-bold px-2 py-2 rounded-lg border border-border-medium bg-surface text-text-primary text-center outline-none focus:border-purple-600"
                            title={dict.headcount}
                            placeholder={dict.headcount}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Card: Performer Selection Mode (Auto vs Custom Pool/Fixed) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-border-subtle bg-slate-50/70 dark:bg-surface-secondary/40 flex flex-col gap-3 transition-all duration-300 ease-in-out">
            <span className="text-xs font-bold text-text-primary block">
              {isKa ? 'შემსრულებლის მიბმა / როტაციის წესი' : 'Performer Assignment & Rotation Rule'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${assignmentMode === 'auto'
                    ? 'border-brand-primary bg-surface shadow-xs'
                    : 'border-border-subtle hover:bg-surface-secondary'
                  }`}
              >
                <input
                  type="radio"
                  name="assign-mode-task"
                  checked={assignmentMode === 'auto'}
                  onChange={() => setAssignmentMode('auto')}
                  className="mt-0.5 text-brand-primary focus:ring-brand-primary"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-text-primary">
                    {dict.autoRotationOption || (isKa ? 'ავტომატური როტაცია (Round-Robin)' : 'Automatic Rotation (Round-Robin)')}
                  </div>
                  <div className="text-[0.675rem] text-text-secondary mt-0.5 leading-relaxed">
                    {dict.autoRotationDesc || (isKa ? 'სისტემა თავად ანაწილებს ჯგუფის ყველა წევრზე სლოტებზე მათი დასწრებისა და წესის მიხედვით.' : 'System automatically distributes among all group members.')}
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${assignmentMode === 'manual'
                    ? 'border-brand-primary bg-surface shadow-xs'
                    : 'border-border-subtle hover:bg-surface-secondary'
                  }`}
              >
                <input
                  type="radio"
                  name="assign-mode-task"
                  checked={assignmentMode === 'manual'}
                  onChange={() => setAssignmentMode('manual')}
                  className="mt-0.5 text-brand-primary focus:ring-brand-primary"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-text-primary">
                    {isKa
                      ? 'არჩეული შემსრულებლების როტაციის პული (Custom Pool / Fixed)'
                      : 'Custom Performer Pool / Fixed'}
                  </div>
                  <div className="text-[0.675rem] text-text-secondary mt-0.5 leading-relaxed">
                    {isKa
                      ? 'როტაცია განხორციელდება მხოლოდ თქვენ მიერ არჩეულ წევრებს შორის (ან მიებმება ერთ კონკრეტულ შემსრულებელს).'
                      : 'Task will rotate only among your selected members (or be fixed to one performer).'}
                  </div>
                </div>
              </label>
            </div>

            {/* Expandable Performer Pool Container with Smooth Grid Transition */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${assignmentMode === 'manual'
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
            >
              <div className="overflow-hidden min-h-0">
                <div className="pt-3 flex flex-col gap-2.5 border-t border-border-subtle mt-1">
                  {/* Search & Clear Bar */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                      />
                      <input
                        type="text"
                        value={talentSearch}
                        onChange={(e) => setTalentSearch(e.target.value)}
                        placeholder={
                          isKa
                            ? 'მოძებნეთ სახელით ან სპეციალობით...'
                            : 'Search by name or discipline...'
                        }
                        className="w-full h-9 pl-9 pr-4 rounded-lg border border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                      />
                    </div>
                    {selectedTalentIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {isKa ? 'გასუფთავება' : 'Clear'}
                      </button>
                    )}
                  </div>

                  {/* Quick Filters (Pill buttons) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-text-tertiary mr-0.5">
                      {isKa ? 'ფილტრი:' : 'Filter:'}
                    </span>
                    {[
                      { id: 'all' as const, label: isKa ? 'ყველა' : 'All' },
                      { id: 'male' as const, label: isKa ? 'კაცები' : 'Males' },
                      { id: 'female' as const, label: isKa ? 'ქალები' : 'Females' },
                      { id: 'active' as const, label: isKa ? 'აქტიური' : 'Active' }
                    ].map((flt) => (
                      <button
                        key={flt.id}
                        type="button"
                        onClick={() => setQuickFilter(flt.id)}
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${quickFilter === flt.id
                            ? 'bg-brand-primary text-white'
                            : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
                          }`}
                      >
                        {flt.label}
                      </button>
                    ))}
                    {filteredMembers.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        className="ml-auto text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                      >
                        {isKa ? 'ყველას მონიშვნა' : 'Select all'}
                      </button>
                    )}
                  </div>

                  {/* Warning notice if inactive talent is selected */}
                  {inactiveNotice && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                      <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed text-[11px]">{inactiveNotice}</span>
                    </div>
                  )}

                  {/* Performers List (max-h-48) */}
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-0.5">
                    {filteredMembers.length === 0 ? (
                      <div className="py-6 text-center text-xs text-text-secondary">
                        {isKa ? 'შემსრულებელი ვერ მოიძებნა' : 'No performers found'}
                      </div>
                    ) : (
                      filteredMembers.map((talent) => {
                        const isSelected = selectedTalentIds.includes(talent.id);
                        const isActive = talent.status === 'Active';
                        return (
                          <div
                            key={talent.id}
                            onClick={() => handleToggleTalent(talent.id)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isSelected
                                ? 'bg-brand-primary/10 border border-brand-primary/20'
                                : 'hover:bg-surface-secondary border border-transparent hover:border-border-subtle'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={
                                  talent.avatarUrl ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.firstName}${talent.lastName}`
                                }
                                alt={talent.firstName}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-border-subtle"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-text-primary truncate">
                                  {talent.firstName} {talent.lastName}
                                </div>
                                <div className="text-[11px] text-text-secondary truncate">
                                  {talent.primarySkill ||
                                    (talent.gender === 'Male'
                                      ? isKa
                                        ? 'კაცი'
                                        : 'Male'
                                      : isKa
                                        ? 'ქალი'
                                        : 'Female')}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-red-500/10 text-red-600'
                                  }`}
                              >
                                {talent.status}
                              </span>
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${isSelected
                                    ? 'bg-brand-primary border-brand-primary text-white'
                                    : 'border-border-subtle bg-surface'
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

                  {/* Selected Chips */}
                  {selectedTalents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border-subtle animate-in fade-in duration-200">
                      <span className="text-[11px] font-bold text-text-tertiary mr-0.5">
                        {isKa ? 'არჩეული:' : 'Selected:'} ({selectedTalents.length})
                      </span>
                      {selectedTalents.map((talent) => (
                        <div
                          key={talent.id}
                          className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-primary"
                        >
                          <img
                            src={
                              talent.avatarUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.firstName}${talent.lastName}`
                            }
                            alt={talent.firstName}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>
                            {talent.firstName} {talent.lastName}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTalent(talent.id);
                            }}
                            className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center hover:text-danger transition-colors cursor-pointer ml-0.5"
                          >
                            <X size={9} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="text-[11px] font-semibold text-danger hover:underline cursor-pointer ml-auto"
                      >
                        {isKa ? 'გასუფთავება' : 'Clear'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Sticky Edge-to-Edge Modal Footer */}
          <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-t border-border-subtle bg-surface-secondary/40 dark:bg-surface-secondary/20 backdrop-blur-xs flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-pill text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer"
            >
              {dict.cancel}
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-pill text-xs font-bold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              {dict.saveTask}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
