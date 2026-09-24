'use client';

import React from 'react';
import { Group } from '../../types/group';
import { Talent } from '../../types/talent';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { Users, ChevronRight, User, ShieldCheck, AlertCircle } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  talents: Talent[];
  onSelect?: (group: Group) => void;
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
  viewMode?: 'grid' | 'list';
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  talents,
  onSelect,
  onEdit,
  viewMode = 'grid'
}) => {
  const { t } = useLanguage();

  // Compute group member stats
  const members = talents.filter((tItem) => group.memberTalentIds.includes(tItem.id));
  const maleCount = members.filter((tItem) => tItem.gender === 'Male').length;
  const femaleCount = members.filter((tItem) => tItem.gender === 'Female').length;
  const activeCount = members.filter((tItem) => tItem.status === 'Active').length;
  const nonActiveCount = members.length - activeCount;

  const handleClick = () => {
    if (onSelect) {
      onSelect(group);
    } else {
      onEdit(group);
    }
  };

  // LIST VIEW ROW
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="group relative bg-surface rounded-md border border-border-subtle px-5 py-3.5 shadow-sm grid grid-cols-[minmax(240px,2fr)_minmax(180px,1.4fr)_minmax(160px,1.2fr)_minmax(140px,1.2fr)_140px] items-center gap-4 cursor-pointer transition-all duration-150 hover:border-border-medium hover:shadow-md hover:-translate-y-0.5"
      >
        {/* Col 1: Group Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-sm bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Users size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-bold text-text-primary m-0 truncate group-hover:text-brand-primary transition-colors duration-150">
                {group.name}
              </h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                {t('season_tag')}
              </span>
            </div>
          </div>
        </div>

        {/* Col 2: Avatars & Performers Count */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center">
            {members.slice(0, 3).map((member, idx) => (
              <img
                key={member.id}
                src={
                  member.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}${member.lastName}`
                }
                alt={member.firstName}
                className="w-7 h-7 rounded-full object-cover border-2 border-white -ml-2 first:ml-0 shadow-sm"
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-text-primary">
            {members.length} {t('members')}
          </span>
        </div>

        {/* Col 3: Gender breakdown */}
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="px-2 py-0.5 rounded-pill bg-surface-secondary border border-border-subtle inline-flex items-center gap-1">
            <User size={11} className="text-blue-600" />
            <span>
              {maleCount} {t('males')}
            </span>
          </span>
          <span className="px-2 py-0.5 rounded-pill bg-surface-secondary border border-border-subtle inline-flex items-center gap-1">
            <User size={11} className="text-pink-600" />
            <span>
              {femaleCount} {t('females')}
            </span>
          </span>
        </div>

        {/* Col 4: Status */}
        <div className="flex items-center gap-1.5">
          {nonActiveCount > 0 ? (
            <span className="text-xs px-2 py-0.5 rounded-pill bg-status-sick-bg text-status-sick-text font-semibold inline-flex items-center gap-1">
              <AlertCircle size={12} />
              <span>
                {nonActiveCount} {t('unavailable')}
              </span>
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-pill bg-status-active-bg text-status-active-text font-semibold inline-flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>{t('all_active')}</span>
            </span>
          )}
        </div>

        {/* Col 5: Manage ensemble link */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs font-semibold text-text-primary group-hover:text-brand-primary flex items-center gap-0.5 transition-colors duration-150">
            {t('manage_ensemble')}
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          </span>
        </div>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div
      onClick={handleClick}
      className="group relative bg-surface rounded-md border border-border-subtle p-6 shadow-sm flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border-medium"
    >
      <div>
        {/* Top Row: Title + Location & Mint-Green Users Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <h3 className="text-base font-bold text-text-primary m-0 tracking-tight leading-snug group-hover:text-brand-primary transition-colors duration-150 truncate">
                {group.name}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                {t('season_tag')}
              </span>
            </div>
          </div>

          {/* Mint-Green Icon Badge */}
          <div
            className="w-9 h-9 rounded-sm bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"
            title={t('group_members')}
          >
            <Users size={18} strokeWidth={2} />
          </div>
        </div>

        {/* Middle Row: Stacked Round Performer Avatars */}
        <div className="flex items-center my-5">
          {members.slice(0, 5).map((member) => (
            <img
              key={member.id}
              src={
                member.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}${member.lastName}`
              }
              alt={member.firstName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white -ml-2.5 first:ml-0 shadow-sm shrink-0"
              title={`${member.firstName} ${member.lastName} (${member.status})`}
            />
          ))}
          {members.length > 5 && (
            <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold -ml-2.5 border-2 border-white shadow-sm shrink-0">
              +{members.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        {/* Thin Divider Line */}
        <div className="border-t border-border-subtle mb-3.5" />

        {/* Bottom Row: Performer Count & Manage ensemble Button */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-text-secondary font-medium">
            {members.length === 1 ? '1 performer' : `${members.length} performers`}
          </div>

          <div className="text-xs font-semibold text-text-primary group-hover:text-brand-primary flex items-center gap-1 transition-colors duration-150">
            <span>{t('manage_ensemble')}</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          </div>
        </div>
      </div>
    </div>
  );
};
