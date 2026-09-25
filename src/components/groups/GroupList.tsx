'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Group } from '../../types/group';
import { GroupCard } from './GroupCard';
import { Plus, Users, Search, List, LayoutGrid } from 'lucide-react';

const GroupFormModal = dynamic(
  () => import('./GroupFormModal').then((mod) => mod.GroupFormModal),
  { ssr: false }
);

export const GroupList: React.FC = () => {
  const router = useRouter();
  const { groups, talents, deleteGroup } = useApp();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

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

        {/* Right: Counter and View Mode Toggle Pill */}
        <div className="flex items-center gap-3.5">
          <div className="text-xs text-text-secondary">
            {t('showing')} <strong className="font-semibold text-text-primary">{filteredGroups.length}</strong> {t('of')} {groups.length}
          </div>

          <div className="flex items-center bg-surface-secondary rounded-pill border border-border-subtle p-0.5 gap-0.5">
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
        /* LIST VIEW */
        <div className="w-full overflow-x-auto">
          <div className="min-w-[880px] flex flex-col">
            {/* Table Header Row */}
            <div className="grid grid-cols-[minmax(240px,2fr)_minmax(180px,1.4fr)_minmax(160px,1.2fr)_minmax(140px,1.2fr)_140px] items-center gap-4 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              <div>{t('group_name_desc')}</div>
              <div>{t('members')}</div>
              <div>{t('inventory_duty')}</div>
              <div>{t('availability_status')}</div>
              <div className="text-right">{t('actions')}</div>
            </div>

            <div className="flex flex-col gap-2">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  talents={talents}
                  onSelect={(g) => router.push(`/groups/${g.id}`)}
                  onEdit={handleEdit}
                  onDelete={deleteGroup}
                  viewMode="list"
                />
              ))}
            </div>
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
