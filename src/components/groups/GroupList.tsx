'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Group } from '../../types/group';
import { GroupCard } from './GroupCard';
import { Plus, Users, Search, List, LayoutGrid, ChevronRight, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { getTalentAvatar } from '../../utils/avatarUtils';

const GroupFormModal = dynamic(
  () => import('./GroupFormModal').then((mod) => mod.GroupFormModal),
  { ssr: false }
);

export const GroupList: React.FC = () => {
  const router = useRouter();
  const { groups, talents, deleteGroup } = useApp();
  const { t, language } = useLanguage();
  const isKa = language === 'ka';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreate = () => {
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const filteredGroups = useMemo(() => {
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [groups, searchQuery]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-text-primary mb-1">
            {t('groups_title')}
          </h1>
          <p className="text-sm text-text-secondary">
            {t('groups_subtitle')}
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 text-sm font-medium rounded-pill px-5 py-2.5 bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('create_new_group')}</span>
        </button>
      </div>

      {/* Search and View Mode Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5 w-full sm:max-w-xs bg-surface-secondary border border-border-subtle rounded-pill px-4 py-2 transition-all duration-150 focus-within:bg-surface focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10">
          <Search size={16} className="text-text-secondary shrink-0" />
          <input
            type="text"
            placeholder={t('search_performers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary focus:ring-0 focus:outline-none"
          />
        </div>

        {/* Right: Counter and View Mode Toggle Pill (hidden on mobile) */}
        <div className="flex items-center gap-3.5">
          <div className="text-xs text-text-secondary">
            {t('showing')} <strong className="font-semibold text-text-primary">{filteredGroups.length}</strong> {t('of')} {groups.length}
          </div>

          <div className="hidden md:flex items-center bg-surface-secondary rounded-pill border border-border-subtle p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-semibold cursor-pointer transition-all duration-150 ${
                viewMode === 'list'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
              title={t('view_list')}
            >
              <List size={15} />
              <span>{t('view_list')}</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-semibold cursor-pointer transition-all duration-150 ${
                viewMode === 'grid'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
              title={t('view_grid')}
            >
              <LayoutGrid size={15} />
              <span>{t('view_grid')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content: Grid or List */}
      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-5 bg-surface-secondary rounded-lg border border-dashed border-border-medium text-text-secondary">
          <Users size={36} className="mb-3 opacity-40 text-text-secondary" />
          <h3 className="text-lg font-semibold text-text-primary mb-1.5">
            {t('no_groups_yet')}
          </h3>
          <p className="text-sm mb-4 max-w-md">
            {t('no_groups_desc')}
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium rounded-pill px-5 py-2.5 bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t('create_first_group')}</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              talents={talents}
              onSelect={(g) => router.push(`/groups/${g.id}`)}
              onEdit={handleEdit}
              onDelete={deleteGroup}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        /* LIST VIEW: Identical to Archive Table design with responsive scroll */
        <div className="rounded-xl bg-surface border border-border-subtle shadow-xs overflow-hidden flex flex-col w-full max-w-full">
          <div className="overflow-x-auto w-full max-w-full pb-2 overscroll-x-contain">
            <table className="min-w-[850px] w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-secondary/50 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                  <th className="py-3.5 px-5">{t('group_name_desc')}</th>
                  <th className="py-3.5 px-5">{t('members')}</th>
                  <th className="py-3.5 px-5">{isKa ? 'შემადგენლობა' : 'Composition'}</th>
                  <th className="py-3.5 px-5">{t('availability_status')}</th>
                  <th className="py-3.5 px-5 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-xs">
                {filteredGroups.map((group) => {
                  const groupMembers = talents.filter((m) => (group.memberTalentIds || []).includes(m.id));
                  const maleCount = groupMembers.filter((m) => m.gender === 'Male').length;
                  const femaleCount = groupMembers.filter((m) => m.gender === 'Female').length;
                  const nonActiveCount = groupMembers.filter((m) => m.status !== 'Active').length;

                  return (
                    <tr
                      key={group.id}
                      onClick={() => router.push(`/groups/${group.id}`)}
                      className="hover:bg-surface-secondary/40 transition-colors cursor-pointer group"
                    >
                      {/* Column 1: Group Name & Description */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <Users size={18} strokeWidth={2} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-sm text-text-primary block truncate group-hover:text-brand-primary transition-colors">
                              {group.name}
                            </span>
                            {group.description && (
                              <span className="text-xs text-text-secondary truncate block mt-0.5 max-w-[260px]">
                                {group.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Members Count & Avatars */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center">
                            {groupMembers.slice(0, 3).map((member) => (
                              <img
                                key={member.id}
                                src={getTalentAvatar(member)}
                                alt={member.firstName}
                                className="w-7 h-7 rounded-full object-cover border-2 border-surface -ml-2 first:ml-0 shadow-xs"
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-text-primary">
                            {groupMembers.length} {t('members')}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Gender Composition */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <span className="px-2 py-0.5 rounded-pill bg-surface-secondary border border-border-subtle inline-flex items-center gap-1">
                            <User size={11} className="text-tag-male-text" />
                            <span>{maleCount} {t('males')}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-pill bg-surface-secondary border border-border-subtle inline-flex items-center gap-1">
                            <User size={11} className="text-tag-female-text" />
                            <span>{femaleCount} {t('females')}</span>
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {nonActiveCount > 0 ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-md bg-status-sick-bg text-status-sick-text font-semibold inline-flex items-center gap-1">
                            <AlertCircle size={12} />
                            <span>{nonActiveCount} {t('unavailable')}</span>
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-0.5 rounded-md bg-status-active-bg text-status-active-text font-semibold inline-flex items-center gap-1">
                            <ShieldCheck size={12} />
                            <span>{t('all_active')}</span>
                          </span>
                        )}
                      </td>

                      {/* Column 5: Action */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-right">
                        <span className="text-xs font-semibold text-text-primary group-hover:text-brand-primary inline-flex items-center gap-1 transition-colors">
                          {t('manage_ensemble')}
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <GroupFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGroup(null);
        }}
        editingGroup={editingGroup}
      />
    </div>
  );
};
