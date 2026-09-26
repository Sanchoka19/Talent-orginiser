'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { HotelVenue } from '../../types/venue';
import { VenueCard } from './VenueCard';
import { Plus, Building, Search, List, LayoutGrid, MapPin, User, Calendar, ChevronRight, Phone } from 'lucide-react';

const VenueFormModal = dynamic(
  () => import('./VenueFormModal').then((mod) => mod.VenueFormModal),
  { ssr: false }
);

const VenueDetailModal = dynamic(
  () => import('./VenueDetailModal').then((mod) => mod.VenueDetailModal),
  { ssr: false }
);

export const VenueList: React.FC = () => {
  const { venues, deleteVenue, schedule } = useApp();
  const { t, language } = useLanguage();
  const isKa = language === 'ka';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<HotelVenue | null>(null);
  const [selectedVenueForDetail, setSelectedVenueForDetail] = useState<HotelVenue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-text-primary mb-1">
            {t('venues_title')}
          </h1>
          <p className="text-sm text-text-secondary">
            {t('venues_subtitle')}
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 text-sm font-medium rounded-pill px-5 py-2.5 bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('add_hotel_venue')}</span>
        </button>
      </div>

      {/* Search and View Mode Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5 w-full sm:max-w-xs bg-surface-secondary border border-border-subtle rounded-pill px-4 py-2 transition-all duration-150 focus-within:bg-surface focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10">
          <Search size={16} className="text-text-secondary shrink-0" />
          <input
            type="text"
            placeholder={t('search_venues_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary focus:ring-0 focus:outline-none"
          />
        </div>

        {/* Right: Counter and View Mode Toggle Pill (hidden on mobile) */}
        <div className="flex items-center gap-3.5">
          <div className="text-xs text-text-secondary">
            {t('showing')} <strong className="font-semibold text-text-primary">{filteredVenues.length}</strong> {t('of')} {venues.length}
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

      {/* Venues Content (Grid or List) */}
      {filteredVenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-5 bg-surface-secondary rounded-lg border border-dashed border-border-medium text-text-secondary">
          <Building size={36} className="mb-3 opacity-40 text-text-secondary" />
          <h3 className="text-lg font-semibold text-text-primary mb-1.5">
            {t('no_venues_found')}
          </h3>
          <p className="text-sm mb-4 max-w-md">
            {t('no_venues_desc')}
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium rounded-pill px-5 py-2.5 bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t('add_first_hotel')}</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
        /* LIST VIEW: Identical to Archive Table design with responsive scroll */
        <div className="rounded-xl bg-surface border border-border-subtle shadow-xs overflow-hidden flex flex-col w-full max-w-full">
          <div className="overflow-x-auto w-full max-w-full pb-2 overscroll-x-contain">
            <table className="min-w-[850px] w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-secondary/50 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                  <th className="py-3.5 px-5">{t('venue_name')}</th>
                  <th className="py-3.5 px-5">{t('location')}</th>
                  <th className="py-3.5 px-5">{t('contact_person')}</th>
                  <th className="py-3.5 px-5">{t('status')}</th>
                  <th className="py-3.5 px-5 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-xs">
                {filteredVenues.map((venue) => {
                  const scheduledShows = (schedule || []).filter(
                    (e) => e.hotelId === venue.id && e.status !== 'Cancelled'
                  );

                  return (
                    <tr
                      key={venue.id}
                      onClick={() => setSelectedVenueForDetail(venue)}
                      className="hover:bg-surface-secondary/40 transition-colors cursor-pointer group"
                    >
                      {/* Column 1: Venue Name */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-sm bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                            <Building size={18} strokeWidth={2} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-sm text-text-primary block truncate group-hover:text-brand-primary transition-colors">
                              {venue.name}
                            </span>
                            {venue.roomOrBallroom && (
                              <span className="text-xs text-text-secondary truncate block mt-0.5">
                                {venue.roomOrBallroom}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Location */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary" title={`${venue.address}, ${venue.city}`}>
                          <MapPin size={14} className="shrink-0 text-text-tertiary" />
                          <span className="truncate max-w-[220px]">
                            {venue.address}, {venue.city}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Contact Person */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-medium text-text-primary flex items-center gap-1.5">
                            <User size={12} className="shrink-0 text-text-tertiary" />
                            <span>{venue.contactName || t('none')}</span>
                          </span>
                          {venue.contactPhone && (
                            <span className="text-text-tertiary text-[11px] flex items-center gap-1.5">
                              <Phone size={11} className="shrink-0" />
                              <span>{venue.contactPhone}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-md font-medium border ${
                              scheduledShows.length > 0
                                ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                                : 'bg-surface-secondary text-text-secondary border-border-subtle'
                            }`}
                          >
                            {scheduledShows.length > 0 ? t('active_venue') : t('available_venue')}
                          </span>
                          {scheduledShows.length > 0 && (
                            <span className="text-xs text-text-tertiary flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{scheduledShows.length}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Action */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-right">
                        <span className="text-xs font-semibold text-text-primary group-hover:text-brand-primary inline-flex items-center gap-1 transition-colors">
                          {isKa ? 'დეტალები' : 'View Details'}
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
