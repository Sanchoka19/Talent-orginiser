'use client';

import React from 'react';
import {
  InventoryRequirement,
  DutyGenderRequirement,
  DutyCategory,
  COMMON_INVENTORY_ITEMS,
  COMMON_SPECIAL_TASKS
} from '../../types/inventory';
import { useLanguage } from '../../context/LanguageContext';
import { Trash2, Package, Sparkles, User, Users } from 'lucide-react';

interface InventoryRequirementRowProps {
  requirement: InventoryRequirement;
  index: number;
  onChange: (updated: InventoryRequirement) => void;
  onRemove: () => void;
}

export const InventoryRequirementRow: React.FC<InventoryRequirementRowProps> = ({
  requirement,
  index,
  onChange,
  onRemove
}) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';

  const category: DutyCategory = requirement.category || 'inventory';
  const suggestions = category === 'special_task' ? COMMON_SPECIAL_TASKS : COMMON_INVENTORY_ITEMS;
  const datalistId = `duty-suggestions-${index}`;

  return (
    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-surface-secondary/50 border border-slate-200 dark:border-border-subtle hover:border-slate-300 dark:hover:border-border-medium transition-all flex flex-col gap-2.5">
      {/* ხაზი 1: სრული სიგანის დასახელება + წაშლის ღილაკი */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            list={datalistId}
            placeholder={
              category === 'special_task'
                ? (isKa ? 'მაგ. ფარდის გაწევა' : 'e.g. Stage Curtain Cue')
                : (isKa ? 'მაგ. Heavy Audio Rig, Cyr Wheel...' : 'e.g. Heavy Audio Rig, Cyr Wheel...')
            }
            value={requirement.itemName}
            onChange={(e) => onChange({ ...requirement, itemName: e.target.value })}
            className="w-full text-xs sm:text-sm font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-border-subtle bg-white dark:bg-surface text-slate-800 dark:text-text-primary outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 placeholder:text-slate-400 dark:placeholder:text-text-tertiary transition-all"
            required
          />
          <datalist id={datalistId}>
            {suggestions.map((item, idx) => (
              <option key={idx} value={item} />
            ))}
          </datalist>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all cursor-pointer shrink-0"
          title={isKa ? 'წაშლა' : 'Remove duty'}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* ხაზი 2: კომპაქტური პარამეტრები (კატეგორია, სქესი, რაოდენობა) */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {/* კატეგორია */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border-subtle bg-white dark:bg-surface text-slate-700 dark:text-text-secondary">
          {category === 'special_task' ? (
            <Sparkles size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
          ) : (
            <Package size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
          )}
          <select
            value={category}
            onChange={(e) =>
              onChange({
                ...requirement,
                category: e.target.value as DutyCategory
              })
            }
            className="bg-transparent border-none outline-none text-xs font-medium text-slate-800 dark:text-text-primary cursor-pointer pr-1"
          >
            <option value="inventory">{isKa ? 'ინვენტარი' : 'Inventory'}</option>
            <option value="special_task">{isKa ? 'სპეციალური თასქი' : 'Special Task'}</option>
          </select>
        </div>

        {/* სქესის მოთხოვნა */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border-subtle bg-white dark:bg-surface text-slate-700 dark:text-text-secondary">
          <User size={13} className="text-slate-400 shrink-0" />
          <select
            value={requirement.assignedGender || 'Any'}
            onChange={(e) =>
              onChange({
                ...requirement,
                assignedGender: e.target.value as DutyGenderRequirement
              })
            }
            className="bg-transparent border-none outline-none text-xs font-medium text-slate-800 dark:text-text-primary cursor-pointer pr-1"
          >
            <option value="Any">{isKa ? 'სქესი: ნებისმიერი' : 'Gender: Any'}</option>
            <option value="Male Only">{isKa ? 'მხოლოდ კაცი' : 'Male Only'}</option>
            <option value="Female Only">{isKa ? 'მხოლოდ ქალი' : 'Female Only'}</option>
          </select>
        </div>

        {/* რაოდენობა (Headcount) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border-subtle bg-white dark:bg-surface ml-auto">
          <Users size={12} className="text-slate-400 shrink-0" />
          <span className="text-slate-500 dark:text-text-tertiary text-[11px] font-medium">
            {isKa ? 'რაოდ.' : 'Qty'}:
          </span>
          <input
            type="number"
            min={1}
            max={10}
            value={requirement.requiredHeadcount}
            onChange={(e) =>
              onChange({
                ...requirement,
                requiredHeadcount: Math.max(1, Math.min(10, Number(e.target.value) || 1))
              })
            }
            className="w-8 bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-text-primary text-center"
            required
          />
        </div>
      </div>
    </div>
  );
};