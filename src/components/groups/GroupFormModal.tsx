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
  const isTr = language === 'tr';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);

  const [talentSearch, setTalentSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'male' | 'female' | 'active'>('all');
  const [inactiveNotice, setInactiveNotice] = useState<string | null>(null);

  const comboboxRef = useRef<HTMLDivElement>(null);

  // Initialize or reset form state
  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name || '');
      setDescription(editingGroup.description || '');
      setSelectedTalentIds(editingGroup.memberTalentIds || []);
    } else {
      setName('');
      setDescription('');
      setSelectedTalentIds([]);
    }
    setTalentSearch('');
    setInactiveNotice(null);
  }, [editingGroup, isOpen]);

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

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: name.trim(),
        description: description.trim()
      });
      toast.success(
        isKa ? `ჯგუფის „${name.trim()}“ ცვლილებები შენახულია` : `Changes to group "${name.trim()}" saved`
      );
    } else {
      addGroup({
        name: name.trim(),
        description: description.trim(),
        memberTalentIds: selectedTalentIds,
        inventoryRequirements: [],
        specialDutyTasks: [],
        rotationCycleWeeks: 1,
        fairnessPoolEnabled: true,
        colorAccent: '#FF6C41'
      });
      toast.success(
        isKa ? `ჯგუფი „${name.trim()}“ წარმატებით შეიქმნა` : `Group "${name.trim()}" created successfully`
      );
    }

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
  );
};