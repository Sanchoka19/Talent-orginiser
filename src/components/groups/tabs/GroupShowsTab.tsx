'use client';

import React, { useState, useMemo } from 'react';
import { ShowEvent } from '../../../types/schedule';
import { HotelVenue } from '../../../types/venue';
import {
  Calendar,
  CalendarDays,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Plus,
  History,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface GroupShowsTabProps {
  groupShows: ShowEvent[];
  venues: HotelVenue[];
  onSelectShow?: (show: ShowEvent) => void;
  onBookShow?: () => void;
  dict: any;
  isKa: boolean;
}

type ShowTabFilter = 'upcoming' | 'past' | 'all';

export const GroupShowsTab: React.FC<GroupShowsTabProps> = ({
  groupShows,
  venues,
  onSelectShow,
  onBookShow,
  dict,
  isKa
}) => {
  const { formatTimeRange } = useApp();
  const [activeFilter, setActiveFilter] = useState<ShowTabFilter>('upcoming');
  const [isPastAccordionOpen, setIsPastAccordionOpen] = useState(false);

  // Helper to determine if a show has already passed
  const isShowPast = (show: ShowEvent) => {
    const endTime = new Date(show.endDateTime || show.startDateTime).getTime();
    return endTime < Date.now();
  };

  // Split and sort shows
  const { upcomingShows, pastShows } = useMemo(() => {
    const upcoming: ShowEvent[] = [];
    const past: ShowEvent[] = [];

    groupShows.forEach((show) => {
      if (isShowPast(show)) {
        past.push(show);
      } else {
        upcoming.push(show);
      }
    });

    // Sort upcoming: soonest first
    upcoming.sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );

    // Sort past: most recent first
    past.sort(
      (a, b) =>
        new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime()
    );

    return { upcomingShows: upcoming, pastShows: past };
  }, [groupShows]);

  // Shows to display based on active filter
  const displayedShows = useMemo(() => {
    switch (activeFilter) {
      case 'past':
        return pastShows;
      case 'all':
        return groupShows;
      case 'upcoming':
      default:
        return upcomingShows;
    }
  }, [activeFilter, upcomingShows, pastShows, groupShows]);

  // Render an individual show card
  const renderShowCard = (show: ShowEvent, isPast: boolean) => {
    const venue = venues.find((v) => v.id === show.hotelId);
    const startDate = new Date(show.startDateTime);
    const endDate = new Date(show.endDateTime);
    const localeStr = isKa ? 'ka-GE' : 'en-US';
    const totalDuties = (show.dutyAssignments || []).reduce(
      (acc, d) => acc + (d.assignedTalentIds?.length || 0),
      0
    );

    return (
      <div
        key={show.id}
        onClick={() => onSelectShow?.(show)}
        className={`bg-surface border rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs transition-all cursor-pointer group ${
          isPast
            ? 'border-border-subtle bg-surface/90 hover:border-slate-400/50 hover:shadow-sm opacity-90 hover:opacity-100'
            : 'border-border-subtle hover:border-brand-primary/50 hover:shadow-md hover:-translate-y-0.5'
        }`}
      >
        {/* Left: Icon & Show Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-xs border ${
              isPast
                ? 'bg-slate-100 dark:bg-surface-secondary text-text-tertiary border-border-subtle'
                : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
            }`}
          >
            <CalendarDays size={22} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm sm:text-base font-bold transition-colors truncate m-0 ${
                  isPast
                    ? 'text-text-primary group-hover:text-text-primary'
                    : 'text-text-primary group-hover:text-brand-primary'
                }`}
              >
                {show.title}
              </h4>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill border inline-flex items-center gap-1 ${
                  isPast
                    ? 'bg-slate-100 dark:bg-surface-secondary text-text-secondary border-border-subtle'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                }`}
              >
                {isPast ? (
                  <>
                    <CheckCircle2 size={11} className="text-text-tertiary" />
                    <span>{isKa ? 'დასრულებული' : 'Completed'}</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isKa ? 'დაგეგმილი' : 'Scheduled'}</span>
                  </>
                )}
              </span>
            </div>

            <div className="text-xs text-text-secondary mt-1 flex items-center gap-1.5 truncate">
              <MapPin size={12} className="text-danger shrink-0" />
              <span className="truncate">
                {venue?.name || 'Hotel'} {venue?.city ? `(${venue.city})` : ''}
              </span>
              {venue?.roomOrBallroom && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-secondary border border-border-subtle text-text-primary font-medium shrink-0">
                  {venue.roomOrBallroom}
                </span>
              )}
            </div>

            {totalDuties > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary">
                  <ShieldCheck
                    size={12}
                    className={isPast ? 'text-text-tertiary' : 'text-brand-primary'}
                  />
                  <span>
                    {isKa
                      ? `${totalDuties} მორიგე განაწილებული`
                      : `${totalDuties} crew assigned`}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Date, Time & Arrow */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right text-xs">
            <div className="font-bold text-text-primary flex items-center justify-end gap-1.5">
              <Calendar
                size={12}
                className={isPast ? 'text-text-tertiary' : 'text-brand-primary'}
              />
              <span>
                {startDate.toLocaleDateString(localeStr, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="text-text-secondary mt-1 flex items-center justify-end gap-1 font-mono text-[11px]">
              <Clock size={11} className="shrink-0" />
              <span>
                {formatTimeRange(startDate, endDate)}
              </span>
            </div>
          </div>

          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
              isPast
                ? 'bg-surface-secondary/50 text-text-tertiary group-hover:text-text-primary'
                : 'bg-surface-secondary/80 text-text-secondary group-hover:bg-brand-primary/10 group-hover:text-brand-primary'
            }`}
          >
            <ChevronRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-150">
      {/* ──────────────────────────────────────────────────────────────────
          Top Header: Title & Action
         ────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-text-primary m-0">
            {activeFilter === 'upcoming'
              ? (isKa ? 'დაგეგმილი / მომავალი შოუები' : 'Upcoming Scheduled Shows')
              : activeFilter === 'past'
              ? (isKa ? 'შოუების ისტორია (დასრულებული)' : 'Show History (Past)')
              : (isKa ? 'ჯგუფის ყველა შოუ' : 'All Shows')}
            <span className="text-text-tertiary font-normal ml-1.5 text-sm">
              ({displayedShows.length})
            </span>
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {isKa
              ? `სულ: ${groupShows.length} შოუ განრიგში (${upcomingShows.length} დაგეგმილი, ${pastShows.length} დასრულებული)`
              : `Total: ${groupShows.length} in schedule (${upcomingShows.length} upcoming, ${pastShows.length} past)`}
          </p>
        </div>

        {onBookShow && (
          <button
            type="button"
            onClick={onBookShow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>{dict.bookShow}</span>
          </button>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          Segmented Filter Tabs: Upcoming vs Past vs All
         ────────────────────────────────────────────────────────────────── */}
      {groupShows.length > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-secondary/70 border border-border-subtle w-fit self-start max-w-full overflow-x-auto">
          {/* 1. Upcoming Tab */}
          <button
            type="button"
            onClick={() => setActiveFilter('upcoming')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'upcoming'
                ? 'bg-surface text-brand-primary shadow-xs border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface/50 border border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isKa ? 'დაგეგმილი / მომავალი' : 'Upcoming'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeFilter === 'upcoming'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-surface-secondary text-text-secondary'
              }`}
            >
              {upcomingShows.length}
            </span>
          </button>

          {/* 2. Past / History Tab */}
          <button
            type="button"
            onClick={() => setActiveFilter('past')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'past'
                ? 'bg-surface text-brand-primary shadow-xs border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface/50 border border-transparent'
            }`}
          >
            <History size={13} className="text-text-tertiary" />
            <span>{isKa ? 'ისტორია / გასული' : 'History / Past'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeFilter === 'past'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'bg-surface-secondary text-text-secondary'
              }`}
            >
              {pastShows.length}
            </span>
          </button>

          {/* 3. All Shows Tab */}
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-surface text-brand-primary shadow-xs border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface/50 border border-transparent'
            }`}
          >
            <Layers size={13} className="text-text-tertiary" />
            <span>{isKa ? 'ყველა' : 'All'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-surface-secondary text-text-secondary">
              {groupShows.length}
            </span>
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          Shows List / Empty States
         ────────────────────────────────────────────────────────────────── */}
      {groupShows.length === 0 ? (
        /* Entirely Empty State */
        <div className="p-12 text-center bg-surface rounded-xl border border-dashed border-border-medium flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Calendar size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-text-primary">
              {dict.noShows}
            </h4>
            <p className="text-xs text-text-secondary mt-1 max-w-sm">
              {isKa
                ? 'ამ ჯგუფისთვის შოუები ჯერ არ არის დაგეგმილი. გამოიყენეთ „შოუს დაგეგმვა“ ახალი ღონისძიების დასამატებლად.'
                : 'No shows scheduled for this group yet. Use "Book Show" to schedule a new performance.'}
            </p>
          </div>
          {onBookShow && (
            <button
              type="button"
              onClick={onBookShow}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-pill text-xs font-semibold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>{dict.bookShow}</span>
            </button>
          )}
        </div>
      ) : displayedShows.length === 0 ? (
        /* Filter-Specific Empty State */
        <div className="p-8 text-center bg-surface rounded-xl border border-dashed border-border-medium flex flex-col items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center text-text-secondary">
            {activeFilter === 'upcoming' ? <CalendarDays size={20} /> : <History size={20} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary m-0">
              {activeFilter === 'upcoming'
                ? (isKa ? 'მომავალი შოუები არ არის' : 'No Upcoming Shows')
                : (isKa ? 'ისტორია ცარიელია' : 'No Past Shows')}
            </h4>
            <p className="text-xs text-text-secondary mt-1 max-w-sm m-0">
              {activeFilter === 'upcoming'
                ? isKa
                  ? `ყველა არსებული შოუ დასრულებულია. შეგიძლიათ გადახვიდეთ ისტორიაზე (${pastShows.length}) ან დაგეგმოთ ახალი.`
                  : `All existing shows have completed. You can view past history (${pastShows.length}) or book a new show.`
                : isKa
                ? 'ამ ჯგუფს ჯერ არცერთი შოუ არ ჩაუტარებია.'
                : 'This group has no completed shows yet.'}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {activeFilter === 'upcoming' && pastShows.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter('past')}
                className="px-3.5 py-1.5 rounded-pill text-xs font-semibold bg-surface-secondary border border-border-subtle text-text-primary hover:bg-surface-tertiary transition-all cursor-pointer flex items-center gap-1.5"
              >
                <History size={12} />
                <span>{isKa ? `ისტორიის ნახვა (${pastShows.length})` : `View History (${pastShows.length})`}</span>
              </button>
            )}
            {onBookShow && (
              <button
                type="button"
                onClick={onBookShow}
                className="px-3.5 py-1.5 rounded-pill text-xs font-semibold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus size={12} />
                <span>{dict.bookShow}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Regular List of Shows for the Active Filter */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedShows.map((show) => renderShowCard(show, isShowPast(show)))}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          Collapsible Past Shows Accordion (Visible on 'upcoming' tab if past shows exist)
         ────────────────────────────────────────────────────────────────── */}
      {activeFilter === 'upcoming' && upcomingShows.length > 0 && pastShows.length > 0 && (
        <div className="mt-2 pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => setIsPastAccordionOpen((prev) => !prev)}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-surface-secondary/60 hover:bg-surface-secondary border border-border-subtle transition-all cursor-pointer text-xs font-semibold text-text-secondary hover:text-text-primary"
          >
            <div className="flex items-center gap-2">
              <History size={14} className="text-text-tertiary" />
              <span>
                {isKa
                  ? `შოუების ისტორია / დასრულებული (${pastShows.length})`
                  : `Past Show History (${pastShows.length})`}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-normal text-text-tertiary">
              <span>{isPastAccordionOpen ? (isKa ? 'აკეცვა' : 'Collapse') : (isKa ? 'ჩამოშლა' : 'Expand')}</span>
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${
                  isPastAccordionOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {isPastAccordionOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 animate-in fade-in duration-200">
              {pastShows.map((show) => renderShowCard(show, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
