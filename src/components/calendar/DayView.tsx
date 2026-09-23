'use client';

import React from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { Talent } from '../../types/talent';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Users, Sparkles, Calendar, ArrowRight, Bus } from 'lucide-react';
import { toLocalDateStr } from '../../utils/dateUtils';

interface DayViewProps {
  currentDate: Date;
  events: ShowEvent[];
  groups: Group[];
  venues: HotelVenue[];
  talents: Talent[];
  onSelectEvent: (event: ShowEvent) => void;
  onOpenSchedule: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  groups,
  venues,
  talents,
  onSelectEvent,
  onOpenSchedule
}) => {
  const { language, t } = useLanguage();
  // Use local date string to avoid UTC timezone shift (e.g. UTC+4 at 02:00 = previous UTC day)
  const dateStr = toLocalDateStr(currentDate);
  const dayEvents = events.filter((ev) => ev.startDateTime.startsWith(dateStr));

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const venueMap = new Map(venues.map((v) => [v.id, v]));
  const talentMap = new Map(talents.map((t) => [t.id, t]));

  const localeStr = language === 'ka' ? 'ka-GE' : 'en-US';

  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4.5 border-b border-border-subtle mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-md bg-brand-primary flex items-center justify-center text-text-inverse font-bold text-lg shrink-0 shadow-sm">
            {currentDate.getDate()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary capitalize">
              {currentDate.toLocaleDateString(localeStr, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {dayEvents.length} {dayEvents.length === 1 ? t('show') : t('shows')} {t('scheduled_for_today')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSchedule}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-pill text-sm font-medium bg-brand-primary text-text-inverse shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none"
        >
          <span>{t('book_show_for_today')}</span>
        </button>
      </div>

      {/* Shows List */}
      {dayEvents.length === 0 ? (
        <div className="text-center py-16 px-5 text-text-secondary flex flex-col items-center justify-center">
          <Calendar className="w-9 h-9 mb-3 opacity-40 text-text-secondary" />
          <h4 className="text-base font-semibold text-text-primary mb-1">
            {t('no_shows_today')}
          </h4>
          <p className="text-xs text-text-secondary mb-4">
            {t('no_shows_today_sub')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {dayEvents.map((ev) => {
            const group = groupMap.get(ev.groupId);
            const venue = venueMap.get(ev.hotelId);
            const startTime = new Date(ev.startDateTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            const endTime = new Date(ev.endDateTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            const effectiveLobby =
              ev.lobbyTime ||
              (() => {
                const d = new Date(ev.startDateTime);
                const travel = venue?.travelTimeMinutes ?? 45;
                const totalM = (d.getHours() * 60 + d.getMinutes() - travel + 1440) % 1440;
                return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(
                  totalM % 60
                ).padStart(2, '0')}`;
              })();

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className="border border-border-subtle rounded-md p-4 sm:p-5 bg-surface-secondary hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-150 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
                  <div>
                    <h4 className="text-base font-semibold text-text-primary">
                      {ev.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-text-secondary flex-wrap">
                      <span className="flex items-center gap-1.5 text-text-primary font-semibold">
                        <Bus className="w-3.5 h-3.5 shrink-0" strokeWidth={2} /> {t('gathering_label')}: {effectiveLobby}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" strokeWidth={2} /> {t('show_time_label')}: {startTime} - {endTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" /> {venue?.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 shrink-0" /> {group?.name}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill text-xs font-medium border border-border-subtle bg-surface text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 shrink-0"
                  >
                    <span>{t('manage_duties')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Inventory Duty Crew Section */}
                <div className="bg-surface rounded-sm p-3 sm:p-3.5 border border-border-subtle">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                    <span>{t('assigned_duty_rotation')}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ev.dutyAssignments.map((duty) => (
                      <div
                        key={duty.requirementId}
                        className="px-2.5 py-1.5 rounded-xs bg-surface-secondary border border-border-subtle text-xs text-text-primary"
                      >
                        <strong className="font-semibold">{duty.itemName}:</strong>{' '}
                        {duty.assignedTalentIds.map((tid, idx) => {
                          const talent = talentMap.get(tid);
                          return (
                            <span key={tid}>
                              {talent ? `${talent.firstName} ${talent.lastName}` : tid}
                              {idx < duty.assignedTalentIds.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
