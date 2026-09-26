'use client';

import React from 'react';
import { HotelVenue } from '../../types/venue';
import { MapPin, Phone, Mail, User, Building, Calendar, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

interface VenueCardProps {
  venue: HotelVenue;
  onSelect?: (venue: HotelVenue) => void;
  onEdit: (venue: HotelVenue) => void;
  onDelete: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

export const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  onSelect,
  onEdit,
  viewMode = 'grid'
}) => {
  const { schedule } = useApp();
  const { t, language } = useLanguage();

  const scheduledShows = schedule.filter((e) => e.hotelId === venue.id && e.status !== 'Cancelled');

  const handleClick = () => {
    if (onSelect) {
      onSelect(venue);
    } else {
      onEdit(venue);
    }
  };

  // LIST VIEW ROW
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="group relative bg-surface rounded-md border border-border-subtle px-4 sm:px-5 py-3.5 shadow-sm grid grid-cols-[minmax(180px,2fr)_minmax(140px,1.5fr)_minmax(140px,1.3fr)_minmax(110px,1fr)_90px] items-center gap-3 sm:gap-4 cursor-pointer transition-all duration-150 hover:border-border-medium hover:shadow-md hover:-translate-y-0.5"
      >
        {/* Col 1: Icon & Venue Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-sm bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Building size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0 overflow-hidden">
            <h3
              className="text-sm font-bold text-text-primary m-0 truncate group-hover:text-brand-primary transition-colors duration-150"
              title={venue.name}
            >
              {venue.name}
            </h3>
          </div>
        </div>

        {/* Col 2: Location & Address */}
        <div
          className="flex items-center gap-1.5 text-xs text-text-secondary min-w-0 overflow-hidden"
          title={`${venue.address}, ${venue.city}`}
        >
          <MapPin size={15} className="shrink-0 text-text-primary" />
          <span className="truncate">
            {venue.address}, {venue.city}
          </span>
        </div>

        {/* Col 3: Contact Info */}
        <div className="flex flex-col gap-0.5 text-xs min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 font-semibold text-text-primary overflow-hidden">
            <User size={13} className="shrink-0 text-text-secondary" />
            <span className="truncate">
              {venue.contactName || t('none')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-[11px] overflow-hidden">
            {venue.contactPhone && (
              <span className="inline-flex items-center gap-1 shrink-0">
                <Phone size={11} /> {venue.contactPhone}
              </span>
            )}
            {venue.contactEmail && (
              <span
                className="inline-flex items-center gap-1 truncate"
                title={venue.contactEmail}
              >
                <Mail size={11} className="shrink-0" /> {venue.contactEmail}
              </span>
            )}
          </div>
        </div>

        {/* Col 4: Status & Scheduled Shows */}
        <div className="flex items-center gap-2 flex-nowrap min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-text-primary font-medium shrink-0">
            <Calendar size={13} className="text-text-secondary" />
            <span>{scheduledShows.length}</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-pill font-semibold shrink-0 ${
              scheduledShows.length > 0
                ? 'bg-brand-primary-light text-brand-primary'
                : 'bg-surface-tertiary text-text-secondary'
            }`}
          >
            {scheduledShows.length > 0 ? t('active_venue') : t('available_venue')}
          </span>
        </div>

        {/* Col 5: View Details Link */}
        <div className="flex items-center justify-end gap-1">
          <span className="text-xs font-semibold text-text-primary group-hover:text-brand-primary flex items-center gap-0.5 transition-colors duration-150">
            {language === 'ka' ? 'დეტალები' : 'View Details'}
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
        {/* Top Row: Title + Location & Icon Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-text-primary m-0 tracking-tight leading-snug group-hover:text-brand-primary transition-colors duration-150 truncate">
              {venue.name}
            </h3>

            {/* Address */}
            <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1.5">
              <MapPin size={14} className="shrink-0 text-text-primary" />
              <span className="truncate">
                {venue.address}, {venue.city}
              </span>
            </div>
          </div>

          {/* Pastel Icon Badge */}
          <div
            className="w-9 h-9 rounded-sm bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0"
            title={t('venue_name')}
          >
            <Building size={18} strokeWidth={2} />
          </div>
        </div>

        {/* Middle Row: Primary Contact Card (only if contact info exists) */}
        {(venue.contactName || venue.contactPhone || venue.contactEmail) && (
          <div className="bg-surface-secondary rounded-sm p-3.5 border border-border-subtle my-4 flex flex-col gap-2">
            {venue.contactName && (
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <User size={15} className="text-brand-primary shrink-0" />
                  <div className="min-w-0 overflow-hidden">
                    <span
                      className="text-xs font-semibold text-text-primary truncate block"
                      title={`${t('primary_contact')}: ${venue.contactName}`}
                    >
                      {venue.contactName}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {(venue.contactPhone || venue.contactEmail) && (
              <div className="flex items-center gap-3.5 text-xs text-text-secondary flex-wrap">
                {venue.contactPhone && (
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Phone size={12} />
                    <span>{venue.contactPhone}</span>
                  </span>
                )}
                {venue.contactEmail && (
                  <span
                    className="inline-flex items-center gap-1.5 truncate"
                    title={venue.contactEmail}
                  >
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate">{venue.contactEmail}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div>
        {/* Thin Divider Line */}
        <div className="border-t border-border-subtle mb-3.5" />

        {/* Bottom Row: Scheduled Shows Counter & View Details link */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-nowrap">
            <div className="flex items-center gap-1.5 text-xs text-text-primary font-semibold whitespace-nowrap shrink-0">
              <Calendar size={14} className="text-text-secondary" />
              <span>
                {scheduledShows.length}{' '}
                {scheduledShows.length === 1
                  ? language === 'ka'
                    ? 'შოუ'
                    : 'show'
                  : language === 'ka'
                  ? 'დაგეგმილი შოუ'
                  : 'shows'}
              </span>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-pill font-semibold whitespace-nowrap shrink-0 ${
                scheduledShows.length > 0
                  ? 'bg-brand-primary-light text-brand-primary'
                  : 'bg-surface-secondary text-text-secondary'
              }`}
            >
              {scheduledShows.length > 0 ? t('active_venue') : t('available_venue')}
            </span>
          </div>

          <div className="text-xs font-semibold text-text-primary group-hover:text-brand-primary flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors duration-150">
            <span>{language === 'ka' ? 'დეტალები' : 'View Details'}</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          </div>
        </div>
      </div>
    </div>
  );
};
