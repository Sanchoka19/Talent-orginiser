'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Group } from '../../types/group';
import { Talent } from '../../types/talent';
import { InventoryRequirement, DutyGenderRequirement } from '../../types/inventory';
import { Drawer } from '../common/Drawer';
import { InventoryRequirementRow } from './InventoryRequirementRow';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Check, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup?: Group | null;
}

export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  onClose,
  editingGroup
}) => {
  const { talents, addGroup, updateGroup } = useApp();
  const { t, language } = useLanguage();
  const toast = useToast();
  const isKa = language === 'ka';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rotationCycleWeeks, setRotationCycleWeeks] = useState(1);
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);
  const [inventoryRequirements, setInventoryRequirements] = useState<InventoryRequirement[]>([]);
  const [talentSearch, setTalentSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'male' | 'female' | 'active'>('all');
  const [inactiveNotice, setInactiveNotice] = useState<string | null>(null);

  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setDescription(editingGroup.description || '');
      setRotationCycleWeeks(editingGroup.rotationCycleWeeks || 1);
      setSelectedTalentIds(editingGroup.memberTalentIds || []);
      setInventoryRequirements(editingGroup.inventoryRequirements || []);
    } else {
      setName('');
      setDescription('');
      setRotationCycleWeeks(1);
      setSelectedTalentIds([]);
      setInventoryRequirements([]);
    }
  }, [editingGroup, isOpen]);

  const toggleTalentSelection = (id: string) => {
    setSelectedTalentIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const handleAddRequirement = () => {
    setInventoryRequirements((prev) => [
      ...prev,
      {
        id: `ir-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        itemName: '',
        assignedGender: 'Any' as DutyGenderRequirement,
        requiredHeadcount: 1
      }
    ]);
  };

  const handleUpdateRequirement = (index: number, updated: InventoryRequirement) => {
    setInventoryRequirements((prev) =>
      prev.map((req, i) => (i === index ? updated : req))
    );
  };

  const handleRemoveRequirement = (index: number) => {
    setInventoryRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(isKa ? 'გთხოვთ შეიყვანოთ ჯგუფის დასახელება' : 'Please enter a group name');
      return;
    }

    // Filter out empty inventory requirements
    const validRequirements = inventoryRequirements.filter((r) => r.itemName.trim() !== '');

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name,
        description,
        rotationCycleWeeks: Number(rotationCycleWeeks),
        memberTalentIds: selectedTalentIds,
        inventoryRequirements: validRequirements
      });
      toast.success(
        isKa ? `ჯგუფის „${name}“ ცვლილებები შენახულია` : `Changes to group "${name}" saved`
      );
    } else {
      addGroup({
        name,
        description,
        rotationCycleWeeks: Number(rotationCycleWeeks),
        memberTalentIds: selectedTalentIds,
        inventoryRequirements: validRequirements,
        colorAccent: '#FF6C41'
      });
      toast.success(
        isKa ? `ჯგუფი „${name}“ წარმატებით შეიქმნა` : `Group "${name}" created successfully`
      );
    }

    onClose();
  };

  // Filtered talent options with quick filters and search
  const filteredTalents = useMemo(() => {
    return talents.filter((tItem) => {
      if (quickFilter === 'male' && tItem.gender !== 'Male') return false;
      if (quickFilter === 'female' && tItem.gender !== 'Female') return false;
      if (quickFilter === 'active' && tItem.status !== 'Active') return false;

      if (!talentSearch.trim()) return true;
      const q = talentSearch.toLowerCase();
      const fullName = `${tItem.firstName} ${tItem.lastName}`.toLowerCase();
      const skill = tItem.primarySkill.toLowerCase();
      return fullName.includes(q) || skill.includes(q);
    });
  }, [talents, quickFilter, talentSearch]);

  // Breakdown of selected talents
  const selectedTalents = useMemo(
    () => talents.filter((tItem) => selectedTalentIds.includes(tItem.id)),
    [talents, selectedTalentIds]
  );
  const selectedMales = selectedTalents.filter((tItem) => tItem.gender === 'Male').length;
  const selectedFemales = selectedTalents.filter((tItem) => tItem.gender === 'Female').length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="580px"
    >
      {/* Drawer Header */}
      <div className="p-6 sm:px-7 sm:py-5 border-b border-border-subtle shrink-0 pr-16">
        <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary m-0 tracking-tight">
          {editingGroup ? t('edit_group') : t('create_group')}
        </h2>
        <p className="text-xs text-text-secondary mt-1 m-0">
          {t('group_form_subtitle')}
        </p>
      </div>

      <form
        id="group-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 sm:px-7 flex flex-col gap-5"
      >
        {/* 1. Group Name */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            {t('group_name')} *
          </label>
          <input
            type="text"
            required
            className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-text-tertiary transition-all duration-150"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Solaris Cirque Troupe"
          />
        </div>

        {/* 2. Group Description */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            {t('group_desc')}
          </label>
          <input
            type="text"
            className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-text-tertiary transition-all duration-150"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Aerial acrobatic and contemporary dance touring ensemble"
          />
        </div>

        {/* 3. Talent Selection Roster (Modern Combobox / Multi-Select) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-0">
              {t('group_members')} ({selectedTalentIds.length}: {selectedMales} {t('males')}, {selectedFemales} {t('females')})
            </label>
            {selectedTalentIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTalentIds([])}
                className="bg-transparent border-none text-xs text-text-secondary hover:text-text-primary cursor-pointer font-semibold underline"
              >
                {t('clear_all')}
              </button>
            )}
          </div>

          {/* Combobox Wrapper */}
          <div ref={comboboxRef} className="relative w-full">
            {/* Tags / Chips Input Box */}
            <div
              onClick={() => {
                setIsDropdownOpen(true);
                inputRef.current?.focus();
              }}
              className={`flex flex-wrap items-center gap-1.5 p-2 px-3 min-h-[44px] w-full rounded-sm border cursor-text transition-all duration-150 ${
                isDropdownOpen
                  ? 'bg-surface border-brand-primary ring-2 ring-brand-primary/10'
                  : 'bg-surface-secondary border-border-subtle hover:border-border-medium'
              }`}
            >
              {/* Selected Chips */}
              {selectedTalents.map((tItem) => (
                <span
                  key={tItem.id}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-brand-primary text-white text-xs font-semibold leading-tight shadow-sm"
                >
                  <span>
                    {tItem.firstName} {tItem.lastName ? `${tItem.lastName[0]}.` : ''} ({tItem.gender === 'Male' ? (language === 'ka' ? 'მ' : 'M') : (language === 'ka' ? 'ქ' : 'F')})
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTalentIds((prev) => prev.filter((id) => id !== tItem.id));
                    }}
                    className="bg-transparent border-none p-0 cursor-pointer text-white/80 hover:text-white flex items-center transition-colors"
                    title={t('delete')}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </span>
              ))}

              {/* Search input alongside chips */}
              <input
                ref={inputRef}
                type="text"
                value={talentSearch}
                onChange={(e) => {
                  setTalentSearch(e.target.value);
                  if (!isDropdownOpen) setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder={selectedTalents.length === 0 ? t('select_performers_placeholder') : ''}
                className="flex-1 min-w-[140px] border-none outline-none bg-transparent text-xs text-text-primary p-1 placeholder:text-text-tertiary"
              />

              {/* Dropdown Chevron Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                  if (!isDropdownOpen) inputRef.current?.focus();
                }}
                className="bg-transparent border-none cursor-pointer p-0.5 text-text-secondary hover:text-text-primary flex items-center ml-auto"
              >
                {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-surface rounded-md border border-border-subtle shadow-xl p-2.5 flex flex-col gap-2">
                {/* Quick Filters */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    {(['all', 'male', 'female', 'active'] as const).map((filterKey) => {
                      const labels: Record<string, string> = {
                        all: t('filter_all'),
                        male: t('filter_men'),
                        female: t('filter_women'),
                        active: t('filter_active')
                      };
                      const isActive = quickFilter === filterKey;
                      return (
                        <button
                          key={filterKey}
                          type="button"
                          onClick={() => setQuickFilter(filterKey)}
                          className={`px-2.5 py-0.5 rounded-pill text-xs font-semibold cursor-pointer transition-all duration-150 border ${
                            isActive
                              ? 'border-text-primary bg-text-primary text-white'
                              : 'border-border-subtle bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                          }`}
                        >
                          {labels[filterKey]}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-xs text-text-secondary">
                    {filteredTalents.length} {language === 'ka' ? 'შემსრულებელი' : 'performers'}
                  </span>
                </div>

                {/* Inactive Performer Alert Banner */}
                {inactiveNotice && (
                  <div className="flex items-center justify-between p-1.5 px-2.5 rounded bg-danger/10 border border-danger/25 text-danger text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>{inactiveNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInactiveNotice(null)}
                      className="bg-transparent border-none cursor-pointer text-danger p-0 hover:opacity-80"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Scrollable Single-Line List of Performers */}
                <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5 pr-1">
                  {filteredTalents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-text-secondary">
                      {language === 'ka' ? 'ტალანტები ვერ მოიძებნა' : 'No talents found'}
                    </div>
                  ) : (
                    filteredTalents.map((tItem) => {
                      const isSelected = selectedTalentIds.includes(tItem.id);
                      const isInactive = tItem.status !== 'Active';

                      const statusBgColor =
                        tItem.status === 'Active'
                          ? 'bg-emerald-500'
                          : tItem.status === 'Rest'
                          ? 'bg-amber-500'
                          : 'bg-danger';

                      return (
                        <div
                          key={tItem.id}
                          onClick={() => {
                            if (isInactive) {
                              setInactiveNotice(
                                t('performer_inactive_warning', { status: tItem.status })
                              );
                              return;
                            }
                            setInactiveNotice(null);
                            toggleTalentSelection(tItem.id);
                          }}
                          className={`flex items-center justify-between p-1.5 px-2.5 rounded-sm select-none transition-colors duration-150 ${
                            isInactive ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'
                          } ${
                            isSelected
                              ? 'bg-brand-primary/10'
                              : 'hover:bg-surface-secondary'
                          }`}
                        >
                          {/* Left: Checkbox + Small Avatar + Name & Details */}
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Checkbox */}
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-brand-primary bg-brand-primary text-white'
                                  : 'border-border-medium bg-surface text-transparent'
                              }`}
                            >
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </div>

                            {/* Small Avatar */}
                            {tItem.avatarUrl ? (
                              <img
                                src={tItem.avatarUrl}
                                alt={tItem.firstName}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-surface-secondary border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-primary shrink-0">
                                {tItem.firstName[0]}{tItem.lastName[0]}
                              </div>
                            )}

                            {/* Name, Skill, Gender, Height */}
                            <div className="text-xs truncate">
                              <strong className="text-text-primary font-semibold">
                                {tItem.firstName} {tItem.lastName}
                              </strong>
                              <span className="text-text-secondary ml-1.5 text-[11px]">
                                — {tItem.primarySkill} | {tItem.gender === 'Male' ? (language === 'ka' ? 'კაცი' : 'Male') : (language === 'ka' ? 'ქალი' : 'Female')} • {tItem.heightCm} {language === 'ka' ? 'სმ' : 'cm'}
                              </span>
                            </div>
                          </div>

                          {/* Right: Status Indicator Dot */}
                          <div
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary shrink-0"
                            title={tItem.status}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusBgColor} shrink-0`} />
                            {isInactive && <span>{tItem.status}</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Separator between Group Members and Inventory Requirements */}
        <div className="border-t border-border-subtle my-1" />

        {/* 4. Group Inventory Requirements */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-0.5">
                {t('inventory_reqs_and_rules')}
              </label>
              <p className="text-xs text-text-secondary m-0">
                {t('inventory_reqs_sub')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddRequirement}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer shrink-0"
            >
              <Plus size={14} /> {t('add_item_req')}
            </button>
          </div>

          <div className="bg-surface-secondary p-3 rounded-md border border-border-subtle">
            {inventoryRequirements.length === 0 ? (
              <div className="text-center p-4 text-xs text-text-secondary">
                {t('no_inventory_reqs')}
              </div>
            ) : (
              inventoryRequirements.map((req, index) => (
                <InventoryRequirementRow
                  key={req.id || index}
                  requirement={req}
                  onChange={(updated) => handleUpdateRequirement(index, updated)}
                  onRemove={() => handleRemoveRequirement(index)}
                />
              ))
            )}
          </div>
        </div>

        {/* 5. Rotation Cycle - Only visible when inventory requirements exist */}
        {inventoryRequirements.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              {t('duty_rotation_cycle')} *
            </label>
            <select
              className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all duration-150 cursor-pointer"
              value={rotationCycleWeeks}
              onChange={(e) => setRotationCycleWeeks(Number(e.target.value))}
            >
              <option value={1}>{t('period_1_week')}</option>
              <option value={2}>{t('period_2_weeks')}</option>
              <option value={3}>{t('period_3_weeks')}</option>
              <option value={4}>{t('period_4_weeks')}</option>
            </select>
          </div>
        )}
      </form>

      {/* Drawer Sticky Footer */}
      <div className="p-4 sm:px-7 border-t border-border-subtle bg-surface flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          form="group-form"
          className="inline-flex items-center justify-center px-5 py-2 rounded-pill text-sm font-medium bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer min-w-[130px]"
        >
          {editingGroup ? t('save_changes') : t('create_group')}
        </button>
      </div>
    </Drawer>
  );
};
