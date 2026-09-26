'use client';

import React, { useState, useEffect } from 'react';
import { Talent } from '../../types/talent';
import { Group, RotationCycleType } from '../../types/group';
import {
  DutyGenderRequirement,
  COMMON_INVENTORY_ITEMS
} from '../../types/inventory';
import {
  Boxes,
  Plus,
  Trash2,
  X,
  Clock,
  User,
  Users
} from 'lucide-react';

interface InventoryDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroup: Group;
  members: Talent[];
  initialPerformerId?: string;
  onSaveInventory: (
    items: Array<{ itemName: string; assignedGender: DutyGenderRequirement; requiredHeadcount: number }>,
    cycle: RotationCycleType,
    performerId?: string,
    customRotationValue?: number,
    customRotationUnit?: 'show' | 'day' | 'week'
  ) => void;
  dict: any;
  isKa: boolean;
}

type FormInventoryItem = {
  id: string;
  itemName: string;
  assignedGender: DutyGenderRequirement;
  requiredHeadcount: number | '';
};

export const InventoryDutyModal: React.FC<InventoryDutyModalProps> = ({
  isOpen,
  onClose,
  members,
  initialPerformerId = '',
  onSaveInventory,
  dict,
  isKa
}) => {
  const [inventoryItems, setInventoryItems] = useState<FormInventoryItem[]>([
    { id: 'inv-1', itemName: '', assignedGender: 'Any', requiredHeadcount: 2 }
  ]);
  const [inventoryRotationCycle, setInventoryRotationCycle] = useState<RotationCycleType>('every_show');
  const [customRotationValue, setCustomRotationValue] = useState<number | ''>(2);
  const [customRotationUnit, setCustomRotationUnit] = useState<'show' | 'day' | 'week'>('week');

  useEffect(() => {
    if (isOpen) {
      setInventoryItems([
        { id: `inv_${Date.now()}_1`, itemName: '', assignedGender: 'Any', requiredHeadcount: 2 }
      ]);
      setInventoryRotationCycle('every_show');
      setCustomRotationValue(2);
      setCustomRotationUnit('week');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddInventoryItem = () => {
    setInventoryItems((prev) => [
      ...prev,
      {
        id: `inv_${Date.now()}_${prev.length + 1}`,
        itemName: '',
        assignedGender: 'Any',
        requiredHeadcount: 2
      }
    ]);
  };

  const handleRemoveInventoryItem = (itemId: string) => {
    if (inventoryItems.length <= 1) return;
    setInventoryItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleUpdateInventoryItem = (
    itemId: string,
    updated: Partial<FormInventoryItem>
  ) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updated } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedItems = inventoryItems.map((item) => ({
      ...item,
      requiredHeadcount: Math.max(1, Number(item.requiredHeadcount) || 1)
    }));
    onSaveInventory(
      sanitizedItems,
      inventoryRotationCycle,
      undefined,
      inventoryRotationCycle === 'custom'
        ? Math.max(1, Number(customRotationValue) || 2)
        : undefined,
      inventoryRotationCycle === 'custom' ? customRotationUnit : undefined
    );
  };

  const rotationCycles: { id: RotationCycleType; label: string }[] = [
    { id: 'every_show', label: dict.cycleEveryShow },
    { id: 'weekly', label: dict.cycleWeekly },
    { id: 'monthly', label: dict.cycleMonthly },
    { id: 'custom', label: dict.cycleCustom || (isKa ? 'მორგებული (Custom)' : 'Custom') }
  ];

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
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-brand-primary">
              <Boxes size={20} />
            </div>
            <div className="flex-1 min-w-0 mr-4">
              <h3 className="text-base font-bold text-text-primary leading-tight">
                {dict.addInventoryTitle || (isKa ? 'ინვენტარის დამატება' : 'Add Inventory Duty')}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {dict.addInventorySubtitle || (isKa ? 'შოუს ინვენტარისა და რეკვიზიტების მორიგეობის წესები' : 'Equipment handling and rotation rules')}
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 scroll-smooth">
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
            {/* Cycle Selector */}
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
                <Clock size={14} className="text-brand-primary" />
                <span>{dict.inventoryCycleLabel}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {rotationCycles.map((cycleOpt) => (
                  <button
                    key={cycleOpt.id}
                    type="button"
                    onClick={() => setInventoryRotationCycle(cycleOpt.id)}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${inventoryRotationCycle === cycleOpt.id
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-slate-200 dark:border-border-subtle bg-surface text-text-secondary hover:text-text-primary hover:border-slate-300'
                      }`}
                  >
                    {cycleOpt.label}
                  </button>
                ))}
              </div>

              {/* Custom Cycle Duration Input Row */}
              {inventoryRotationCycle === 'custom' && (
                <div className="mt-2.5 p-2.5 sm:px-3.5 sm:py-2.5 rounded-lg bg-brand-primary/5 border border-brand-primary/20 flex items-center gap-2 flex-wrap text-xs text-text-primary animate-in fade-in slide-in-from-top-1 duration-150">
                  <span className="font-semibold text-text-secondary">
                    {isKa ? 'ციკლის ხანგრძლივობა:' : 'Cycle Duration:'}
                  </span>

                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={customRotationValue}
                    onChange={(e) =>
                      setCustomRotationValue(
                        e.target.value === ''
                          ? ''
                          : Math.max(1, Math.min(99, Number(e.target.value)))
                      )
                    }
                    onBlur={() => {
                      if (customRotationValue === '' || Number(customRotationValue) < 1) {
                        setCustomRotationValue(2);
                      }
                    }}
                    className="w-14 px-2 py-1 text-center font-bold rounded-md border border-border-medium bg-surface text-text-primary outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                    placeholder="2"
                    required
                  />

                  <select
                    value={customRotationUnit}
                    onChange={(e) =>
                      setCustomRotationUnit(e.target.value as 'show' | 'day' | 'week')
                    }
                    className="text-xs font-semibold px-2.5 py-1 rounded-md border border-border-medium bg-surface text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                  >
                    <option value="week">{isKa ? 'კვირა' : 'week(s)'}</option>
                    <option value="show">{isKa ? 'შოუ' : 'show(s)'}</option>
                    <option value="day">{isKa ? 'დღე' : 'day(s)'}</option>
                  </select>

                  <span className="ml-auto text-[11px] text-text-tertiary hidden sm:inline-block font-normal">
                    {isKa
                      ? `(როტაცია ყოველ ${customRotationValue || 2} ${
                          customRotationUnit === 'week'
                            ? 'კვირაში ერთხელ'
                            : customRotationUnit === 'day'
                            ? 'დღეში ერთხელ'
                            : 'შოუზე'
                        })`
                      : `(Rotates every ${customRotationValue || 2} ${customRotationUnit})`}
                  </span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-200/80 dark:border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes size={15} className="text-brand-primary" />
                  <span className="text-xs font-bold text-text-primary">
                    {dict.inventoryItemsList}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-brand-primary border border-blue-200 dark:border-blue-900/60">
                    {inventoryItems.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddInventoryItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-brand-primary border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>{dict.addInventoryItem}</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {inventoryItems.map((item, iIdx) => {
                  const itemDatalistId = `inv-item-datalist-${iIdx}`;
                  return (
                    <div
                      key={item.id || iIdx}
                      className="p-3 rounded-lg border border-slate-200/70 dark:border-border-subtle bg-slate-50/50 dark:bg-surface-secondary/40 space-y-2.5 shadow-2xs hover:border-slate-300 dark:hover:border-border-medium transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            list={itemDatalistId}
                            placeholder={dict.itemNamePlaceholder}
                            value={item.itemName}
                            onChange={(e) =>
                              handleUpdateInventoryItem(item.id, { itemName: e.target.value })
                            }
                            className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-border-medium bg-surface text-text-primary outline-none focus:border-brand-primary transition-all placeholder:text-text-muted"
                            required
                          />
                          <datalist id={itemDatalistId}>
                            {COMMON_INVENTORY_ITEMS.map((cItem) => (
                              <option key={cItem} value={cItem} />
                            ))}
                          </datalist>
                        </div>

                        {inventoryItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveInventoryItem(item.id)}
                            className="p-2 text-text-secondary hover:text-danger rounded-lg hover:bg-danger/10 transition-colors cursor-pointer shrink-0"
                            title={dict.delete}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <div className="flex-1 min-w-[140px] relative">
                          <User
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                          />
                          <select
                            value={item.assignedGender}
                            onChange={(e) =>
                              handleUpdateInventoryItem(item.id, {
                                assignedGender: e.target.value as DutyGenderRequirement
                              })
                            }
                            className="w-full text-xs font-semibold pl-8 pr-2.5 py-2 rounded-lg border border-border-medium bg-surface text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                          >
                            <option value="Any">{dict.genderAny}</option>
                            <option value="Female Only">{dict.genderFemaleOnly}</option>
                            <option value="Male Only">{dict.genderMaleOnly}</option>
                          </select>
                        </div>

                        <div className="w-32 shrink-0 relative flex items-center">
                          <Users
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                          />
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={item.requiredHeadcount}
                            onChange={(e) =>
                              handleUpdateInventoryItem(item.id, {
                                requiredHeadcount: e.target.value === '' ? '' : Math.max(1, Math.min(10, Number(e.target.value)))
                              })
                            }
                            onBlur={() => {
                              if (item.requiredHeadcount === '' || Number(item.requiredHeadcount) < 1) {
                                handleUpdateInventoryItem(item.id, { requiredHeadcount: 1 });
                              }
                            }}
                            className="w-full text-xs font-bold pl-8 pr-12 py-2 rounded-lg border border-border-medium bg-surface text-text-primary text-center outline-none focus:border-brand-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            title={dict.headcount}
                            required
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-text-secondary pointer-events-none select-none">
                            {isKa ? 'შემსრ.' : 'prs.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              {dict.saveInventory}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
