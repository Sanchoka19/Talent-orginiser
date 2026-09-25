'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Talent } from '../../../types/talent';
import { Group } from '../../../types/group';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  User,
  Sparkles,
  Trash2
} from 'lucide-react';

import { useLanguage } from '../../../context/LanguageContext';

interface GroupRosterTabProps {
  members: Talent[];
  currentGroup: Group;
  onAssignTask: (performerId: string) => void;
  onRemoveMember: (talentId: string) => void;
  dict: any;
  isKa: boolean;
}

export const GroupRosterTab: React.FC<GroupRosterTabProps> = ({
  members,
  onAssignTask,
  onRemoveMember,
  dict,
  isKa
}) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [openMemberMenuId, setOpenMemberMenuId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-text-primary m-0">
            {dict.ensembleRoster}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('performers_count', { count: members.length })}
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-xl border border-dashed border-border-medium text-text-secondary text-sm">
          <Users size={36} className="mx-auto mb-2 opacity-30 text-text-secondary" />
          <p>{dict.noMembers}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => {
            const isActive = member.status === 'Active';
            return (
              <div
                key={member.id}
                className="bg-surface border border-border-subtle rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs hover:border-border-medium hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={
                      member.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}${member.lastName}`
                    }
                    alt={member.firstName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-border-subtle shrink-0 shadow-xs"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-text-primary truncate">
                      {member.firstName} {member.lastName}
                    </h4>
                    <p className="text-xs text-brand-primary font-medium truncate mt-0.5">
                      {member.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')}
                    </p>
                    <div className="text-xs text-text-secondary flex items-center gap-1.5 flex-wrap mt-1">
                      <span>{member.gender === 'Male' ? (isKa ? 'კაცი' : 'Male') : (isKa ? 'ქალი' : 'Female')}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 relative">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-pill inline-flex items-center gap-1.5 border shadow-2xs ${
                      isActive
                        ? 'bg-status-active-bg text-status-active-text border-emerald-500/25'
                        : 'bg-status-sick-bg text-status-sick-text border-rose-500/25'
                    }`}
                  >
                    {isActive ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                    <span>{member.status}</span>
                  </span>

                  {/* 3-dots Menu Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMemberMenuId(openMemberMenuId === member.id ? null : member.id)}
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-secondary border border-transparent hover:border-border-subtle transition-all cursor-pointer"
                      title={isKa ? 'მოქმედებები' : 'Actions'}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMemberMenuId === member.id && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setOpenMemberMenuId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border-subtle rounded-xl shadow-lg z-40 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMemberMenuId(null);
                              router.push(`/talents/${member.id}`);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-text-primary hover:bg-slate-50 dark:hover:bg-surface-secondary transition-colors cursor-pointer text-left"
                          >
                            <User size={14} className="text-text-secondary shrink-0" />
                            <span>{isKa ? 'პროფილის ნახვა' : 'View Profile'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMemberMenuId(null);
                              onAssignTask(member.id);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-text-primary hover:bg-slate-50 dark:hover:bg-surface-secondary transition-colors cursor-pointer text-left"
                          >
                            <Sparkles size={14} className="text-purple-600 dark:text-purple-400 shrink-0" />
                            <span>{isKa ? 'დავალების გაცემა' : 'Assign Task'}</span>
                          </button>

                          <div className="my-1 border-t border-border-subtle" />

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMemberMenuId(null);
                              onRemoveMember(member.id);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger/8 transition-colors cursor-pointer text-left"
                          >
                            <Trash2 size={14} className="shrink-0" />
                            <span>{isKa ? 'დასიდან ამოშლა' : 'Remove from Group'}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
