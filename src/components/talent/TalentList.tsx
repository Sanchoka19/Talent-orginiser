'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Talent } from '../../types/talent';
import { TalentCard } from './TalentCard';
import { StatCard } from '../common/StatCard';
import { Search, Plus, Filter, List, LayoutGrid, Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

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
  const { t, language } = useLanguage();
  const isKa = language === 'ka';

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
          className="inline-flex items-center justify-center gap-2 text-sm font-medium rounded-md px-4 py-2 bg-brand-primary text-white shadow-xs hover:bg-brand-primary-hover transition-all duration-150 cursor-pointer outline-none whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('add_performer')}</span>
        </button>
      </div>

      {/* 4 Unified KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* 1. Total Talents */}
        <StatCard
          title={isKa ? 'სულ ტალანტები' : 'Total Talents'}
          value={totalTalents}
          icon={<Users size={18} strokeWidth={2.2} />}
          iconBgColor="bg-brand-primary/10 text-brand-primary"
          isActive={statusFilter === 'ALL'}
          activeBorderColor="border-brand-primary ring-2 ring-brand-primary/20"
          onClick={() => setStatusFilter('ALL')}
          titleTooltip={t('status_all')}
        />

        {/* 2. Active Talents */}
        <StatCard
          title={t('status_active')}
          value={activeCount}
          subtitle={`${activePercent}%`}
          subtitleColor="text-emerald-600 dark:text-emerald-400 font-semibold"
          icon={<CheckCircle2 size={18} strokeWidth={2.2} />}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          isActive={statusFilter === 'Active'}
          activeBorderColor="border-emerald-500 ring-2 ring-emerald-500/20"
          onClick={() => setStatusFilter(statusFilter === 'Active' ? 'ALL' : 'Active')}
          titleTooltip={statusFilter === 'Active' ? t('status_all') : t('status_active_only')}
        />

        {/* 3. Rest Talents */}
        <StatCard
          title={t('status_rest')}
          value={restCount}
          subtitle={`${restPercent}%`}
          subtitleColor="text-amber-600 dark:text-amber-400 font-semibold"
          icon={<Clock size={18} strokeWidth={2.2} />}
          iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          isActive={statusFilter === 'Rest'}
          activeBorderColor="border-amber-500 ring-2 ring-amber-500/20"
          onClick={() => setStatusFilter(statusFilter === 'Rest' ? 'ALL' : 'Rest')}
          titleTooltip={statusFilter === 'Rest' ? t('status_all') : t('status_rest_only')}
        />

        {/* 4. Sick / Injured Talents */}
        <StatCard
          title={isKa ? 'ავად / ტრავმა' : t('status_sick')}
          value={sickCount}
          subtitle={`${sickPercent}%`}
          subtitleColor="text-rose-600 dark:text-rose-400 font-semibold"
          icon={<AlertTriangle size={18} strokeWidth={2.2} />}
          iconBgColor="bg-rose-500/10 text-rose-600 dark:text-rose-400"
          isActive={statusFilter === 'Sick/Injured'}
          activeBorderColor="border-rose-500 ring-2 ring-rose-500/20"
          onClick={() => setStatusFilter(statusFilter === 'Sick/Injured' ? 'ALL' : 'Sick/Injured')}
          titleTooltip={statusFilter === 'Sick/Injured' ? t('status_all') : t('status_sick_only')}
        />
      </div>

      {/* Search, Filters and View Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px] flex-wrap">
          {/* Search Box */}
          <div className="flex items-center gap-2.5 w-full sm:max-w-xs bg-surface-secondary border border-border-subtle rounded-md px-3.5 py-1.5 transition-all duration-150 focus-within:bg-surface focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/20">
            <Search size={15} className="text-text-secondary shrink-0" />
            <input
              type="text"
              placeholder={t('search_talent_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:ring-0 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-md border border-border-subtle bg-surface-secondary text-text-primary cursor-pointer outline-none focus:border-brand-primary focus:bg-surface transition-all duration-150 font-medium"
          >
            <option value="ALL">{t('status_all')}</option>
            <option value="Active">{t('status_active_only')}</option>
            <option value="Rest">{t('status_rest_only')}</option>
            <option value="Sick/Injured">{t('status_sick_only')}</option>
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-md border border-border-subtle bg-surface-secondary text-text-primary cursor-pointer outline-none focus:border-brand-primary focus:bg-surface transition-all duration-150 font-medium"
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

          {/* View Mode Toggle */}
          <div className="flex items-center bg-surface-secondary rounded-md border border-border-subtle p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition-all duration-150 ${viewMode === 'list'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              title={t('view_list')}
            >
              <List size={14} />
              <span>{t('view_list')}</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition-all duration-150 ${viewMode === 'grid'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              title={t('view_grid')}
            >
              <LayoutGrid size={14} />
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
            className="mt-3 inline-flex items-center px-3.5 py-1.5 rounded-md text-xs font-semibold border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary hover:border-border-medium transition-all duration-150 cursor-pointer shadow-xs"
          >
            {t('clear_filters')}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
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
