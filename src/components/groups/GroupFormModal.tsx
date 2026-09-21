import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Group } from '../../types/group';
import { Talent } from '../../types/talent';
import { InventoryRequirement, DutyGenderRequirement } from '../../types/inventory';
import { Drawer } from '../common/Drawer';
import { InventoryRequirementRow } from './InventoryRequirementRow';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Search, Check, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

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
    return talents.filter((t) => {
      if (quickFilter === 'male' && t.gender !== 'Male') return false;
      if (quickFilter === 'female' && t.gender !== 'Female') return false;
      if (quickFilter === 'active' && t.status !== 'Active') return false;

      if (!talentSearch.trim()) return true;
      const q = talentSearch.toLowerCase();
      const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
      const skill = t.primarySkill.toLowerCase();
      return fullName.includes(q) || skill.includes(q);
    });
  }, [talents, quickFilter, talentSearch]);

  // Breakdown of selected talents
  const selectedTalents = useMemo(
    () => talents.filter((t) => selectedTalentIds.includes(t.id)),
    [talents, selectedTalentIds]
  );
  const selectedMales = selectedTalents.filter((t) => t.gender === 'Male').length;
  const selectedFemales = selectedTalents.filter((t) => t.gender === 'Female').length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="580px"
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '24px 28px 18px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
          paddingRight: '64px'
        }}
      >
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-charcoal)', margin: 0, letterSpacing: '-0.02em' }}>
          {editingGroup ? t('edit_group') : t('create_group')}
        </h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
          {t('group_form_subtitle')}
        </p>
      </div>

      <form
        id="group-form"
        onSubmit={handleSubmit}
        className="thin-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* 1. Group Name */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t('group_name')} *</label>
          <input
            type="text"
            required
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Solaris Cirque Troupe"
            style={{ width: '100%' }}
          />
        </div>

        {/* 2. Group Description */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t('group_desc')}</label>
          <input
            type="text"
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Aerial acrobatic and contemporary dance touring ensemble"
            style={{ width: '100%' }}
          />
        </div>

        {/* 4. Talent Selection Roster (Modern Combobox / Multi-Select) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              {t('group_members')} ({selectedTalentIds.length}: {selectedMales} {t('males')}, {selectedFemales} {t('females')})
            </label>
            {selectedTalentIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTalentIds([])}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                {t('clear_all')}
              </button>
            )}
          </div>

          {/* Combobox Wrapper */}
          <div ref={comboboxRef} style={{ position: 'relative', width: '100%' }}>
            {/* Tags / Chips Input Box */}
            <div
              onClick={() => {
                setIsDropdownOpen(true);
                inputRef.current?.focus();
              }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                minHeight: '44px',
                width: '100%',
                background: isDropdownOpen ? 'var(--bg-surface)' : 'var(--bg-surface-secondary)',
                border: isDropdownOpen ? '1px solid var(--brand-secondary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: isDropdownOpen ? '0 0 0 3px rgba(0, 79, 114, 0.12)' : 'none',
                cursor: 'text',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast)'
              }}
            >
              {/* Selected Chips */}
              {selectedTalents.map((tItem) => (
                <span
                  key={tItem.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--brand-primary)',
                    border: '1px solid var(--brand-primary-hover)',
                    color: '#FFFFFF',
                    fontSize: '0.785rem',
                    fontWeight: 600,
                    lineHeight: 1.3
                  }}
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
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.85
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
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
                style={{
                  flex: 1,
                  minWidth: '140px',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.825rem',
                  color: 'var(--color-charcoal)',
                  padding: '4px 2px'
                }}
              />

              {/* Dropdown Chevron Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                  if (!isDropdownOpen) inputRef.current?.focus();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 'auto'
                }}
              >
                {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {/* Quick Filters */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                          style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid',
                            borderColor: isActive ? 'var(--color-charcoal)' : 'var(--border-subtle)',
                            background: isActive ? 'var(--color-charcoal)' : 'var(--bg-surface-secondary)',
                            color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          {labels[filterKey]}
                        </button>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>
                    {filteredTalents.length} {language === 'ka' ? 'შემსრულებელი' : 'performers'}
                  </span>
                </div>

                {/* Inactive Performer Alert Banner */}
                {inactiveNotice && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#DC2626',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                      <span>{inactiveNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInactiveNotice(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Scrollable Single-Line List of Performers */}
                <div
                  className="thin-scrollbar"
                  style={{
                    maxHeight: '220px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    paddingRight: '4px'
                  }}
                >
                  {filteredTalents.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {language === 'ka' ? 'ტალანტები ვერ მოიძებნა' : 'No talents found'}
                    </div>
                  ) : (
                    filteredTalents.map((tItem) => {
                      const isSelected = selectedTalentIds.includes(tItem.id);
                      const isInactive = tItem.status !== 'Active';

                      const statusColor =
                        tItem.status === 'Active' ? '#16A34A' : tItem.status === 'Rest' ? '#EAB308' : '#EF4444';

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
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: isSelected ? 'rgba(255, 108, 65, 0.15)' : 'transparent',
                            cursor: isInactive ? 'not-allowed' : 'pointer',
                            opacity: isInactive ? 0.55 : 1,
                            transition: 'background var(--transition-fast)',
                            userSelect: 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {/* Left: Checkbox + Small Avatar + Name & Details */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            {/* Checkbox */}
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '4px',
                                border: isSelected
                                  ? '1.5px solid var(--color-charcoal)'
                                  : '1.5px solid var(--border-medium)',
                                background: isSelected ? 'var(--color-charcoal)' : '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                flexShrink: 0
                              }}
                            >
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </div>

                            {/* Small Avatar */}
                            {tItem.avatarUrl ? (
                              <img
                                src={tItem.avatarUrl}
                                alt={tItem.firstName}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  flexShrink: 0
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: 'var(--bg-surface-secondary)',
                                  border: '1px solid var(--border-subtle)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  color: 'var(--color-charcoal)',
                                  flexShrink: 0
                                }}
                              >
                                {tItem.firstName[0]}{tItem.lastName[0]}
                              </div>
                            )}

                            {/* Name, Skill, Gender, Height */}
                            <div
                              style={{
                                fontSize: '0.8rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <strong style={{ color: 'var(--color-charcoal)' }}>
                                {tItem.firstName} {tItem.lastName}
                              </strong>
                              <span style={{ color: 'var(--color-text-secondary)', marginLeft: '6px', fontSize: '0.75rem' }}>
                                — {tItem.primarySkill} | {tItem.gender === 'Male' ? (language === 'ka' ? 'კაცი' : 'Male') : (language === 'ka' ? 'ქალი' : 'Female')} • {tItem.heightCm} {language === 'ka' ? 'სმ' : 'cm'}
                              </span>
                            </div>
                          </div>

                          {/* Right: Status Indicator Dot */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: 'var(--color-text-secondary)',
                              flexShrink: 0
                            }}
                            title={tItem.status}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: statusColor,
                                flexShrink: 0
                              }}
                            />
                            <span style={{ display: isInactive ? 'inline' : 'none' }}>{tItem.status}</span>
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
        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

        {/* 4. Group Inventory Requirements */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '2px', display: 'block' }}>
                {t('inventory_reqs_and_rules')}
              </label>
              <p style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                {t('inventory_reqs_sub')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddRequirement}
              className="btn btn-secondary"
              style={{ fontSize: '0.775rem', padding: '6px 12px', flexShrink: 0 }}
            >
              <Plus size={14} /> {t('add_item_req')}
            </button>
          </div>

          <div
            style={{
              background: 'var(--bg-surface-secondary)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {inventoryRequirements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('duty_rotation_cycle')} *</label>
            <select
              className="form-select"
              value={rotationCycleWeeks}
              onChange={(e) => setRotationCycleWeeks(Number(e.target.value))}
              style={{ width: '100%' }}
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
      <div
        style={{
          padding: '16px 28px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          flexShrink: 0
        }}
      >
        <button type="button" onClick={onClose} className="btn btn-secondary">
          {t('cancel')}
        </button>
        <button type="submit" form="group-form" className="btn btn-primary" style={{ minWidth: '130px' }}>
          {editingGroup ? t('save_changes') : t('create_group')}
        </button>
      </div>
    </Drawer>
  );
};
