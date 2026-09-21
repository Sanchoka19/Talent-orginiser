import React from 'react';
import { HotelVenue } from '../../types/venue';
import { MapPin, Phone, Mail, User, Building, Calendar, Bus, ChevronRight } from 'lucide-react';
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

  // LIST VIEW ROW (Matches GroupCard list view layout)
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '14px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 2fr) minmax(200px, 1.8fr) minmax(180px, 1.5fr) minmax(180px, 1.4fr) 140px',
          alignItems: 'center',
          gap: '16px',
          transition: 'all var(--transition-fast)',
          position: 'relative',
          cursor: 'pointer'
        }}
        className="venue-row-card"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-medium)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        {/* Col 1: Icon & Venue Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Building size={18} strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--color-charcoal)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={venue.name}
            >
              {venue.name}
            </h3>
          </div>
        </div>

        {/* Col 2: Location & Address */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.825rem',
            color: 'var(--color-text-secondary)',
            minWidth: 0,
            overflow: 'hidden'
          }}
          title={`${venue.address}, ${venue.city}`}
        >
          <MapPin size={15} style={{ flexShrink: 0, color: 'var(--color-charcoal)' }} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {venue.address}, {venue.city}
          </span>
        </div>

        {/* Col 3: Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem', minWidth: 0, overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              color: 'var(--color-charcoal)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <User size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {venue.contactName || t('none')}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {venue.contactPhone && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <Phone size={11} /> {venue.contactPhone}
              </span>
            )}
            {venue.contactEmail && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={venue.contactEmail}
              >
                <Mail size={11} style={{ flexShrink: 0 }} /> {venue.contactEmail}
              </span>
            )}
          </div>
        </div>

        {/* Col 4: Status & Scheduled Shows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.775rem',
              color: 'var(--color-charcoal)',
              fontWeight: 500,
              flexShrink: 0
            }}
          >
            <Calendar size={13} />
            <span>{scheduledShows.length}</span>
          </div>
          <span
            style={{
              fontSize: '0.725rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              background: scheduledShows.length > 0 ? 'var(--brand-primary-light)' : 'var(--bg-surface-tertiary)',
              color: scheduledShows.length > 0 ? 'var(--brand-primary)' : 'var(--color-text-secondary)',
              fontWeight: 600,
              flexShrink: 0
            }}
          >
            {scheduledShows.length > 0 ? t('active_venue') : t('available_venue')}
          </span>
        </div>

        {/* Col 5: View Details Link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
          <span
            style={{
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--color-charcoal)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            {language === 'ka' ? 'დეტალები' : 'View Details'}
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    );
  }

  // GRID VIEW (Exact match to GroupCard styling & structure)
  return (
    <div
      onClick={handleClick}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-medium)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      <div>
        {/* Top Row: Title + Location & Icon Badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                fontSize: '1.08rem',
                fontWeight: 700,
                color: 'var(--color-charcoal)',
                margin: 0,
                letterSpacing: '-0.01em',
                lineHeight: 1.3
              }}
            >
              {venue.name}
            </h3>

            {/* Address */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.825rem',
                color: 'var(--color-text-secondary)',
                marginTop: '5px'
              }}
            >
              <MapPin size={14} style={{ flexShrink: 0, color: 'var(--color-charcoal)' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {venue.address}, {venue.city}
              </span>
            </div>
          </div>

          {/* Modern Pastel Icon Badge */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title={t('venue_name')}
          >
            <Building size={18} strokeWidth={2} />
          </div>
        </div>

        {/* Middle Row: Primary Contact Card */}
        <div
          style={{
            background: 'var(--bg-surface-secondary)',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid var(--border-subtle)',
            margin: '18px 0 16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <User size={15} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--color-charcoal)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block'
                  }}
                  title={venue.contactName ? `${t('primary_contact')}: ${venue.contactName}` : t('primary_contact')}
                >
                  {venue.contactName ? `${t('primary_contact')}: ${venue.contactName}` : t('primary_contact')}
                </span>
              </div>
            </div>


          </div>

          {(venue.contactPhone || venue.contactEmail) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.775rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
              {venue.contactPhone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                  <Phone size={12} />
                  <span>{venue.contactPhone}</span>
                </span>
              )}
              {venue.contactEmail && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={venue.contactEmail}>
                  <Mail size={12} />
                  <span>{venue.contactEmail}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        {/* Thin Divider Line */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', marginBottom: '14px' }} />

        {/* Bottom Row: Scheduled Shows Counter & View Details link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexWrap: 'nowrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.825rem',
                color: 'var(--color-charcoal)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Calendar size={14} style={{ color: 'var(--color-text-secondary)' }} />
              <span>{scheduledShows.length} {scheduledShows.length === 1 ? (language === 'ka' ? 'შოუ' : 'show') : (language === 'ka' ? 'დაგეგმილი შოუ' : 'shows')}</span>
            </div>
            <span
              style={{
                fontSize: '0.725rem',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                background: scheduledShows.length > 0 ? 'var(--brand-primary-light)' : 'var(--bg-surface-secondary)',
                color: scheduledShows.length > 0 ? 'var(--brand-primary)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {scheduledShows.length > 0 ? t('active_venue') : t('available_venue')}
            </span>
          </div>

          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-charcoal)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'color var(--transition-fast)'
            }}
          >
            <span>{language === 'ka' ? 'დეტალები' : 'View Details'}</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
