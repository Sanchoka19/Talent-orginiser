'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Group } from '../../types/group';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Check,
  X,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { getTalentAvatar } from '../../utils/avatarUtils';
import { MemberGroupConflictModal, ConflictedMemberInfo } from './MemberGroupConflictModal';

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup?: Group | null;
}

const GROUP_COLOR_PRESETS = [
  { name: 'Coral / Tangerine', hex: '#FF6C41' },
  { name: 'Ocean Blue', hex: '#004F72' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Rose', hex: '#E11D48' },
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Hot Pink', hex: '#EC4899' },
  { name: 'Sky Blue', hex: '#0EA5E9' },
  { name: 'Lime', hex: '#84CC16' },
  { name: 'Violet', hex: '#7C3AED' },
  { name: 'Fuchsia', hex: '#D946EF' },
  { name: 'Crimson', hex: '#BE123C' },
  { name: 'Dark Teal', hex: '#0F766E' },
];

export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  onClose,
  editingGroup
}) => {
  const { groups, talents, addGroup, updateGroup } = useApp();
  const { t, language } = useLanguage();
  const toast = useToast();
  const isKa = language === 'ka';
  const isTr = language === 'tr';

  // Map of lowercase hex -> group name of other groups (colors already taken)
  const usedColorMap = useMemo(() => {
    const map = new Map<string, string>();
    groups.forEach((g) => {
      if (editingGroup && g.id === editingGroup.id) return;
      if (g.colorAccent) {
        map.set(g.colorAccent.toLowerCase(), g.name);
      }
    });
    return map;
  }, [groups, editingGroup]);

  // Find the first available preset color that is not taken by another group
  const getFirstAvailableColor = (usedMap: Map<string, string>): string => {
    for (const preset of GROUP_COLOR_PRESETS) {
      if (!usedMap.has(preset.hex.toLowerCase())) {
        return preset.hex;
      }
    }
    const hue = (usedMap.size * 137.508) % 360;
    return `hsl(${Math.round(hue)}, 75%, 50%)`;
  };

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorAccent, setColorAccent] = useState<string>('#FF6C41');
  const [allowMultiDuty, setAllowMultiDuty] = useState<boolean>(true);
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictedMembers, setConflictedMembers] = useState<ConflictedMemberInfo[]>([]);

  const [talentSearch, setTalentSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'male' | 'female' | 'active'>('all');
  const [inactiveNotice, setInactiveNotice] = useState<string | null>(null);

  const comboboxRef = useRef<HTMLDivElement>(null);

  // Initialize or reset form state
  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name || '');
      setDescription(editingGroup.description || '');
      setColorAccent(editingGroup.colorAccent || '#FF6C41');
      setAllowMultiDuty(editingGroup.allowMultiDuty !== false);
      setSelectedTalentIds(editingGroup.memberTalentIds || []);
    } else {
      setName('');
      setDescription('');
      setAllowMultiDuty(true);
      // Auto-assign the first unused color among all groups
      const firstAvailable = getFirstAvailableColor(usedColorMap);
      setColorAccent(firstAvailable);
      setSelectedTalentIds([]);
    }
    setTalentSearch('');
    setInactiveNotice(null);
    setIsConflictModalOpen(false);
    setConflictedMembers([]);
  }, [editingGroup, isOpen, usedColorMap]);

  // Toggle talent selection
  const handleToggleTalent = (talentId: string) => {
    const tal = talents.find((tItem) => tItem.id === talentId);
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
            ? `ყურადღება: „${tal.firstName} ${tal.lastName}“ იმყოფება სტატუსში [${statusLabel}], თუმცა ჯგუფში დამატება დაშვებულია.`
            : `Notice: "${tal.firstName} ${tal.lastName}" is currently [${statusLabel}], but can still be added to the cast.`
        );
      } else {
        setInactiveNotice(null);
      }
      setSelectedTalentIds((prev) => [...prev, talentId]);
    }
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredTalents.map((tItem) => tItem.id);
    const newSelected = Array.from(new Set([...selectedTalentIds, ...filteredIds]));
    setSelectedTalentIds(newSelected);
  };

  const handleDeselectAll = () => {
    setSelectedTalentIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(isKa ? 'გთხოვთ მიუთითოთ ჯგუფის დასახელება' : 'Please provide a group name');
      return;
    }

    // Uniqueness validation: check if chosen color is already assigned to another group
    const conflictingGroupName = usedColorMap.get(colorAccent.toLowerCase());
    if (conflictingGroupName) {
      toast.error(
        isKa
          ? `ეს ფერი უკვე მინიჭებულია ჯგუფისთვის „${conflictingGroupName}“. თითოეულ ჯგუფს უნდა ჰქონდეს უნიკალური ფერი.`
          : `This color is already assigned to group "${conflictingGroupName}". Each group must have a unique color.`
      );
      return;
    }

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: name.trim(),
        description: description.trim(),
        colorAccent,
        allowMultiDuty
      });
      toast.success(
        isKa ? `ჯგუფის „${name.trim()}“ ცვლილებები შენახულია` : `Changes to group "${name.trim()}" saved`
      );
      onClose();
    } else {
      // Check if any selected performer is already a member of an existing group
      const conflicts: ConflictedMemberInfo[] = [];
      for (const talentId of selectedTalentIds) {
        const assignedGroups = groups.filter((g) => (g.memberTalentIds || []).includes(talentId));
        if (assignedGroups.length > 0) {
          const talent = talents.find((t) => t.id === talentId);
          if (talent) {
            conflicts.push({ talent, existingGroups: assignedGroups });
          }
        }
      }

      if (conflicts.length > 0) {
        setConflictedMembers(conflicts);
        setIsConflictModalOpen(true);
        return;
      }

      executeCreateGroup();
    }
  };

  const executeCreateGroup = () => {
    addGroup({
      name: name.trim(),
      description: description.trim(),
      memberTalentIds: selectedTalentIds,
      inventoryRequirements: [],
      specialDutyTasks: [],
      rotationCycleWeeks: 1,
      fairnessPoolEnabled: true,
      allowMultiDuty,
      colorAccent
    });
    toast.success(
      isKa ? `ჯგუფი „${name.trim()}“ წარმატებით შეიქმნა` : `Group "${name.trim()}" created successfully`
    );
    setIsConflictModalOpen(false);
    onClose();
  };

  // Filtered talent options
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

  const selectedTalents = useMemo(
    () => talents.filter((tItem) => selectedTalentIds.includes(tItem.id)),
    [talents, selectedTalentIds]
  );
  const selectedMales = selectedTalents.filter((tItem) => tItem.gender === 'Male').length;
  const selectedFemales = selectedTalents.filter((tItem) => tItem.gender === 'Female').length;

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
      >
        {isKa ? 'გაუქმება' : 'Cancel'}
      </button>

      <button
        type="submit"
        form="group-form"
        className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover active:scale-[0.99] transition-all cursor-pointer shadow-xs"
      >
        {editingGroup
          ? isKa
            ? 'ცვლილებების შენახვა'
            : 'Save Changes'
          : isKa
            ? 'ჯგუფის შექმნა'
            : 'Create Group'}
      </button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
      onClose={onClose}
      title={editingGroup ? t('edit_group') : t('create_group')}
      subtitle={
        editingGroup
          ? isKa
            ? 'ჯგუფის საბაზისო ინფორმაციის განახლება'
            : 'Update basic group information'
          : isKa
            ? 'შეიყვანეთ მონაცემები ჯგუფის, აღწერისა და შემადგენლობის შესახებ'
            : 'Enter details regarding the group, description, and cast performers'
      }
      footer={footer}
    >
      <form
        id="group-form"
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-4 text-left"
      >
        {/* Group Name */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            {t('group_name')} <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isKa ? 'e.g. Phoenix Circus Troupe' : 'e.g. Solaris Show Ensemble'}
            className="w-full h-10 px-3.5 rounded-lg border border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted/60 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            {isKa ? 'აღწერა' : isTr ? 'Açıklama' : 'Description'}
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              isKa
                ? 'დასის მოკლე აღწერა, სტილი, მთავარი ნომრები და სცენური სპეციფიკა...'
                : 'Brief description of troupe style, acts, and staging...'
            }
            className="w-full p-3 rounded-lg border border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted/60 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all resize-none"
          />
        </div>

        {/* Color Accent Picker */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-text-secondary">
              {isKa ? 'ჯგუფის ფერი (კალენდარზე)' : 'Group Accent Color (for calendar)'}
            </label>
            <span className="text-[11px] text-text-tertiary">
              {isKa ? 'თითოეულ ჯგუფს აქვს უნიკალური ფერი' : 'Unique per group'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {GROUP_COLOR_PRESETS.map((preset) => {
              const usedByGroup = usedColorMap.get(preset.hex.toLowerCase());
              const isSelected = colorAccent.toLowerCase() === preset.hex.toLowerCase();
              const isTaken = !!usedByGroup;

              return (
                <button
                  key={preset.hex}
                  type="button"
                  disabled={isTaken}
                  onClick={() => !isTaken && setColorAccent(preset.hex)}
                  title={
                    isTaken
                      ? `${preset.name} (${isKa ? 'დაკავებულია: ' : 'In use by: '}${usedByGroup})`
                      : preset.name
                  }
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all relative ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-brand-primary scale-110 shadow-sm z-10'
                      : isTaken
                      ? 'opacity-25 cursor-not-allowed filter grayscale'
                      : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && (
                    <Check size={14} className="text-white drop-shadow-sm" />
                  )}
                  {isTaken && !isSelected && (
                    <X size={13} className="text-white/80" />
                  )}
                </button>
              );
            })}

            {/* Custom color input */}
            <div className="relative flex items-center ml-1">
              <input
                type="color"
                value={colorAccent.startsWith('#') ? colorAccent : '#6366F1'}
                onChange={(e) => setColorAccent(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border border-border-subtle p-0 overflow-hidden"
                title={isKa ? 'სხვა ფერის არჩევა' : 'Custom color'}
              />
            </div>

            <div
              className="px-2 py-0.5 rounded text-xs font-mono font-medium border border-border-subtle"
              style={{ color: colorAccent }}
            >
              {colorAccent.toUpperCase()}
            </div>
          </div>

          {/* Warning banner if current color is taken */}
          {usedColorMap.has(colorAccent.toLowerCase()) && (
            <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
              <AlertTriangle size={14} className="shrink-0" />
              <span>
                {isKa
                  ? `ეს ფერი უკვე გამოყენებულია ჯგუფის მიერ: „${usedColorMap.get(colorAccent.toLowerCase())}“. გთხოვთ აირჩიოთ განსხვავებული ფერი.`
                  : `This color is already in use by group "${usedColorMap.get(colorAccent.toLowerCase())}". Please select a different color.`}
              </span>
            </div>
          )}
        </div>

        {/* Multi-Duty Rule Setting */}
        <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/40 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-text-primary">
                {isKa ? 'დაშვება: 1 ადამიანი = 1-ზე მეტი ინვენტარი (Multi-Duty)' : 'Multi-Duty Allowance (1 talent > 1 duty)'}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill border ${
                allowMultiDuty
                  ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30'
                  : 'bg-surface-secondary text-text-tertiary border-border-subtle'
              }`}>
                {allowMultiDuty ? (isKa ? 'ჩართულია' : 'Enabled') : (isKa ? 'გამორთულია' : 'Disabled')}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1 leading-relaxed m-0">
              {isKa
                ? 'თუ ერთ შოუზე ინვენტარის რაოდენობა მეტია ხელმისაწვდომ წევრებზე (მაგ. 5 ინვენტარი და 4 წევრი), სისტემა მე-5 ინვენტარს დაუმატებს იმ წევრს, ვისაც როტაციის ისტორიით ყველაზე ნაკლები დატვირთვა ჰქონდა.'
                : 'When duty requirements exceed available troupe members, extra duties are automatically distributed to members with the lowest historical duty load.'}
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={allowMultiDuty}
              onChange={(e) => setAllowMultiDuty(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-border-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
          </label>
        </div>

        {/* Cast Selection Block */}
        {!editingGroup && (
          <div className="flex flex-col gap-3 pt-2 border-t border-border-subtle">
            {/* Header / Info Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-secondary">
                  {isKa ? 'დასის შემადგენლობა' : 'Cast Roster'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-surface-secondary text-text-secondary border border-border-subtle">
                  {selectedTalents.length}
                </span>
              </div>

              {selectedTalents.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{selectedMales} {t('males')}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span>{selectedFemales} {t('females')}</span>
                  </span>
                </div>
              )}
            </div>

            {inactiveNotice && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{inactiveNotice}</span>
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={talentSearch}
                onChange={(e) => setTalentSearch(e.target.value)}
                placeholder={isKa ? 'მოძებნეთ სახელით ან სპეციალობით...' : 'Search by name or discipline...'}
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-border-subtle bg-surface text-xs sm:text-sm text-text-primary placeholder:text-text-muted/60 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
              />
              {talentSearch && (
                <button
                  type="button"
                  onClick={() => setTalentSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
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
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer ${quickFilter === flt.id
                        ? 'bg-brand-primary text-white shadow-2xs'
                        : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
                      }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {selectedTalentIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-[11px] font-medium text-danger hover:underline cursor-pointer"
                  >
                    {isKa ? 'გასუფთავება' : 'Clear'}
                  </button>
                )}
                {filteredTalents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-[11px] font-semibold text-brand-primary hover:underline cursor-pointer"
                  >
                    {isKa ? 'ყველას მონიშვნა' : 'Select all'}
                  </button>
                )}
              </div>
            </div>

            {/* Talent List Container */}
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto rounded-lg border border-border-subtle p-1 divide-y divide-border-subtle/50">
              {filteredTalents.length === 0 ? (
                <div className="py-6 text-center text-xs text-text-secondary">
                  {isKa ? 'შემსრულებელი ვერ მოიძებნა' : 'No performers found'}
                </div>
              ) : (
                filteredTalents.map((talent) => {
                  const isSelected = selectedTalentIds.includes(talent.id);
                  const isActive = talent.status === 'Active';
                  const assignedGroups = groups.filter((g) => (g.memberTalentIds || []).includes(talent.id));
                  return (
                    <div
                      key={talent.id}
                      onClick={() => handleToggleTalent(talent.id)}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isSelected
                          ? 'bg-brand-primary/5 hover:bg-brand-primary/10'
                          : 'hover:bg-surface-secondary'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={getTalentAvatar(talent)}
                          alt={talent.firstName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-border-subtle"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-text-primary truncate">
                            {talent.firstName} {talent.lastName}
                          </div>
                          <div className="text-[11px] text-text-secondary truncate">
                            {talent.primarySkill}
                          </div>
                          {assignedGroups.length > 0 && (
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              <span className="text-[9px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                {isKa ? 'სხვა ჯგუფშია:' : 'In group:'}
                              </span>
                              {assignedGroups.map((grp) => (
                                <span
                                  key={grp.id}
                                  className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.2 rounded-full border"
                                  style={{
                                    backgroundColor: `${grp.colorAccent || '#6366f1'}15`,
                                    borderColor: `${grp.colorAccent || '#6366f1'}35`,
                                    color: grp.colorAccent || '#6366f1',
                                  }}
                                >
                                  <span
                                    className="w-1 h-1 rounded-full"
                                    style={{ backgroundColor: grp.colorAccent || '#6366f1' }}
                                  />
                                  {grp.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                          {isKa
                            ? (talent.status === 'Active' ? 'აქტიური' : talent.status === 'Sick/Injured' ? 'ავად/ტრავმირებული' : 'დასვენებაზე')
                            : talent.status}
                        </span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'border-border-subtle bg-surface'}`}>
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Chips */}
            {selectedTalents.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedTalents.map((talent) => (
                  <div
                    key={talent.id}
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-md bg-surface-secondary border border-border-subtle text-[11px] font-medium text-text-primary"
                  >
                    <img
                      src={getTalentAvatar(talent)}
                      alt={talent.firstName}
                      className="w-3.5 h-3.5 rounded-full object-cover"
                    />
                    <span>{talent.firstName} {talent.lastName}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleTalent(talent.id); }}
                      className="w-3.5 h-3.5 inline-flex items-center justify-center text-text-muted hover:text-danger transition-colors cursor-pointer"
                    >
                      <X size={9} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>

    <MemberGroupConflictModal
      isOpen={isConflictModalOpen}
      onClose={() => setIsConflictModalOpen(false)}
      onConfirm={executeCreateGroup}
      targetGroupName={name.trim()}
      conflictedMembers={conflictedMembers}
    />
    </>
  );
};