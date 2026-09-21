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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '8px'
      }}
    >
      {/* Item Name with Autocomplete */}
      <div style={{ flex: 3 }}>
        <input
          type="text"
          list="inventory-suggestions"
          placeholder="e.g. Heavy Audio Rig"
          value={requirement.itemName}
          onChange={(e) => onChange({ ...requirement, itemName: e.target.value })}
          className="form-input"
          style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
          required
        />
        <datalist id="inventory-suggestions">
          {COMMON_INVENTORY_ITEMS.map((item, idx) => (
            <option key={idx} value={item} />
          ))}
        </datalist>
      </div>

      {/* Assigned Gender */}
      <div style={{ flex: 2 }}>
        <select
          value={requirement.assignedGender}
          onChange={(e) =>
            onChange({ ...requirement, assignedGender: e.target.value as DutyGenderRequirement })
          }
          className="form-select"
          style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
        >
          <option value="Male Only">{t('gender_male_only')}</option>
          <option value="Female Only">{t('gender_female_only')}</option>
          <option value="Any">{t('gender_any')}</option>
        </select>
      </div>

      {/* Required Headcount */}
      <div style={{ width: '90px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="number"
          min={1}
          max={10}
          value={requirement.requiredHeadcount}
          onChange={(e) =>
            onChange({ ...requirement, requiredHeadcount: Math.max(1, Number(e.target.value)) })
          }
          className="form-input"
          style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem', textAlign: 'center' }}
          title="Required Headcount"
          required
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t('crew')}</span>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className="btn btn-secondary btn-icon"
        style={{ width: '32px', height: '32px', color: '#EF4444' }}
        title="Remove requirement"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
