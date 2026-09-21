import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Group } from '../../types/group';
import { GroupCard } from './GroupCard';
import { GroupFormModal } from './GroupFormModal';
import { GroupDetailModal } from './GroupDetailModal';
import { Plus, Users, Search, List, LayoutGrid } from 'lucide-react';

export const GroupList: React.FC = () => {
  const { groups, talents, deleteGroup } = useApp();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedGroupForDetail, setSelectedGroupForDetail] = useState<Group | null>(null);

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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>
            {t('groups_title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t('groups_subtitle')}
          </p>
        </div>

        <button onClick={handleCreate} className="btn btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('create_new_group')}</span>
        </button>
      </div>

      {/* Search and View Mode Toggle Bar */}
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
        <div className="search-pill-container" style={{ width: '100%', maxWidth: '340px' }}>
          <Search size={16} color="var(--color-text-secondary)" />
          <input
            type="text"
            placeholder={t('search_performers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-pill-input"
          />
        </div>

        {/* Right: Counter and View Mode Toggle Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
            {t('showing')} <strong>{filteredGroups.length}</strong> {t('of')} {groups.length}
          </div>

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

      {/* Content: Grid or List */}
      {filteredGroups.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-medium)',
            color: 'var(--color-text-secondary)'
          }}
        >
          <Users size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
            {t('no_groups_yet')}
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
            {t('no_groups_desc')}
          </p>
          <button onClick={handleCreate} className="btn btn-primary">
            <Plus size={16} strokeWidth={2.5} />
            <span>{t('create_first_group')}</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px'
          }}
        >
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              talents={talents}
              onSelect={(g) => setSelectedGroupForDetail(g)}
              onEdit={handleEdit}
              onDelete={deleteGroup}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: '880px', display: 'flex', flexDirection: 'column' }}>
            {/* Table Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(240px, 2fr) minmax(180px, 1.4fr) minmax(160px, 1.2fr) minmax(140px, 1.2fr) 140px',
                alignItems: 'center',
                gap: '16px',
                padding: '10px 20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text-secondary)',
                marginBottom: '6px'
              }}
            >
              <div>{t('group_name_desc')}</div>
              <div>{t('members')}</div>
              <div>{t('inventory_duty')}</div>
              <div>{t('availability_status')}</div>
              <div style={{ textAlign: 'right' }}>{t('actions')}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  talents={talents}
                  onSelect={(g) => setSelectedGroupForDetail(g)}
                  onEdit={handleEdit}
                  onDelete={deleteGroup}
                  viewMode="list"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Group Detail Drawer (Right-corner slide-over) */}
      <GroupDetailModal
        isOpen={!!selectedGroupForDetail}
        onClose={() => setSelectedGroupForDetail(null)}
        group={selectedGroupForDetail}
        talents={talents}
        onEdit={handleEdit}
        onDelete={deleteGroup}
      />

      {/* Create / Edit Drawer */}
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
