'use client';

import React from 'react';
import { InventoryRequirement, DutyGenderRequirement, COMMON_INVENTORY_ITEMS } from '../../types/inventory';
import { useLanguage } from '../../context/LanguageContext';
import { Trash2 } from 'lucide-react';

interface InventoryRequirementRowProps {
  requirement: InventoryRequirement;
  onChange: (updated: InventoryRequirement) => void;
  onRemove: () => void;
}

export const InventoryRequirementRow: React.FC<InventoryRequirementRowProps> = ({
  requirement,
  onChange,
  onRemove
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2.5 p-2.5 px-3.5 bg-surface rounded-sm border border-border-subtle mb-2">
      {/* Item Name with Autocomplete */}
      <div className="flex-[3]">
        <input
          type="text"
          list="inventory-suggestions"
          placeholder="e.g. Heavy Audio Rig"
          value={requirement.itemName}
          onChange={(e) => onChange({ ...requirement, itemName: e.target.value })}
          className="w-full text-xs px-2.5 py-1.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 placeholder:text-text-tertiary transition-all duration-150"
          required
        />
        <datalist id="inventory-suggestions">
          {COMMON_INVENTORY_ITEMS.map((item, idx) => (
            <option key={idx} value={item} />
          ))}
        </datalist>
      </div>

      {/* Assigned Gender */}
      <div className="flex-[2]">
        <select
          value={requirement.assignedGender}
          onChange={(e) =>
            onChange({ ...requirement, assignedGender: e.target.value as DutyGenderRequirement })
          }
          className="w-full text-xs px-2.5 py-1.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 cursor-pointer transition-all duration-150"
        >
          <option value="Male Only">{t('gender_male_only')}</option>
          <option value="Female Only">{t('gender_female_only')}</option>
          <option value="Any">{t('gender_any')}</option>
        </select>
      </div>

      {/* Required Headcount */}
      <div className="w-[90px] flex items-center gap-1 shrink-0">
        <input
          type="number"
          min={1}
          max={10}
          value={requirement.requiredHeadcount}
          onChange={(e) =>
            onChange({ ...requirement, requiredHeadcount: Math.max(1, Number(e.target.value)) })
          }
          className="w-full text-xs px-2 py-1.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none text-center focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
          title="Required Headcount"
          required
        />
        <span className="text-xs text-text-secondary">{t('crew')}</span>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className="w-8 h-8 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface text-danger hover:bg-danger-light hover:border-danger-border transition-all duration-150 cursor-pointer shrink-0"
        title="Remove requirement"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
