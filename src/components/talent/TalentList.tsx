import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Talent } from '../../types/talent';
import { TalentCard } from './TalentCard';
import { TalentDetailDrawer } from './TalentDetailDrawer';
import { TalentFormModal } from './TalentFormModal';
import { SplitProgressBar } from '../common/ProgressBar';
import { Search, Plus, Filter, List, LayoutGrid } from 'lucide-react';

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
    <div>
      {/* Top Title & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>
            {t('talent_title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t('talent_subtitle')}
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('add_performer')}</span>
        </button>
      </div>

      {/* 3 Compact Status KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}
      >
        {/* Active Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Active' ? 'ALL' : 'Active')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: statusFilter === 'Active' ? 'rgba(21, 128, 61, 0.08)' : 'var(--bg-surface)',
            border: statusFilter === 'Active' ? '1.5px solid #16A34A' : '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          title={statusFilter === 'Active' ? t('status_all') : t('status_active_only')}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#16A34A',
              boxShadow: '0 0 8px rgba(22, 163, 74, 0.4)',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('status_active')}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-charcoal)', lineHeight: 1 }}>
                {activeCount}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>
                {activePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Rest Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Rest' ? 'ALL' : 'Rest')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: statusFilter === 'Rest' ? 'rgba(234, 179, 8, 0.1)' : 'var(--bg-surface)',
            border: statusFilter === 'Rest' ? '1.5px solid #EAB308' : '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          title={statusFilter === 'Rest' ? t('status_all') : t('status_rest_only')}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#EAB308',
              boxShadow: '0 0 8px rgba(234, 179, 8, 0.4)',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('status_rest')}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-charcoal)', lineHeight: 1 }}>
                {restCount}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {restPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Sick/Injured Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Sick/Injured' ? 'ALL' : 'Sick/Injured')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: statusFilter === 'Sick/Injured' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)',
            border: statusFilter === 'Sick/Injured' ? '1.5px solid #EF4444' : '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          title={statusFilter === 'Sick/Injured' ? t('status_all') : t('status_sick_only')}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#EF4444',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('status_sick')}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-charcoal)', lineHeight: 1 }}>
                {sickCount}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 600 }}>
                {sickPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filters and View Toggle Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          {/* Pill Search */}
          <div className="search-pill-container" style={{ width: '100%', maxWidth: '340px' }}>
            <Search size={16} color="var(--color-text-secondary)" />
            <input
              type="text"
              placeholder={t('search_talent_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-pill-input"
            />
          </div>

          {/* Status Filter Pill */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.825rem',
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
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
            style={{
              fontFamily: 'inherit',
              fontSize: '0.825rem',
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ALL">{t('gender_all')}</option>
            <option value="Female">{t('gender_female')}</option>
            <option value="Male">{t('gender_male')}</option>
          </select>
        </div>

        {/* Right: View Switcher (List / Grid) & Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            {t('showing')} <strong>{filteredTalents.length}</strong> {t('of')} {totalTalents} {t('performers')}
          </div>

          {/* View Mode Toggle Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              padding: '3px',
              gap: '2px'
            }}
          >
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'list' ? 'var(--brand-primary)' : 'transparent',
                color: viewMode === 'list' ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'list' ? '0 2px 8px var(--brand-primary-glow)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
              title={t('view_list')}
            >
              <List size={15} />
              <span>{t('view_list')}</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'grid' ? 'var(--brand-primary)' : 'transparent',
                color: viewMode === 'grid' ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'grid' ? '0 2px 8px var(--brand-primary-glow)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
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
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-medium)',
            color: 'var(--color-text-secondary)'
          }}
        >
          <Filter size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ fontWeight: 500 }}>{t('no_performers_match')}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setGenderFilter('ALL');
            }}
            className="btn btn-secondary"
            style={{ marginTop: '12px' }}
          >
            {t('clear_filters')}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px'
          }}
        >
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
        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '12px'
          }}
        >
          <div
            style={{
              minWidth: '920px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {/* Table header row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                alignItems: 'center',
                padding: '10px 20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text-secondary)',
                marginBottom: '2px'
              }}
            >
              <div>{t('performer_name_specialty')}</div>
              <div>{t('gender_and_height')}</div>
              <div>{t('documents')}</div>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{t('availability_status')}</div>
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
