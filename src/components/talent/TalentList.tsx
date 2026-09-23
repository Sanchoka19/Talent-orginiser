'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Talent } from '../../types/talent';
import { TalentCard } from './TalentCard';
import { Search, Plus, Filter, List, LayoutGrid } from 'lucide-react';

const TalentDetailDrawer = dynamic(
  () => import('./TalentDetailDrawer').then((mod) => mod.TalentDetailDrawer),
  { ssr: false }
);

const TalentFormModal = dynamic(
  () => import('./TalentFormModal').then((mod) => mod.TalentFormModal),
  { ssr: false }
);

export const TalentList: React.FC = () => {
  const { talents, selectedTalent, setSelectedTalent } = useApp();
  const { t } = useLanguage();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTalent, setEditingTalent] = useState<Talent | null>(null);

  // Statistics calculation
  const totalTalents = talents.length;
  const activeCount = talents.filter((t) => t.status === 'Active').length;
  const restCount = talents.filter((t) => t.status === 'Rest').length;
  const sickCount = talents.filter((t) => t.status === 'Sick/Injured').length;

  const activePercent = totalTalents > 0 ? Math.round((activeCount / totalTalents) * 100) : 0;
  const restPercent = totalTalents > 0 ? Math.round((restCount / totalTalents) * 100) : 0;
  const sickPercent = totalTalents > 0 ? Math.round((sickCount / totalTalents) * 100) : 0;

  // Filtered talents
  const filteredTalents = useMemo(() => {
    return talents.filter((t) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.primarySkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesGender = genderFilter === 'ALL' || t.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [talents, searchQuery, statusFilter, genderFilter]);

  const handleOpenEdit = (talent: Talent) => {
    setEditingTalent(talent);
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingTalent(null);
    setIsFormOpen(true);
  };

  return (
    <div className="w-full">
      {/* Top Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-text-primary mb-1">
            {t('talent_title')}
          </h1>
          <p className="text-sm text-text-secondary">
            {t('talent_subtitle')}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 text-sm font-medium rounded-pill px-5 py-2.5 bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('add_performer')}</span>
        </button>
      </div>

      {/* 3 Compact Status KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        {/* Active Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Active' ? 'ALL' : 'Active')}
          className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-md cursor-pointer transition-all duration-150 ${
            statusFilter === 'Active'
              ? 'bg-status-active-bg/80 border-2 border-status-active-dot shadow-sm'
              : 'bg-surface border border-border-subtle shadow-sm hover:border-border-medium hover:shadow-md'
          }`}
          title={statusFilter === 'Active' ? t('status_all') : t('status_active_only')}
        >
          <div className="w-3 h-3 rounded-full bg-status-active-dot shadow-[0_0_8px_rgba(34,197,94,0.4)] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t('status_active')}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-text-primary leading-none">
                {activeCount}
              </span>
              <span className="text-xs text-status-active-text font-semibold">
                {activePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Rest Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Rest' ? 'ALL' : 'Rest')}
          className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-md cursor-pointer transition-all duration-150 ${
            statusFilter === 'Rest'
              ? 'bg-status-rest-bg/80 border-2 border-status-rest-dot shadow-sm'
              : 'bg-surface border border-border-subtle shadow-sm hover:border-border-medium hover:shadow-md'
          }`}
          title={statusFilter === 'Rest' ? t('status_all') : t('status_rest_only')}
        >
          <div className="w-3 h-3 rounded-full bg-status-rest-dot shadow-[0_0_8px_rgba(245,158,11,0.4)] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t('status_rest')}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-text-primary leading-none">
                {restCount}
              </span>
              <span className="text-xs text-text-secondary font-medium">
                {restPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Sick/Injured Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Sick/Injured' ? 'ALL' : 'Sick/Injured')}
          className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-md cursor-pointer transition-all duration-150 ${
            statusFilter === 'Sick/Injured'
              ? 'bg-status-sick-bg/80 border-2 border-status-sick-dot shadow-sm'
              : 'bg-surface border border-border-subtle shadow-sm hover:border-border-medium hover:shadow-md'
          }`}
          title={statusFilter === 'Sick/Injured' ? t('status_all') : t('status_sick_only')}
        >
          <div className="w-3 h-3 rounded-full bg-status-sick-dot shadow-[0_0_8px_rgba(239,68,68,0.4)] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t('status_sick')}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-text-primary leading-none">
                {sickCount}
              </span>
              <span className="text-xs text-status-sick-text font-semibold">
                {sickPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filters and View Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px] flex-wrap">
          {/* Pill Search */}
          <div className="flex items-center gap-2.5 w-full sm:max-w-xs bg-surface-secondary border border-border-subtle rounded-pill px-4 py-2 transition-all duration-150 focus-within:bg-surface focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10">
            <Search size={16} className="text-text-secondary shrink-0" />
            <input
              type="text"
              placeholder={t('search_talent_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary focus:ring-0 focus:outline-none"
            />
          </div>

          {/* Status Filter Pill */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3.5 py-2 rounded-pill border border-border-subtle bg-surface-secondary text-text-primary cursor-pointer outline-none focus:border-brand-primary focus:bg-surface transition-all duration-150"
          >
            <option value="ALL">{t('status_all')}</option>
            <option value="Active">{t('status_active_only')}</option>
            <option value="Rest">{t('status_rest_only')}</option>
            <option value="Sick/Injured">{t('status_sick_only')}</option>
          </select>

          {/* Gender Filter Pill */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs px-3.5 py-2 rounded-pill border border-border-subtle bg-surface-secondary text-text-primary cursor-pointer outline-none focus:border-brand-primary focus:bg-surface transition-all duration-150"
          >
            <option value="ALL">{t('gender_all')}</option>
            <option value="Female">{t('gender_female')}</option>
            <option value="Male">{t('gender_male')}</option>
          </select>
        </div>

        {/* Right: View Switcher (List / Grid) & Counter */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="text-xs text-text-secondary whitespace-nowrap">
            {t('showing')} <strong className="font-semibold text-text-primary">{filteredTalents.length}</strong> {t('of')} {totalTalents} {t('performers')}
          </div>

          {/* View Mode Toggle Pill */}
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

      {/* Talent Display Area: List or Grid */}
      {filteredTalents.length === 0 ? (
        <div className="text-center py-12 px-5 bg-surface-secondary rounded-md border border-dashed border-border-medium text-text-secondary flex flex-col items-center">
          <Filter size={32} className="mb-3 opacity-50" />
          <p className="font-medium text-sm">{t('no_performers_match')}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setGenderFilter('ALL');
            }}
            className="mt-3 inline-flex items-center px-4 py-2 rounded-pill text-xs font-semibold border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary hover:border-border-medium transition-all duration-150 cursor-pointer"
          >
            {t('clear_filters')}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTalents.map((talent) => (
            <TalentCard
              key={talent.id}
              talent={talent}
              viewMode="grid"
              isSelected={selectedTalent?.id === talent.id}
              onSelect={(t) => setSelectedTalent(t)}
            />
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="w-full overflow-x-auto pb-3">
          <div className="min-w-[920px] flex flex-col gap-2">
            {/* Table header row */}
            <div className="grid grid-cols-4 items-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-0.5">
              <div>{t('performer_name_specialty')}</div>
              <div>{t('gender_and_height')}</div>
              <div>{t('documents')}</div>
              <div className="text-right whitespace-nowrap">{t('availability_status')}</div>
            </div>

            {filteredTalents.map((talent) => (
              <TalentCard
                key={talent.id}
                talent={talent}
                viewMode="list"
                isSelected={selectedTalent?.id === talent.id}
                onSelect={(t) => setSelectedTalent(t)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Talent Detail Drawer */}
      <TalentDetailDrawer
        talent={selectedTalent}
        isOpen={Boolean(selectedTalent)}
        onClose={() => setSelectedTalent(null)}
        onEdit={handleOpenEdit}
      />

      {/* Add/Edit Modal */}
      <TalentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTalent(null);
        }}
        editingTalent={editingTalent}
      />
    </div>
  );
};
