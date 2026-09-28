'use client';

import React from 'react';
import { InventoryRequirement, TaskRotationCycle } from '../../../types/inventory';
import { Talent } from '../../../types/talent';
import {
  Boxes,
  Plus,
  Users,
  User,
  Trash2,
  Info,
  Clock,
} from 'lucide-react';
import { getTalentAvatar } from '../../../utils/avatarUtils';

interface GroupInventoryTabProps {
  inventoryReqs: InventoryRequirement[];
  talents: Talent[];
  members: Talent[];
  onAddInventory: () => void;
  onDeleteInventory: (reqId: string, e: React.MouseEvent) => void;
  onSelectInventory?: (req: InventoryRequirement) => void;
  getCycleLabel?: (cycle?: TaskRotationCycle, customVal?: number, customUnit?: any) => string;
  dict: any;
  isKa: boolean;
}

export const GroupInventoryTab: React.FC<GroupInventoryTabProps> = ({
  inventoryReqs,
  talents,
  members,
  onAddInventory,
  onDeleteInventory,
  onSelectInventory,
  getCycleLabel,
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
          {inventoryReqs.map((req) => {
            // Resolve assigned talents
            const assignedIds = req.assignedTalentIds && req.assignedTalentIds.length > 0
              ? req.assignedTalentIds
              : req.assignedTalentId
              ? [req.assignedTalentId]
              : [];
            const assignedMembers = talents.filter((t) => assignedIds.includes(t.id));
            const singleMember = assignedMembers.length === 1 ? assignedMembers[0] : null;

            return (
              <div
                key={req.id}
                onClick={() => onSelectInventory?.(req)}
                className="bg-surface border border-border-subtle rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-brand-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                {/* Top: Item Name, Icon, Badges, Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-200">
                      <Boxes size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-brand-primary transition-colors truncate">
                        {req.itemName}
                      </h4>

                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {/* Rotation cycle badge */}
                        {getCycleLabel && (
                          <span className="inline-flex items-center gap-1 text-[0.725rem] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-secondary border border-border-subtle text-text-secondary">
                            <Clock size={11} className="text-text-primary" />
                            <span>{getCycleLabel(req.rotationCycle, req.customRotationValue, req.customRotationUnit)}</span>
                          </span>
                        )}

                        {/* Headcount badge */}
                        <span className="inline-flex items-center gap-1 text-[0.725rem] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-secondary border border-border-subtle text-text-secondary">
                          <Users size={11} className="text-text-primary" />
                          <span>{isKa ? `${req.requiredHeadcount} მორიგე` : `${req.requiredHeadcount} crew`}</span>
                        </span>

                        {/* Gender badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[0.725rem] font-medium px-2 py-0.5 rounded-md border ${
                            req.assignedGender === 'Male Only'
                              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                              : req.assignedGender === 'Female Only'
                                ? 'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-300'
                                : 'bg-slate-100 dark:bg-surface-secondary border-border-subtle text-text-secondary'
                          }`}
                        >
                          <User size={11} />
                          <span>
                            {req.assignedGender === 'Male Only'
                              ? (isKa ? 'მხოლოდ კაცები' : 'Male Only')
                              : req.assignedGender === 'Female Only'
                                ? (isKa ? 'მხოლოდ ქალები' : 'Female Only')
                                : (isKa ? 'ნებისმიერი სქესი' : 'Any Gender')}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteInventory(req.id, e);
                    }}
                    title={dict.delete}
                    className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Bottom: Assigned Performer / Crew */}
                <div className="pt-3 border-t border-slate-100 dark:border-border-subtle flex items-center justify-between gap-3">
                  <span className="text-xs text-text-secondary font-medium">
                    {isKa ? 'შემსრულებელი:' : 'Assigned to:'}
                  </span>

                  {singleMember ? (
                    <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-surface-secondary px-3 py-1.5 rounded-lg border border-border-subtle">
                      <img
                        src={getTalentAvatar(singleMember)}
                        alt={singleMember.firstName}
                        className="w-7 h-7 rounded-full object-cover border border-border-subtle shrink-0"
                      />
                      <div className="text-left min-w-0">
                        <div className="text-xs font-semibold text-text-primary leading-tight truncate">
                          {singleMember.firstName} {singleMember.lastName}
                        </div>
                        <div className="text-[0.675rem] text-text-secondary leading-tight mt-0.5 truncate">
                          {singleMember.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')}
                        </div>
                      </div>
                    </div>
                  ) : assignedMembers.length > 1 ? (
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-surface-secondary px-2.5 py-1.5 rounded-lg border border-border-subtle">
                      <div className="flex -space-x-2 overflow-hidden">
                        {assignedMembers.slice(0, 4).map((m) => (
                          <img
                            key={m.id}
                            src={getTalentAvatar(m)}
                            alt={m.firstName}
                            className="inline-block w-6 h-6 rounded-full ring-2 ring-surface object-cover shrink-0"
                          />
                        ))}
                        {assignedMembers.length > 4 && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-surface bg-slate-200 dark:bg-surface-secondary text-[0.6rem] font-bold text-text-secondary shrink-0">
                            +{assignedMembers.length - 4}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-text-primary">
                        {isKa ? `მორიგე (${assignedMembers.length})` : `${assignedMembers.length} მორიგე`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-surface-secondary px-2.5 py-1.5 rounded-lg border border-border-subtle">
                      <div className="flex -space-x-2 overflow-hidden">
                        {members.slice(0, 3).map((m) => (
                          <img
                            key={m.id}
                            src={getTalentAvatar(m)}
                            alt={m.firstName}
                            className="inline-block w-6 h-6 rounded-full ring-2 ring-surface object-cover shrink-0"
                          />
                        ))}
                        {members.length > 3 && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-surface bg-slate-200 dark:bg-surface-secondary text-[0.6rem] font-bold text-text-secondary shrink-0">
                            +{members.length - 3}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-text-secondary">
                        {isKa ? 'ყველა' : 'All'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-3.5 px-4 rounded-xl bg-slate-50 dark:bg-surface-secondary border border-slate-200/80 dark:border-border-subtle text-xs text-text-secondary flex items-center gap-2 leading-relaxed">
        <Info size={15} className="shrink-0 text-brand-primary" />
        <span>{dict.dutyRulesExplanation}</span>
      </div>
    </div>
  );
};
