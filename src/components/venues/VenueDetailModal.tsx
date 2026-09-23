'use client';

import React from 'react';
import { HotelVenue } from '../../types/venue';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
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
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-danger hover:bg-danger-light hover:border-danger-border transition-all duration-150 cursor-pointer outline-none"
          >
            <Trash2 size={15} />
            <span>{t('delete')}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
            >
              {t('close')}
            </button>
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-pill text-sm font-medium bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none"
            >
              <Edit2 size={15} />
              <span>{t('edit_venue')}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Stat 1: Scheduled Shows */}
          <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <Calendar size={14} className="text-text-primary shrink-0" />
              <span className="truncate">
                {language === 'ka' ? 'დაგეგმილი შოუები' : 'Scheduled Shows'}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-text-primary mt-1 leading-tight">
              {activeShowsCount}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 truncate">
              {activeShowsCount > 0
                ? (language === 'ka' ? 'აქტიური რეპერტუარი' : 'Active repertoire')
                : (language === 'ka' ? 'შოუები არ არის' : 'No shows currently')}
            </div>
          </div>

          {/* Stat 2: Transit / Travel Time */}
          <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <Bus size={14} className="text-text-primary shrink-0" />
              <span className="truncate">
                {language === 'ka' ? 'სამგზავრო დრო' : 'Transit Time'}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-text-primary mt-1 leading-tight">
              {venue.travelTimeMinutes ? `${venue.travelTimeMinutes} ${t('minutes_short')}` : '—'}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 truncate">
              {language === 'ka' ? 'ბაზიდან / ცენტრიდან' : 'From base hub'}
            </div>
          </div>

          {/* Stat 3: Venue Status */}
          <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <ShieldCheck
                size={14}
                className={`shrink-0 ${activeShowsCount > 0 ? 'text-status-active-dot' : 'text-text-secondary'}`}
              />
              <span className="truncate">
                {language === 'ka' ? 'სტატუსი' : 'Status'}
              </span>
            </div>
            <div
              className={`text-lg font-extrabold mt-1 leading-tight truncate ${
                activeShowsCount > 0 ? 'text-brand-primary' : 'text-status-active-text'
              }`}
            >
              {activeShowsCount > 0 ? t('active_venue') : t('available_venue')}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 truncate">
              {activeShowsCount > 0
                ? (language === 'ka' ? 'დაკავებული ლოკაცია' : 'Booked destination')
                : (language === 'ka' ? 'თავისუფალია' : 'Ready to book')}
            </div>
          </div>
        </div>

        {/* Primary Contact & Hall Details Card */}
        <div className="bg-surface-secondary rounded-sm border border-border-subtle p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-primary-light text-brand-primary flex items-center justify-center shrink-0">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                  {t('primary_contact')}
                </div>
                <div className="text-sm font-bold text-text-primary truncate">
                  {venue.contactName || (language === 'ka' ? 'მითითებული არ არის' : 'Not specified')}
                </div>
              </div>
            </div>

            {venue.roomOrBallroom && (
              <span className="text-xs px-2.5 py-0.5 rounded-pill bg-surface border border-border-subtle text-text-primary font-semibold inline-flex items-center gap-1.5">
                <Building size={12} />
                <span>{venue.roomOrBallroom}</span>
              </span>
            )}
          </div>

          {/* Contact Details (Phone & Email) */}
          <div className="flex flex-wrap gap-3.5 pt-2 border-t border-border-subtle text-xs">
            {venue.contactPhone ? (
              <a
                href={`tel:${venue.contactPhone}`}
                className="inline-flex items-center gap-1.5 text-text-primary hover:text-brand-primary font-medium transition-colors duration-150"
              >
                <Phone size={14} className="text-brand-primary" />
                <span>{venue.contactPhone}</span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-text-secondary">
                <Phone size={14} />
                <span>{language === 'ka' ? 'ტელეფონი არ არის' : 'No phone'}</span>
              </span>
            )}

            {venue.contactEmail ? (
              <a
                href={`mailto:${venue.contactEmail}`}
                className="inline-flex items-center gap-1.5 text-text-primary hover:text-brand-primary font-medium transition-colors duration-150 truncate"
              >
                <Mail size={14} className="text-brand-primary shrink-0" />
                <span className="truncate">{venue.contactEmail}</span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-text-secondary">
                <Mail size={14} />
                <span>{language === 'ka' ? 'ელ-ფოსტა არ არის' : 'No email'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Location Banner */}
        <div className="flex items-center gap-2.5 p-3 rounded-sm bg-surface-secondary border border-border-subtle text-xs text-text-primary">
          <MapPin size={16} className="text-brand-primary shrink-0" />
          <span>
            <strong className="font-semibold">{language === 'ka' ? 'მისამართი:' : 'Address:'}</strong> {venue.address}, {venue.city}, {venue.country}
          </span>
        </div>

        {/* Stage Specs & Notes (if any) */}
        {venue.notes && (
          <div className="p-3.5 rounded-sm bg-surface-secondary border border-border-subtle">
            <div className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              {language === 'ka' ? 'სცენის სპეციფიკაცია / შენიშვნები' : 'Stage Specifications & Notes'}
            </div>
            <p className="m-0 text-xs text-text-primary italic leading-relaxed">
              "{venue.notes}"
            </p>
          </div>
        )}

        {/* Scheduled Shows Section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-sm font-bold text-text-primary m-0 uppercase tracking-wider">
              {language === 'ka' ? 'დაგეგმილი შოუები' : 'Scheduled Shows'} ({venueShows.length})
            </h4>
            <span className="text-xs text-text-secondary">
              {activeShowsCount} {language === 'ka' ? 'აქტიური' : 'active'}
            </span>
          </div>

          <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface-secondary p-2.5 max-h-[260px] overflow-y-auto thin-scrollbar">
            {venueShows.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs text-text-secondary">
                <Calendar size={28} className="opacity-35 mb-2 mx-auto" />
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
                    className="flex items-center justify-between p-2.5 px-3.5 bg-surface rounded-sm border border-border-subtle gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">
                        {show.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{dateLabel}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          <span>{startTime} - {endTime}</span>
                        </span>
                        {group && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-brand-primary font-semibold">
                              <Users size={12} />
                              <span>{group.name}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-pill font-semibold shrink-0 ${
                        show.status === 'Scheduled'
                          ? 'bg-status-active-bg text-status-active-text'
                          : show.status === 'Completed'
                          ? 'bg-surface-secondary text-text-secondary'
                          : 'bg-status-sick-bg text-status-sick-text'
                      }`}
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
