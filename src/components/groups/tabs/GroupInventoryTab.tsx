'use client';

import React from 'react';
import { InventoryRequirement } from '../../../types/inventory';
import {
  Boxes,
  Plus,
  Users,
  User,
  Trash2,
  Info
} from 'lucide-react';

interface GroupInventoryTabProps {
  inventoryReqs: InventoryRequirement[];
  onAddInventory: () => void;
  onDeleteInventory: (reqId: string, e: React.MouseEvent) => void;
  onSelectInventory?: (req: InventoryRequirement) => void;
  dict: any;
  isKa: boolean;
}

export const GroupInventoryTab: React.FC<GroupInventoryTabProps> = ({
  inventoryReqs,
  onAddInventory,
  onDeleteInventory,
  onSelectInventory,
  dict,
  isKa
}) => {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-text-primary m-0">
            {dict.inventoryDuties} ({inventoryReqs.length})
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            {isKa
              ? 'შოუს დროს ინვენტარის მომზადებასა და გადატანაზე პასუხისმგებელი მორიგეების წესები'
              : 'Crew duty requirements for equipment setup and handling during shows'}
          </p>
        </div>

        {inventoryReqs.length > 0 && (
          <button
            type="button"
            onClick={onAddInventory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>{dict.addInventory}</span>
          </button>
        )}
      </div>

      {inventoryReqs.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-xl border border-dashed border-border-medium flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-brand-primary">
            <Boxes size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-text-primary">
              {dict.noInventory}
            </h4>
            <p className="text-xs text-text-secondary mt-1 max-w-sm">
              {dict.dutyRulesExplanation}
            </p>
          </div>
          <button
            type="button"
            onClick={onAddInventory}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill text-xs font-semibold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>{dict.addInventory}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventoryReqs.map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectInventory?.(req)}
              className="bg-surface border border-border-subtle rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs hover:border-brand-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-brand-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <Boxes size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-brand-primary transition-colors truncate">
                    {req.itemName}
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {isKa ? 'ინვენტარი / რეკვიზიტი' : 'Equipment / Prop'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                <span className="px-3 py-1 rounded-pill bg-slate-100 dark:bg-surface-secondary border border-border-subtle text-xs font-semibold text-text-primary inline-flex items-center gap-1.5">
                  <Users size={12} />
                  <span>{isKa ? `${req.requiredHeadcount} მორიგე` : `${req.requiredHeadcount} crew`}</span>
                </span>

                <span
                  className={`px-3 py-1 rounded-pill text-xs font-semibold inline-flex items-center gap-1 border ${
                    req.assignedGender === 'Male Only'
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                      : req.assignedGender === 'Female Only'
                        ? 'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-300'
                        : 'bg-slate-100 dark:bg-surface-secondary border-border-subtle text-text-secondary'
                  }`}
                >
                  <User size={12} />
                  <span>
                    {req.assignedGender === 'Male Only'
                      ? (isKa ? 'მხოლოდ კაცები' : 'Male Only')
                      : req.assignedGender === 'Female Only'
                        ? (isKa ? 'მხოლოდ ქალები' : 'Female Only')
                        : (isKa ? 'ნებისმიერი სქესი' : 'Any Gender')}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteInventory(req.id, e);
                  }}
                  title={dict.delete}
                  className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer shrink-0 ml-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-3.5 px-4 rounded-xl bg-slate-50 dark:bg-surface-secondary border border-slate-200/80 dark:border-border-subtle text-xs text-text-secondary flex items-center gap-2 leading-relaxed">
        <Info size={15} className="shrink-0 text-brand-primary" />
        <span>{dict.dutyRulesExplanation}</span>
      </div>
    </div>
  );
};
