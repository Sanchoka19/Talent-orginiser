'use client';

import React from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { Talent } from '../../types/talent';
import { useLanguage } from '../../context/LanguageContext';
import { Calendar } from 'lucide-react';
import { toLocalDateStr } from '../../utils/dateUtils';
import { ShowEventCard } from '../common/ShowEventCard';

interface DayViewProps {
  currentDate: Date;
  events: ShowEvent[];
  groups: Group[];
  venues: HotelVenue[];
  talents: Talent[];
  onSelectEvent: (event: ShowEvent) => void;
  onOpenSchedule: () => void;
  onSelectTalent?: (talent: Talent) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  groups,
  venues,
  talents,
  onSelectEvent,
  onOpenSchedule,
  onSelectTalent
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
          {dayEvents.map((ev) => (
            <ShowEventCard
              key={ev.id}
              event={ev}
              group={groupMap.get(ev.groupId)}
              venue={venueMap.get(ev.hotelId)}
              talentsMap={talentMap}
              onSelectEvent={onSelectEvent}
              onSelectTalent={onSelectTalent}
              defaultExpandedDuties={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

