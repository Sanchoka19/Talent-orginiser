'use client';

import React from 'react';
import { InventoryRequirement, TaskRotationCycle } from '../../../types/inventory';
import { Talent } from '../../../types/talent';
import {
  Sparkles,
  Plus,
  Users,
  MapPin,
  Clock,
  Trash2,
  Info
} from 'lucide-react';

interface GroupTasksTabProps {
  specialTasks: InventoryRequirement[];
  talents: Talent[];
  onAddTask: () => void;
  onDeleteTask: (taskId: string, parentTaskId?: string, e?: React.MouseEvent) => void;
  getCycleLabel: (cycle?: TaskRotationCycle) => string;
  dict: any;
  isKa: boolean;
}

export const GroupTasksTab: React.FC<GroupTasksTabProps> = ({
  specialTasks,
  talents,
  onAddTask,
  onDeleteTask,
  getCycleLabel,
  dict,
  isKa
}) => {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-text-primary m-0">
            {dict.specialTasks} ({specialTasks.length})
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            {isKa
              ? 'შოუს დროს არტისტებზე განაწილებული ინდივიდუალური მოვალეობები და პოზიციები'
              : 'Custom duties, stage positions, and assigned performers for shows'}
          </p>
        </div>

        {specialTasks.length > 0 && (
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>{dict.assignTask}</span>
          </button>
        )}
      </div>

      {specialTasks.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-xl border border-dashed border-border-medium flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-text-primary">
              {dict.noTasksTitle}
            </h4>
            <p className="text-xs text-text-secondary mt-1 max-w-sm">
              {dict.noTasksDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill text-xs font-semibold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>{dict.assignTask}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specialTasks.map((task) => {
            const assignedIds = task.assignedTalentIds && task.assignedTalentIds.length > 0
              ? task.assignedTalentIds
              : task.assignedTalentId
              ? [task.assignedTalentId]
              : [];
            const assignedMembers = talents.filter((tItem) => assignedIds.includes(tItem.id));
            const singleMember = assignedMembers.length === 1 ? assignedMembers[0] : null;

            return (
              <div
                key={task.id}
                className="bg-surface border border-border-subtle rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-border-medium transition-all"
              >
                {/* Top: Task Name and Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                      <Sparkles size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-text-primary truncate">
                        {task.itemName}
                      </h4>

                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {task.position && (
                          <span className="inline-flex items-center gap-1 text-[0.725rem] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-secondary border border-border-subtle text-text-secondary">
                            <MapPin size={11} className="text-text-primary" />
                            <span>{task.position}</span>
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[0.725rem] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-secondary border border-border-subtle text-text-secondary">
                          <Clock size={11} className="text-text-primary" />
                          <span>{getCycleLabel(task.rotationCycle)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => onDeleteTask(task.id, task.parentTaskId, e)}
                    title={dict.delete}
                    className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Bottom: Assigned Performer */}
                <div className="pt-3 border-t border-slate-100 dark:border-border-subtle flex items-center justify-between gap-3">
                  <span className="text-xs text-text-secondary font-medium">
                    {dict.assignedTo}:
                  </span>

                  {singleMember ? (
                    <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-surface-secondary px-3 py-1.5 rounded-lg border border-border-subtle">
                      <img
                        src={
                          singleMember.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${singleMember.firstName}${singleMember.lastName}`
                        }
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
                        {assignedMembers.slice(0, 3).map((m) => (
                          <img
                            key={m.id}
                            src={
                              m.avatarUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.firstName}${m.lastName}`
                            }
                            alt={m.firstName}
                            className="inline-block w-6 h-6 rounded-full ring-2 ring-surface object-cover shrink-0"
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-text-primary">
                        {isKa ? `პული (${assignedMembers.length})` : `Pool (${assignedMembers.length})`}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-slate-100 dark:bg-surface-secondary border border-border-subtle text-xs text-text-secondary font-medium">
                      <Users size={12} />
                      <span>{isKa ? 'ავტო-როტაცია (ყველა)' : dict.notAssigned}</span>
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
        <span>{dict.tasksExplanation}</span>
      </div>
    </div>
  );
};
