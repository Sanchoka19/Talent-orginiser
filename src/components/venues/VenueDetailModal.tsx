import React from 'react';
import { HotelVenue } from '../../types/venue';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import {
  Building,
  MapPin,
  Calendar,
  Bus,
  User,
  Phone,
  Mail,
  Edit2,
  Trash2,
  ShieldCheck,
  Clock,
  Users
} from 'lucide-react';

interface VenueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: HotelVenue | null;
  onEdit: (venue: HotelVenue) => void;
  onDelete: (venueId: string) => void;
}

import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';

export const VenueDetailModal: React.FC<VenueDetailModalProps> = ({
  isOpen,
  onClose,
  venue,
  onEdit,
  onDelete
}) => {
  const { t, language } = useLanguage();
  const { schedule, groups } = useApp();
  const { confirm } = useConfirm();
  const toast = useToast();
  const isKa = language === 'ka';

  if (!venue) return null;

  // Filter shows scheduled at this venue
  const venueShows = schedule
    .filter((s) => s.hotelId === venue.id)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  const activeShowsCount = venueShows.filter((s) => s.status !== 'Cancelled').length;

  const handleDelete = () => {
    confirm({
      title: language === 'ka' ? 'ლოკაციის წაშლა' : 'Delete Venue',
      message: language === 'ka'
        ? 'ნამდვილად გსურთ ამ სასტუმრო ლოკაციის წაშლა? მასთან დაკავშირებული მონაცემები წაიშლება.'
        : `Are you sure you want to delete this hotel venue? All associated show connections will be removed.`,
      itemName: venue.name,
      confirmLabel: language === 'ka' ? 'წაშლა' : 'Delete',
      variant: 'danger',
      onConfirm: () => {
        onDelete(venue.id);
        toast.success(
          isKa
            ? `სასტუმრო „${venue.name}“ წარმატებით წაიშალა`
            : `Hotel venue "${venue.name}" deleted successfully`
        );
        onClose();
      }
    });
  };

  const handleOpenEdit = () => {
    onClose();
    onEdit(venue);
  };

  const localeStr = language === 'ka' ? 'ka-GE' : 'en-US';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={venue.name}
      subtitle={`${venue.address}, ${venue.city}${venue.country ? `, ${venue.country}` : ''}`}
      maxWidth="620px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-secondary"
            style={{ color: '#EF4444' }}
          >
            <Trash2 size={15} />
            <span>{t('delete')}</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('close')}
            </button>
            <button type="button" onClick={handleOpenEdit} className="btn btn-primary">
              <Edit2 size={15} />
              <span>{t('edit_venue')}</span>
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Top 3 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {/* Stat 1: Scheduled Shows */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '94px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <Calendar size={14} color="var(--color-charcoal)" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {language === 'ka' ? 'დაგეგმილი შოუები' : 'Scheduled Shows'}
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-charcoal)', marginTop: '4px', lineHeight: 1.2 }}>
              {activeShowsCount}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeShowsCount > 0 ? (language === 'ka' ? 'აქტიური რეპერტუარი' : 'Active repertoire') : (language === 'ka' ? 'შოუები არ არის' : 'No shows currently')}
            </div>
          </div>

          {/* Stat 2: Transit / Travel Time */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '94px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <Bus size={14} color="var(--color-charcoal)" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {language === 'ka' ? 'სამგზავრო დრო' : 'Transit Time'}
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-charcoal)', marginTop: '4px', lineHeight: 1.2 }}>
              {venue.travelTimeMinutes ? `${venue.travelTimeMinutes} ${t('minutes_short')}` : '—'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {language === 'ka' ? 'ბაზიდან / ცენტრიდან' : 'From base hub'}
            </div>
          </div>

          {/* Stat 3: Venue Status */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '94px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <ShieldCheck size={14} color={activeShowsCount > 0 ? '#16A34A' : '#64748B'} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {language === 'ka' ? 'სტატუსი' : 'Status'}
              </span>
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: activeShowsCount > 0 ? 'var(--brand-primary)' : '#16A34A',
                marginTop: '4px',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {activeShowsCount > 0 ? t('active_venue') : t('available_venue')}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeShowsCount > 0 ? (language === 'ka' ? 'დაკავებული ლოკაცია' : 'Booked destination') : (language === 'ka' ? 'თავისუფალია' : 'Ready to book')}
            </div>
          </div>
        </div>

        {/* Primary Contact & Hall Details Card */}
        <div
          style={{
            background: 'var(--bg-surface-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--brand-primary-light)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('primary_contact')}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                  {venue.contactName || (language === 'ka' ? 'მითითებული არ არის' : 'Not specified')}
                </div>
              </div>
            </div>

            {venue.roomOrBallroom && (
              <span
                style={{
                  fontSize: '0.775rem',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--color-charcoal)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Building size={12} />
                <span>{venue.roomOrBallroom}</span>
              </span>
            )}
          </div>

          {/* Contact Details (Phone & Email) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.825rem' }}>
            {venue.contactPhone ? (
              <a
                href={`tel:${venue.contactPhone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-charcoal)',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                <Phone size={14} style={{ color: 'var(--brand-primary)' }} />
                <span>{venue.contactPhone}</span>
              </a>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
                <Phone size={14} />
                <span>{language === 'ka' ? 'ტელეფონი არ არის' : 'No phone'}</span>
              </span>
            )}

            {venue.contactEmail ? (
              <a
                href={`mailto:${venue.contactEmail}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-charcoal)',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                <Mail size={14} style={{ color: 'var(--brand-primary)' }} />
                <span>{venue.contactEmail}</span>
              </a>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
                <Mail size={14} />
                <span>{language === 'ka' ? 'ელ-ფოსტა არ არის' : 'No email'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Location Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.825rem',
            color: 'var(--color-charcoal)'
          }}
        >
          <MapPin size={16} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
          <span>
            <strong>{language === 'ka' ? 'მისამართი:' : 'Address:'}</strong> {venue.address}, {venue.city}, {venue.country}
          </span>
        </div>

        {/* Stage Specs & Notes (if any) */}
        {venue.notes && (
          <div
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              {language === 'ka' ? 'სცენის სპეციფიკაცია / შენიშვნები' : 'Stage Specifications & Notes'}
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-charcoal)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{venue.notes}"
            </p>
          </div>
        )}

        {/* Scheduled Shows Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'ka' ? 'დაგეგმილი შოუები' : 'Scheduled Shows'} ({venueShows.length})
            </h4>
            <span style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
              {activeShowsCount} {language === 'ka' ? 'აქტიური' : 'active'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              padding: '10px',
              maxHeight: '260px',
              overflowY: 'auto'
            }}
          >
            {venueShows.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <Calendar size={28} style={{ opacity: 0.35, marginBottom: '8px', marginInline: 'auto' }} />
                <div>{language === 'ka' ? 'ამ ლოკაციაზე შოუები ჯერ არ არის დაგეგმილი' : 'No shows currently scheduled at this venue'}</div>
              </div>
            ) : (
              venueShows.map((show) => {
                const group = groups.find((g) => g.id === show.groupId);
                const startDate = new Date(show.startDateTime);
                const endDate = new Date(show.endDateTime);
                const dateLabel = startDate.toLocaleDateString(localeStr, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const startTime = startDate.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit', hour12: false });
                const endTime = endDate.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit', hour12: false });

                return (
                  <div
                    key={show.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      gap: '12px'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {show.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.775rem', color: 'var(--color-text-secondary)', marginTop: '2px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          <span>{dateLabel}</span>
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          <span>{startTime} - {endTime}</span>
                        </span>
                        {group && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--brand-primary)', fontWeight: 600 }}>
                              <Users size={12} />
                              <span>{group.name}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.725rem',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                        background:
                          show.status === 'Scheduled'
                            ? 'rgba(22, 163, 74, 0.1)'
                            : show.status === 'Completed'
                            ? 'var(--bg-surface-secondary)'
                            : 'rgba(239, 68, 68, 0.1)',
                        color:
                          show.status === 'Scheduled'
                            ? '#16A34A'
                            : show.status === 'Completed'
                            ? 'var(--color-text-secondary)'
                            : '#EF4444',
                        fontWeight: 600,
                        flexShrink: 0
                      }}
                    >
                      {show.status === 'Scheduled'
                        ? (language === 'ka' ? 'დაგეგმილი' : 'Scheduled')
                        : show.status === 'Completed'
                        ? (language === 'ka' ? 'დასრულებული' : 'Completed')
                        : (language === 'ka' ? 'გაუქმებული' : 'Cancelled')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
