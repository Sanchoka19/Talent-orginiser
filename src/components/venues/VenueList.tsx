import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { HotelVenue } from '../../types/venue';
import { VenueCard } from './VenueCard';
import { VenueFormModal } from './VenueFormModal';
import { VenueDetailModal } from './VenueDetailModal';
import { Plus, Building, Search, List, LayoutGrid } from 'lucide-react';

export const VenueList: React.FC = () => {
  const { venues, deleteVenue } = useApp();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<HotelVenue | null>(null);
  const [selectedVenueForDetail, setSelectedVenueForDetail] = useState<HotelVenue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = () => {
    setEditingVenue(null);
    setIsModalOpen(true);
  };

  const handleEdit = (venue: HotelVenue) => {
    setEditingVenue(venue);
    setIsModalOpen(true);
  };

  const filteredVenues = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>
            {t('venues_title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t('venues_subtitle')}
          </p>
        </div>

        <button onClick={handleCreate} className="btn btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('add_hotel_venue')}</span>
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
            placeholder={t('search_venues_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-pill-input"
          />
        </div>

        {/* Right: Counter and View Mode Toggle Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
            {t('showing')} <strong>{filteredVenues.length}</strong> {t('of')} {venues.length}
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

      {/* Venues Content (Grid or List) */}
      {filteredVenues.length === 0 ? (
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
          <Building size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
            {t('no_venues_found')}
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
            {t('no_venues_desc')}
          </p>
          <button onClick={handleCreate} className="btn btn-primary">
            <Plus size={16} strokeWidth={2.5} />
            <span>{t('add_first_hotel')}</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
            gap: '20px'
          }}
        >
          {filteredVenues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onSelect={(v) => setSelectedVenueForDetail(v)}
              onEdit={handleEdit}
              onDelete={deleteVenue}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: '920px', display: 'flex', flexDirection: 'column' }}>
            {/* Table Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(240px, 2fr) minmax(200px, 1.8fr) minmax(180px, 1.5fr) minmax(180px, 1.4fr) 140px',
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
              <div>{t('venue_name')}</div>
              <div>{t('location')}</div>
              <div>{t('contact_person')}</div>
              <div>{t('status')}</div>
              <div style={{ textAlign: 'right' }}>{t('actions')}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onSelect={(v) => setSelectedVenueForDetail(v)}
                  onEdit={handleEdit}
                  onDelete={deleteVenue}
                  viewMode="list"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Venue Detail Modal */}
      <VenueDetailModal
        isOpen={!!selectedVenueForDetail}
        onClose={() => setSelectedVenueForDetail(null)}
        venue={selectedVenueForDetail}
        onEdit={handleEdit}
        onDelete={deleteVenue}
      />

      {/* Create / Edit Modal */}
      <VenueFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVenue(null);
        }}
        editingVenue={editingVenue}
      />
    </div>
  );
};
