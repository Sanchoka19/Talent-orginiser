'use client';

import React from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { MapPin, Users, Bus, Clock, Check, AlertTriangle } from 'lucide-react';

// Convert a hex color (#RRGGBB) to an "r, g, b" string for CSS rgba()
const hexToRgb = (hex: string): string => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '99, 102, 241';
  return `${r}, ${g}, ${b}`;
};

interface WeekViewProps {
  currentDate: Date;
  events: ShowEvent[];
  groups: Group[];
  venues: HotelVenue[];
  onSelectEvent: (event: ShowEvent) => void;
  onSelectDate: (dateStr: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  groups,
  venues,
  onSelectEvent,
  onSelectDate
}) => {
  const { language, t } = useLanguage();
  const isKa = language === 'ka';
  const { formatTime } = useApp();
  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const venueMap = new Map(venues.map((v) => [v.id, v]));

  // Calculate start of current week (Monday)
  const d = new Date(currentDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    weekDays.push(nextDay);
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const localeStr = language === 'ka' ? 'ka-GE' : language === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="grid grid-cols-7 gap-3 min-w-[920px] min-h-[480px]">
        {weekDays.map((dayDate, idx) => {
          const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(dayDate.getDate()).padStart(2, '0')}`;
          const dayName = dayDate.toLocaleDateString(localeStr, { weekday: 'short' });
          const dayNumber = dayDate.getDate();
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;

          const dayEvents = events.filter((ev) => ev.startDateTime.startsWith(dateStr));

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(dateStr)}
              className={`rounded-md p-3 flex flex-col min-h-[460px] shadow-sm transition-all duration-150 cursor-pointer ${
                isToday
                  ? 'bg-brand-primary/5 border-2 border-brand-primary opacity-100'
                  : isPast
                  ? 'bg-canvas/40 border border-border-subtle opacity-80 hover:opacity-100'
                  : 'bg-surface border border-border-subtle opacity-100 hover:border-border-medium'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle mb-3">
                <div>
                  <span className="text-xs font-semibold text-text-secondary uppercase">
                    {dayName}
                  </span>
                  <div
                    className={`text-xl font-bold ${
                      isToday
                        ? 'text-brand-primary'
                        : isPast
                        ? 'text-text-tertiary'
                        : 'text-text-primary'
                    }`}
                  >
                    {dayNumber}
                  </div>
                </div>

                {isToday && (
                  <span className="text-[10px] font-bold bg-brand-primary text-text-inverse px-1.5 py-0.5 rounded-pill shadow-sm">
                    {t('today').toUpperCase()}
                  </span>
                )}

                {isPast && !isToday && (
                  <span className="text-[10px] font-semibold text-text-tertiary inline-flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                    <span>{language === 'ka' ? 'დასრულდა' : 'Past'}</span>
                  </span>
                )}
              </div>

              {/* Event Cards */}
              <div className="flex flex-col gap-2 flex-1">
                {dayEvents.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-text-tertiary text-xs italic text-center p-3">
                    {t('no_shows_week')}
                  </div>
                ) : (
                  dayEvents.map((ev) => {
                    const group = groupMap.get(ev.groupId);
                    const venue = venueMap.get(ev.hotelId);
                    const startTime = formatTime(ev.startDateTime);
                    const endTime = formatTime(ev.endDateTime);

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

                    const isEventPast = isPast || new Date(ev.endDateTime).getTime() < Date.now();

                    // Group accent color
                    const accent = group?.colorAccent || '#6366F1';
                    const rgb = hexToRgb(accent);
                    const cardStyle = isEventPast
                      ? {
                          borderLeftColor: `rgba(${rgb}, 0.5)`,
                          borderLeftWidth: '3px',
                          backgroundColor: `rgba(${rgb}, 0.06)`
                        }
                      : {
                          backgroundColor: accent,
                          borderColor: accent
                        };

                    const totalVacancies = (ev.dutyAssignments || []).reduce((acc, d) => {
                      const needed = Math.max(1, d.requiredHeadcount || 1);
                      const assigned = d.assignedTalentIds?.length || 0;
                      return acc + Math.max(0, needed - assigned);
                    }, 0);

                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev);
                        }}
                        style={cardStyle}
                        className={`p-2.5 rounded-sm border cursor-pointer transition-all duration-150 ${
                          isEventPast
                            ? 'text-text-secondary border-border-subtle opacity-85 hover:opacity-100'
                            : 'text-text-inverse border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 hover:brightness-90'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="font-bold text-xs truncate">{ev.title}</div>
                          {!isEventPast && totalVacancies > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-100 border border-amber-400/40 shrink-0">
                              <AlertTriangle size={10} className="shrink-0" />
                              <span>{totalVacancies} {isKa ? 'ვაკანსია' : totalVacancies === 1 ? 'Vacancy' : 'Vacancies'}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-0.5 text-xs mb-1.5">
                          <div
                            className={`flex items-center gap-1 font-semibold ${
                              isEventPast ? 'text-text-tertiary' : 'text-inherit'
                            }`}
                          >
                            <Bus className="w-3 h-3 shrink-0" strokeWidth={2} />
                            <span>
                              {t('gathering_label')}: {formatTime(effectiveLobby)}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-1 ${
                              isEventPast ? 'text-text-tertiary' : 'text-inherit'
                            }`}
                          >
                            <Clock className="w-3 h-3 shrink-0" strokeWidth={2} />
                            <span>
                              {startTime} - {endTime}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 text-xs mb-1 font-semibold ${
                            isEventPast ? 'text-text-secondary' : 'text-inherit'
                          }`}
                        >
                          <Users
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isEventPast ? 'opacity-70' : 'opacity-100'
                            }`}
                          />
                          <span className="truncate">{group?.name}</span>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 text-xs ${
                            isEventPast ? 'text-text-tertiary' : 'text-white/85'
                          }`}
                        >
                          <MapPin
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isEventPast ? 'opacity-70' : 'opacity-100'
                            }`}
                          />
                          <span className="truncate">{venue?.name}</span>
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
    </div>
  );
};
