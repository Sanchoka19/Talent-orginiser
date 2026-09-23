'use client';

import React from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  ChevronRight,
  Building2,
  Bus
} from 'lucide-react';

interface YearViewProps {
  currentDate: Date;
  events: ShowEvent[];
  groups: Group[];
  venues: HotelVenue[];
  onSelectEvent: (event: ShowEvent) => void;
  onSelectMonth?: (monthIndex: number) => void;
}

export const YearView: React.FC<YearViewProps> = ({
  currentDate,
  events,
  groups,
  venues,
  onSelectEvent,
  onSelectMonth
}) => {
  const { language, t } = useLanguage();
  const year = currentDate.getFullYear();
  const localeStr = language === 'ka' ? 'ka-GE' : 'en-US';

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const venueMap = new Map(venues.map((v) => [v.id, v]));

  // Events in current year
  const yearEvents = events.filter((ev) => {
    const d = new Date(ev.startDateTime);
    return d.getFullYear() === year;
  });

  // Unique groups & venues in this year
  const uniqueGroupIds = new Set(yearEvents.map((ev) => ev.groupId));
  const uniqueVenueIds = new Set(yearEvents.map((ev) => ev.hotelId));

  // 12 Months array
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1);
    const monthName = date.toLocaleDateString(localeStr, { month: 'long' });
    const monthEvents = yearEvents.filter((ev) => {
      const d = new Date(ev.startDateTime);
      return d.getMonth() === i;
    });
    return {
      index: i,
      name: monthName,
      events: monthEvents
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Year Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface border border-border-subtle rounded-md p-4 sm:p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-brand-primary flex items-center justify-center text-text-inverse shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">
              {yearEvents.length}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              {t('total_shows_year')} ({year})
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-md p-4 sm:p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-surface-secondary flex items-center justify-center text-text-primary shrink-0 border border-border-subtle">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">
              {uniqueGroupIds.size}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              {t('performing_groups_count')}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-md p-4 sm:p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-surface-secondary flex items-center justify-center text-text-primary shrink-0 border border-border-subtle">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">
              {uniqueVenueIds.size}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              {t('active_venues_booked')}
            </div>
          </div>
        </div>
      </div>

      {/* 12 Months Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4.5">
        {months.map((m) => {
          const hasShows = m.events.length > 0;
          return (
            <div
              key={m.index}
              className={`bg-surface rounded-md border flex flex-col overflow-hidden transition-all duration-150 ${
                hasShows
                  ? 'border-brand-primary shadow-sm hover:shadow-glow'
                  : 'border-border-subtle shadow-sm'
              }`}
            >
              {/* Month Card Header */}
              <div
                onClick={() => onSelectMonth && onSelectMonth(m.index)}
                className={`flex items-center justify-between px-4 py-3 border-b border-border-subtle select-none transition-colors duration-150 ${
                  hasShows
                    ? 'bg-brand-primary text-text-inverse'
                    : 'bg-surface-secondary text-text-primary'
                } ${onSelectMonth ? 'cursor-pointer hover:opacity-95' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold capitalize">
                    {m.name}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      hasShows ? 'text-text-inverse opacity-85' : 'text-text-secondary'
                    }`}
                  >
                    {year}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-pill ${
                      hasShows
                        ? 'bg-black/25 text-text-inverse'
                        : 'bg-border-subtle text-text-secondary'
                    }`}
                  >
                    {m.events.length} {m.events.length === 1 ? t('show') : t('shows')}
                  </span>
                  {onSelectMonth && (
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${
                        hasShows ? 'text-text-inverse' : 'text-text-secondary'
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Month Shows Content */}
              <div
                className={`p-3 flex flex-col gap-2 min-h-[140px] ${
                  hasShows ? 'justify-start' : 'justify-center'
                }`}
              >
                {!hasShows ? (
                  <div className="text-center text-text-tertiary text-xs italic py-5">
                    {t('no_shows_in_month')}
                  </div>
                ) : (
                  m.events.map((ev) => {
                    const group = groupMap.get(ev.groupId);
                    const venue = venueMap.get(ev.hotelId);
                    const dateObj = new Date(ev.startDateTime);
                    const dayFormatted = dateObj.toLocaleDateString(localeStr, {
                      day: 'numeric',
                      weekday: 'short'
                    });
                    const timeFormatted = dateObj.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    const effectiveLobby =
                      ev.lobbyTime ||
                      (() => {
                        const travel = venue?.travelTimeMinutes ?? 45;
                        const totalM =
                          (dateObj.getHours() * 60 + dateObj.getMinutes() - travel + 1440) % 1440;
                        return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(
                          totalM % 60
                        ).padStart(2, '0')}`;
                      })();

                    return (
                      <div
                        key={ev.id}
                        onClick={() => onSelectEvent(ev)}
                        className="bg-surface-secondary rounded-sm border border-border-subtle p-2.5 sm:p-3 cursor-pointer flex flex-col gap-1 transition-all duration-150 hover:border-brand-primary hover:bg-brand-primary/5"
                      >
                        {/* Day & Time Header */}
                        <div className="flex items-center justify-between text-xs font-bold text-text-primary flex-wrap gap-1">
                          <span className="capitalize inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 shrink-0" strokeWidth={2} />
                            <span>{dayFormatted}</span>
                          </span>
                          <span className="text-[11px] text-text-primary font-semibold inline-flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-0.5">
                              <Bus className="w-3 h-3 shrink-0" strokeWidth={2} />
                              <span>{effectiveLobby}</span>
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-0.5">
                              <Sparkles className="w-3 h-3 shrink-0" strokeWidth={2} />
                              <span>{timeFormatted}</span>
                            </span>
                          </span>
                        </div>

                        {/* Title */}
                        <div className="text-xs font-semibold text-text-primary truncate">
                          {ev.title}
                        </div>

                        {/* Group Name & Hotel Venue */}
                        <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-text-inverse font-semibold bg-brand-primary px-1.5 py-0.5 rounded-pill text-[10px] shadow-sm">
                            <Users className="w-2.5 h-2.5" />
                            <span>{group?.name}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-text-secondary text-[11px]">
                            <MapPin className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[140px]">{venue?.name}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Yearly Shows Detailed Timeline */}
      <div className="bg-surface rounded-lg border border-border-subtle p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle flex-wrap gap-2">
          <div className="flex items-center gap-2 text-text-primary">
            <Calendar className="w-4.5 h-4.5 text-text-primary" />
            <h3 className="text-base font-bold text-text-primary">
              {t('yearly_schedule')} ({year})
            </h3>
          </div>
          <span className="text-xs text-text-secondary">
            {yearEvents.length} {yearEvents.length === 1 ? t('show') : t('shows')}
          </span>
        </div>

        {yearEvents.length === 0 ? (
          <div className="py-10 px-5 text-center text-text-secondary text-sm">
            {t('no_shows_in_year')}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {yearEvents
              .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
              .map((ev) => {
                const group = groupMap.get(ev.groupId);
                const venue = venueMap.get(ev.hotelId);
                const start = new Date(ev.startDateTime);
                const end = new Date(ev.endDateTime);

                const dateStr = start.toLocaleDateString(localeStr, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const timeStr = `${start.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                const effectiveLobby =
                  ev.lobbyTime ||
                  (() => {
                    const travel = venue?.travelTimeMinutes ?? 45;
                    const totalM =
                      (start.getHours() * 60 + start.getMinutes() - travel + 1440) % 1440;
                    return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(
                      totalM % 60
                    ).padStart(2, '0')}`;
                  })();

                return (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-md bg-surface-secondary border border-border-subtle cursor-pointer transition-all duration-150 hover:border-brand-primary hover:bg-brand-primary/5 flex-wrap gap-3"
                  >
                    {/* Date & Time */}
                    <div className="min-w-[180px]">
                      <div className="font-bold text-sm text-text-primary">{dateStr}</div>
                      <div className="text-xs text-text-primary font-semibold flex items-center gap-1.5 mt-0.5">
                        <Bus className="w-3 h-3 shrink-0" strokeWidth={2} />
                        <span>
                          {t('gathering_label')}: {effectiveLobby}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary flex items-center gap-1.5 mt-0.5">
                        <Sparkles className="w-3 h-3 shrink-0" strokeWidth={2} />
                        <span>{timeStr}</span>
                      </div>
                    </div>

                    {/* Show Title */}
                    <div className="flex-1 min-w-[180px]">
                      <div className="font-semibold text-sm text-text-primary">{ev.title}</div>
                    </div>

                    {/* Group Badge */}
                    <div className="min-w-[140px]">
                      <div className="text-[11px] text-text-secondary mb-0.5">
                        {t('group_label')}:
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-brand-primary text-text-inverse px-2.5 py-1 rounded-pill shadow-sm">
                        <Users className="w-3 h-3" />
                        <span>{group?.name}</span>
                      </span>
                    </div>

                    {/* Hotel Venue */}
                    <div className="min-w-[180px]">
                      <div className="text-[11px] text-text-secondary mb-0.5">
                        {t('hotel_label')}:
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-text-primary">
                        <MapPin className="w-3 h-3 text-text-secondary shrink-0" />
                        <span>{venue?.name}</span>
                      </div>
                      {venue?.roomOrBallroom && (
                        <div className="text-xs text-text-tertiary pl-4">
                          {venue.roomOrBallroom}
                        </div>
                      )}
                    </div>

                    {/* Action Arrow */}
                    <div>
                      <ChevronRight className="w-4.5 h-4.5 text-text-secondary" />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
