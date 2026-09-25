'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Group } from '../../types/group';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  User,
  Search,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

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

  // Performer selection combobox state
  const [talentSearch, setTalentSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'male' | 'female' | 'active'>('all');
  const [inactiveNotice, setInactiveNotice] = useState<string | null>(null);

  const comboboxRef = useRef<HTMLDivElement>(null);

  // Close member dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setIsDropdownOpen(false);
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
        className="px-4 py-2 rounded-pill text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
      >
        {isKa ? 'გაუქმება' : 'Cancel'}
      </button>

      <button
        type="submit"
        form="group-form"
        className="px-5 py-2 rounded-pill text-xs sm:text-sm font-bold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
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
            ? 'ჯგუფის საბაზისო ინფორმაცია და დასის შემსრულებლების შემადგენლობა'
            : 'Basic group information and cast performers roster'
      }
      maxWidth={editingGroup ? '440px' : '640px'}
      footer={footer}
    >
      <form
        id="group-form"
        onSubmit={handleSubmit}
        className={`w-full bg-surface flex flex-col gap-4 ${editingGroup ? 'p-1' : 'p-4 max-h-[75vh] overflow-y-auto'
          }`}
      >
        {/* Basic Group Info */}
        <div className={`flex flex-col gap-3.5 ${!editingGroup ? 'bg-surface-secondary/40 rounded-xl p-3.5' : ''}`}>
          {!editingGroup && (
            <div className="flex items-center gap-2 pb-1.5 border-b border-border-subtle">
              <Users size={16} className="text-brand-primary shrink-0" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                {isKa ? 'ჯგუფის საბაზისო მონაცემები' : 'Basic Group Information'}
              </span>
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1.5">
              {t('group_name')} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isKa ? 'მაგ. Phoenix Circus Troupe, Solaris Dance Ensemble...' : 'e.g. Solaris Show Ensemble'}
              className="w-full h-10 px-3.5 rounded-lg border border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1.5">
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
              className="w-full p-3 rounded-lg border border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Cast Roster & Member Selection (მხოლოდ ახალი ჯგუფის შექმნისას) */}
        {!editingGroup && (
          <div className="bg-surface-secondary/40 rounded-xl p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <User size={16} className="text-brand-primary shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                  {isKa ? 'დასის შემადგენლობა' : 'Cast Roster'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-primary/10 text-brand-primary">
                  {selectedTalents.length}
                </span>
              </div>
              {selectedTalents.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
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
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{inactiveNotice}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                <input
                  type="text"
                  value={talentSearch}
                  onChange={(e) => setTalentSearch(e.target.value)}
                  placeholder={isKa ? 'მოძებნეთ სახელით ან სპეციალობით...' : 'Search by name or discipline...'}
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
              {filteredTalents.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="ml-auto text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                >
                  {isKa ? 'ყველას მონიშვნა' : 'Select all'}
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-0.5">
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
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isSelected
                          ? 'bg-brand-primary/10 border border-brand-primary/20'
                          : 'hover:bg-surface-secondary border border-transparent hover:border-border-subtle'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={talent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.firstName}${talent.lastName}`}
                          alt={talent.firstName}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-border-subtle"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-text-primary truncate">
                            {talent.firstName} {talent.lastName}
                          </div>
                          <div className="text-[11px] text-text-secondary truncate">
                            {talent.primarySkill}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                          {talent.status}
                        </span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'border-border-subtle bg-surface'}`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedTalents.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border-subtle">
                {selectedTalents.map((talent) => (
                  <div
                    key={talent.id}
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-primary"
                  >
                    <img
                      src={talent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.firstName}${talent.lastName}`}
                      alt={talent.firstName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>{talent.firstName} {talent.lastName}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleTalent(talent.id); }}
                      className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center hover:text-danger transition-colors cursor-pointer ml-0.5"
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