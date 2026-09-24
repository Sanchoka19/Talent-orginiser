'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { NavTab } from '../common/Sidebar';
import { ShowEvent } from '../../types/schedule';
import { Talent } from '../../types/talent';
import { HotelVenue } from '../../types/venue';
import { EventDetailModal } from '../calendar/EventDetailModal';
import { TalentDetailDrawer } from '../talent/TalentDetailDrawer';
import { GenderBadge } from '../common/Badge';
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldAlert,
  Building,
  Activity,
  FileWarning,
  Bus,
  Package,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewSchedule: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewSchedule,
  onNavigateTab
}) => {
  const { talents, groups, venues, schedule } = useApp();
  const { t, language } = useLanguage();

  const [selectedEvent, setSelectedEvent] = useState<ShowEvent | null>(null);
  const [selectedTalentForDrawer, setSelectedTalentForDrawer] = useState<Talent | null>(null);
  const [expandedDuties, setExpandedDuties] = useState<Record<string, boolean>>({});

  const today = new Date();
  // Build date string from LOCAL time (not UTC) to avoid timezone offset issues
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Group, Venue, and Talent lookup maps
  const groupMap = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);
  const venueMap = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);
  const talentMap = useMemo(() => new Map(talents.map((t) => [t.id, t])), [talents]);

  // 1. Today's Shows
  const todayShows = useMemo(() => {
    return schedule
      .filter((ev) => ev.startDateTime.startsWith(todayStr) && ev.status !== 'Cancelled')
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }, [schedule, todayStr]);

  // 2. Weekly Metrics (Monday to Sunday of current week) & 7-day sparkline chart data
  const { weeklyStats, weekDaysChart } = useMemo(() => {
    const d = new Date(today);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekShows = schedule.filter((ev) => {
      if (ev.status === 'Cancelled') return false;
      const evDate = new Date(ev.startDateTime);
      return evDate >= monday && evDate <= sunday;
    });

    const nowTime = Date.now();
    const completed = weekShows.filter((ev) => new Date(ev.endDateTime).getTime() < nowTime).length;
    const remaining = weekShows.length - completed;

    // Build 7-day sparkline bar data
    const dayLabelsKa = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'];
    const dayLabelsEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayLabelsTr = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    const chartDays = [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const curDate = new Date(monday);
      curDate.setDate(monday.getDate() + i);
      const curStr = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, '0')}-${String(curDate.getDate()).padStart(2, '0')}`;
      const isToday = curStr === todayStr;
      const curTime = curDate.getTime();
      const isPast = curTime + 86400000 <= nowTime;

      const dayShows = weekShows.filter((ev) => ev.startDateTime.startsWith(curStr));
      const label =
        language === 'ka' ? dayLabelsKa[i] : language === 'tr' ? dayLabelsTr[i] : dayLabelsEn[i];

      return {
        label,
        dateStr: curStr,
        count: dayShows.length,
        isToday,
        isPast
      };
    });

    const maxCount = Math.max(1, ...chartDays.map((c) => c.count));

    return {
      weeklyStats: {
        total: weekShows.length,
        completed,
        remaining
      },
      weekDaysChart: {
        days: chartDays,
        maxCount
      }
    };
  }, [schedule, today, todayStr, language]);

  // 3. Talent Status Breakdown
  const talentStats = useMemo(() => {
    const total = talents.length;
    const active = talents.filter((t) => t.status === 'Active').length;
    const rest = talents.filter((t) => t.status === 'Rest').length;
    const sick = talents.filter((t) => t.status === 'Sick/Injured').length;
    const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
    const restPercent = total > 0 ? Math.round((rest / total) * 100) : 0;
    const sickPercent = total > 0 ? Math.round((sick / total) * 100) : 0;

    return { total, active, rest, sick, activePercent, restPercent, sickPercent };
  }, [talents]);

  // 4. Active Venues (Hotels with scheduled shows or active bookings)
  const occupiedVenuesCount = useMemo(() => {
    const upcomingHotelIds = new Set(
      schedule
        .filter((ev) => ev.status !== 'Cancelled' && new Date(ev.endDateTime).getTime() >= Date.now() - 86400000)
        .map((ev) => ev.hotelId)
    );

    // If today has shows, prioritize venues booked today
    const todayHotelIds = new Set(todayShows.map((ev) => ev.hotelId));
    return todayHotelIds.size > 0 ? todayHotelIds.size : upcomingHotelIds.size;
  }, [schedule, todayShows]);


  // 6. Action Required Alerts:
  // a) Sick or Injured Performer Alerts
  const sickTalents = useMemo(() => {
    return talents.filter((t) => t.status === 'Sick/Injured');
  }, [talents]);

  // b) Expiring / Expired Documents (within 30 days)
  const documentAlerts = useMemo(() => {
    const alerts: {
      talentId: string;
      talentName: string;
      talentObj: Talent;
      docName: string;
      docType: string;
      expiryDate: string;
      daysRemaining: number;
      isExpired: boolean;
    }[] = [];

    const now = Date.now();

    talents.forEach((tal) => {
      tal.documents.forEach((doc) => {
        if (doc.expiryDate) {
          const expTime = new Date(doc.expiryDate).getTime();
          const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));

          if (diffDays <= 30) {
            alerts.push({
              talentId: tal.id,
              talentName: `${tal.firstName} ${tal.lastName}`,
              talentObj: tal,
              docName: doc.name,
              docType: doc.type,
              expiryDate: doc.expiryDate,
              daysRemaining: diffDays,
              isExpired: diffDays < 0
            });
          }
        }
      });
    });

    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [talents]);

  // c) Group Inventory Shortages
  const inventoryShortageAlerts = useMemo(() => {
    const shortages: {
      groupId: string;
      groupName: string;
      itemName: string;
      requiredGender: string;
      requiredCount: number;
      activeCount: number;
    }[] = [];

    groups.forEach((group) => {
      const activeMembers = talents.filter(
        (t) => group.memberTalentIds.includes(t.id) && t.status === 'Active'
      );
      const activeMales = activeMembers.filter((t) => t.gender === 'Male').length;
      const activeFemales = activeMembers.filter((t) => t.gender === 'Female').length;

      group.inventoryRequirements.forEach((item) => {
        let available = 0;
        let genderLabel = '';

        if (item.assignedGender === 'Male Only') {
          available = activeMales;
          genderLabel = language === 'ka' ? 'მამაკაცი' : 'Male';
        } else if (item.assignedGender === 'Female Only') {
          available = activeFemales;
          genderLabel = language === 'ka' ? 'ქალი' : 'Female';
        } else {
          available = activeMembers.length;
          genderLabel = language === 'ka' ? 'ნებისმიერი' : 'Any';
        }

        if (available < item.requiredHeadcount) {
          shortages.push({
            groupId: group.id,
            groupName: group.name,
            itemName: item.itemName,
            requiredGender: genderLabel,
            requiredCount: item.requiredHeadcount,
            activeCount: available
          });
        }
      });
    });

    return shortages;
  }, [groups, talents, language]);

  const totalAlertsCount = sickTalents.length + documentAlerts.length + inventoryShortageAlerts.length;

  // Helper for Live Time Badge
  const getLiveTimeBadge = (ev: ShowEvent) => {
    const now = Date.now();
    const start = new Date(ev.startDateTime).getTime();
    const end = new Date(ev.endDateTime).getTime();

    if (now >= start && now <= end) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <span>{language === 'ka' ? 'მიმდინარეობს' : 'Live in Progress'}</span>
        </span>
      );
    }

    if (now > end) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-surface-secondary dark:text-text-tertiary dark:border-border-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          <span>{language === 'ka' ? 'დასრულდა' : 'Completed'}</span>
        </span>
      );
    }

    const diffMs = start - now;
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins <= 60 && diffMins > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 shadow-xs animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>{language === 'ka' ? `იწყება ${diffMins} წთ-ში` : `Starts in ${diffMins}m`}</span>
        </span>
      );
    }

    if (diffMins <= 180 && diffMins > 60) {
      const hours = Math.floor(diffMins / 60);
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>{language === 'ka' ? `იწყება ${hours} სთ-ში` : `Starts in ${hours}h`}</span>
        </span>
      );
    }

    // Call time / lobby time indicator
    if (ev.lobbyTime) {
      const [lh, lm] = ev.lobbyTime.split(':').map(Number);
      const lDate = new Date(ev.startDateTime);
      lDate.setHours(lh, lm, 0, 0);
      const lobbyDiff = Math.round((lDate.getTime() - now) / (1000 * 60));

      if (lobbyDiff > 0 && lobbyDiff <= 120) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>{language === 'ka' ? `შეკრება: ${lobbyDiff} წთ-ში` : `Call time: in ${lobbyDiff}m`}</span>
          </span>
        );
      }
    }

    return null;
  };



  return (
    <div className="flex flex-col gap-6 w-full max-w-none">
      {/* Header Banner & Quick Action Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight m-0">
            {t('dashboard_title')}
          </h1>
          <p className="text-sm text-text-secondary mt-1 m-0">
            {t('dashboard_subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2.5 items-center flex-wrap">
          <button
            onClick={() => onNavigateTab('calendar')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200/80 dark:border-border-subtle bg-white dark:bg-surface text-text-primary hover:bg-slate-50 dark:hover:bg-surface-secondary hover:border-slate-300 dark:hover:border-border-medium transition-all duration-150 cursor-pointer shadow-xs"
          >
            <Calendar size={15} />
            <span>{t('view_calendar')}</span>
          </button>

          <button
            onClick={onOpenNewSchedule}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-primary text-white shadow-xs hover:bg-brand-primary-hover transition-all duration-150 cursor-pointer"
          >
            <Plus size={16} />
            <span>{t('btn_book_show')}</span>
          </button>
        </div>
      </div>

      {/* 1. TOP KPI METRIC CARDS (3-COLUMN GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI 1: Talent Status & Availability */}
        <div
          onClick={() => onNavigateTab('talents')}
          className="bg-white dark:bg-surface rounded-xl border border-slate-200/80 dark:border-border-subtle p-5 shadow-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-primary/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('active_talents_stat')}
              </span>
              <div className="w-8.5 h-8.5 rounded-lg bg-blue-500/10 text-brand-primary flex items-center justify-center shrink-0 border border-blue-500/20">
                <Users size={17} />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
              {talentStats.active}{' '}
              <span className="text-sm font-medium text-text-secondary">/ {talentStats.total}</span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-2 rounded-full overflow-hidden flex gap-1 p-0.5 bg-slate-100 dark:bg-surface-secondary mb-3">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${talentStats.total > 0 ? (talentStats.active / talentStats.total) * 100 : 0}%` }}
                title={`${talentStats.active} Active`}
              />
              {talentStats.rest > 0 && (
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(talentStats.rest / talentStats.total) * 100}%` }}
                  title={`${talentStats.rest} Rest`}
                />
              )}
              {talentStats.sick > 0 && (
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${(talentStats.sick / talentStats.total) * 100}%` }}
                  title={`${talentStats.sick} Sick/Injured`}
                />
              )}
            </div>
          </div>

          {/* Status Breakdown Dots */}
          <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-slate-100 dark:border-border-subtle/50">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              {talentStats.active} {t('status_active')}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              {talentStats.rest} {t('status_rest')}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {talentStats.sick} {t('status_sick')}
            </span>
          </div>
        </div>

        {/* KPI 2: This Week's Shows (With 7-Day Sparkline) */}
        <div
          onClick={() => onNavigateTab('calendar')}
          className="bg-white dark:bg-surface rounded-xl border border-slate-200/80 dark:border-border-subtle p-5 shadow-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-primary/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('weeks_shows_stat')}
              </span>
              <div className="w-8.5 h-8.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Activity size={17} />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                {weeklyStats.total}{' '}
                <span className="text-sm font-medium text-text-secondary">{t('shows')}</span>
              </div>
            </div>

            {/* 7-Day Micro Bar Chart (Sparkline) */}
            <div className="flex items-end justify-between gap-1.5 h-10 my-2 px-1">
              {weekDaysChart.days.map((d, idx) => {
                const heightPercent =
                  d.count === 0 ? 15 : Math.max(25, Math.round((d.count / weekDaysChart.maxCount) * 100));

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end group/bar relative"
                    title={`${d.label}: ${d.count} ${t('shows')}`}
                  >
                    <div
                      className={`w-full rounded-sm transition-all duration-200 ${d.isToday
                          ? 'bg-brand-primary shadow-xs ring-1 ring-brand-primary/40'
                          : d.count > 0
                            ? d.isPast
                              ? 'bg-slate-300 dark:bg-slate-600'
                              : 'bg-blue-400 dark:bg-blue-500'
                            : 'bg-slate-100 dark:bg-surface-secondary'
                        }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span
                      className={`text-[10px] leading-none ${d.isToday
                          ? 'font-bold text-brand-primary'
                          : 'font-medium text-text-tertiary'
                        }`}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-text-secondary pt-2 border-t border-slate-100 dark:border-border-subtle/50 font-medium">
            {t('shows_completed_remaining', {
              completed: weeklyStats.completed,
              remaining: weeklyStats.remaining
            })}
          </div>
        </div>

        {/* KPI 3: Active Hotel Venues */}
        <div
          onClick={() => onNavigateTab('venues')}
          className="bg-white dark:bg-surface rounded-xl border border-slate-200/80 dark:border-border-subtle p-5 shadow-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-primary/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('active_venues_stat')}
              </span>
              <div className="w-8.5 h-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Building size={17} />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
              {occupiedVenuesCount}{' '}
              <span className="text-sm font-medium text-text-secondary">/ {venues.length}</span>
            </div>

            {/* Venue Occupancy Mini Pills */}
            <div className="flex items-center gap-1.5 my-2.5">
              {venues.slice(0, 4).map((v, i) => {
                const isBooked = i < occupiedVenuesCount;
                return (
                  <div
                    key={v.id}
                    className={`flex-1 h-2 rounded-full transition-all ${isBooked
                        ? 'bg-blue-600 dark:bg-blue-500 shadow-xs'
                        : 'bg-slate-200 dark:bg-surface-secondary'
                      }`}
                    title={`${v.name}: ${isBooked ? (language === 'ka' ? 'დაკავებულია' : 'Occupied') : (language === 'ka' ? 'თავისუფალია' : 'Available')}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="text-xs text-text-secondary pt-2 border-t border-slate-100 dark:border-border-subtle/50 font-medium">
            {t('active_venues_occupied_free', {
              occupied: occupiedVenuesCount,
              free: Math.max(0, venues.length - occupiedVenuesCount)
            })}
          </div>
        </div>

      </div>

      {/* 2. MAIN 12-COLUMN WORKSPACE (8 COLS MAIN, 4 COLS RIGHT RAIL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* LEFT SECTION (8 COLUMNS) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* A. TODAY'S SHOWS & TIMELINE */}
          <div className="bg-white dark:bg-surface rounded-xl border border-slate-200/80 dark:border-border-subtle p-5 sm:p-6 shadow-xs flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-border-subtle shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-text-primary m-0 flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-primary shrink-0" />
                  <span>{t('todays_agenda')}</span>
                </h2>
                <p className="text-xs text-text-secondary mt-0.5 m-0">
                  {t('todays_agenda_sub')}
                </p>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md ${todayShows.length > 0
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-surface-secondary text-text-secondary'
                  }`}
              >
                {todayShows.length} {todayShows.length === 1 ? t('show') : t('shows')}
              </span>
            </div>

            {/* Shows List */}
            {todayShows.length === 0 ? (
              <div className="p-10 text-center text-text-secondary flex flex-col items-center justify-center">
                <Calendar size={40} className="opacity-30 mb-3" />
                <h4 className="text-sm font-semibold text-text-primary m-0 mb-1">
                  {t('no_shows_today_dashboard')}
                </h4>
                <p className="text-xs max-w-xs leading-relaxed m-0 mb-4">
                  {t('no_shows_dashboard_sub')}
                </p>
                <button
                  onClick={onOpenNewSchedule}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-all cursor-pointer shadow-xs"
                >
                  <Plus size={14} /> {t('btn_book_show')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {todayShows.map((ev) => {
                  const group = groupMap.get(ev.groupId);
                  const venue = venueMap.get(ev.hotelId);
                  const startDate = new Date(ev.startDateTime);
                  const endDate = new Date(ev.endDateTime);
                  const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  const effectiveLobby =
                    ev.lobbyTime ||
                    (() => {
                      const travel = venue?.travelTimeMinutes ?? 45;
                      const totalM = (startDate.getHours() * 60 + startDate.getMinutes() - travel + 1440) % 1440;
                      return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
                    })();

                  const isDutiesExpanded = Boolean(expandedDuties[ev.id]);
                  const dutyCount = ev.dutyAssignments?.length || 0;

                  // Performers assigned to this show or in this group
                  const assignedTalentIds = Array.from(
                    new Set([
                      ...(ev.dutyAssignments?.flatMap((d) => d.assignedTalentIds) || []),
                      ...(group?.memberTalentIds || [])
                    ])
                  );
                  const performerObjects = assignedTalentIds
                    .map((id) => talentMap.get(id))
                    .filter(Boolean) as Talent[];

                  return (
                    <div
                      key={ev.id}
                      className="rounded-xl border border-slate-200/90 dark:border-border-subtle bg-slate-50/50 dark:bg-surface-secondary/40 p-4 transition-all duration-150 hover:border-slate-300 dark:hover:border-border-medium hover:bg-slate-50/80 dark:hover:bg-surface-secondary/60 shadow-xs"
                    >
                      {/* Top Header: Title, Group/Venue, Live Badge & Action */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-sm sm:text-base font-bold text-text-primary m-0 truncate">
                              {ev.title}
                            </h3>
                            {getLiveTimeBadge(ev)}
                          </div>

                          <div className="flex items-center gap-2.5 text-xs text-text-secondary flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-text-tertiary" />
                              {venue?.name} {venue?.roomOrBallroom ? `(${venue.roomOrBallroom})` : ''}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedEvent(ev)}
                          className="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-slate-200 dark:border-border-subtle bg-white dark:bg-surface text-text-primary hover:bg-slate-100 dark:hover:bg-surface-secondary hover:border-slate-300 dark:hover:border-border-medium transition-all shrink-0 cursor-pointer shadow-xs"
                          title={language === 'ka' ? 'მართვა & დეტალები' : 'Manage & Details'}
                        >
                          <ArrowRight size={15} />
                        </button>
                      </div>

                      {/* Operational Times and Avatar Stack Row */}
                      <div className="flex items-center justify-between bg-white dark:bg-surface rounded-lg p-3 border border-slate-200/80 dark:border-border-subtle mb-3 gap-3 flex-wrap shadow-xs">
                        {/* Gathering Lobby */}
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Bus size={14} />
                          </div>
                          <div>
                            <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">
                              {t('gathering_label')} (Lobby)
                            </div>
                            <div className="text-xs font-extrabold text-text-primary">{effectiveLobby}</div>
                          </div>
                        </div>

                        <div className="w-px h-6 bg-slate-200 dark:bg-border-subtle hidden sm:block" />

                        {/* Show Time */}
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-blue-500/10 text-brand-primary flex items-center justify-center shrink-0">
                            <Sparkles size={14} />
                          </div>
                          <div>
                            <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">
                              {t('show_time_label')}
                            </div>
                            <div className="text-xs font-extrabold text-text-primary">
                              {startTime} - {endTime}
                            </div>
                          </div>
                        </div>

                        <div className="w-px h-6 bg-slate-200 dark:bg-border-subtle hidden sm:block" />

                        {/* Performer Avatar Stack */}
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-[11px] font-semibold text-text-tertiary hidden sm:inline">
                            {language === 'ka' ? 'შემსრულებლები:' : 'Cast:'}
                          </span>
                          <div className="flex items-center">
                            {performerObjects.slice(0, 4).map((p) => (
                              <div
                                key={p.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTalentForDrawer(p);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-surface overflow-hidden -ml-2 first:ml-0 shadow-xs cursor-pointer hover:z-10 hover:scale-110 transition-transform bg-slate-200 dark:bg-surface-secondary shrink-0 relative"
                                title={`${p.firstName} ${p.lastName} (${p.primarySkill})`}
                              >
                                {p.avatarUrl ? (
                                  <img
                                    src={p.avatarUrl}
                                    alt={`${p.firstName} ${p.lastName}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-brand-primary bg-blue-50 dark:bg-blue-950/40">
                                    {p.firstName[0]}
                                    {p.lastName[0]}
                                  </div>
                                )}
                              </div>
                            ))}
                            {performerObjects.length > 4 && (
                              <div
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-surface bg-slate-100 dark:bg-surface-secondary text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center -ml-2 shadow-xs cursor-default shrink-0"
                                title={performerObjects
                                  .slice(4)
                                  .map((p) => `${p.firstName} ${p.lastName}`)
                                  .join(', ')}
                              >
                                +{performerObjects.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Collapsible Inventory & Duty Accordion */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedDuties((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }))}
                          className="flex items-center justify-between w-full px-3.5 py-2 bg-white dark:bg-surface border border-slate-200/80 dark:border-border-subtle rounded-lg text-xs font-semibold text-text-primary hover:border-slate-300 dark:hover:border-border-medium hover:bg-slate-50/60 dark:hover:bg-surface-secondary/40 transition-all cursor-pointer shadow-xs"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Package size={14} className="text-brand-primary shrink-0" />
                            <span>
                              {language === 'ka'
                                ? `ინვენტარისა და პოზიციების მორიგეობა (${dutyCount} ნივთი)`
                                : `Inventory & Stage Duties (${dutyCount} items)`}
                            </span>
                          </span>

                          <div className="flex items-center gap-1.5 text-text-secondary">
                            <span className="text-[11px] font-normal text-text-tertiary">
                              {isDutiesExpanded
                                ? language === 'ka'
                                  ? 'აკეცვა'
                                  : 'Collapse'
                                : language === 'ka'
                                  ? 'დეტალების ნახვა'
                                  : 'Expand'}
                            </span>
                            {isDutiesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </button>

                        {/* Expanded Duty Assignments */}
                        {isDutiesExpanded && (
                          <div className="mt-2 flex flex-col gap-2 pt-1 animate-in fade-in duration-150">
                            {ev.dutyAssignments && ev.dutyAssignments.length > 0 ? (
                              ev.dutyAssignments.map((duty) => {
                                const assignedTalents = duty.assignedTalentIds
                                  .map((id) => talentMap.get(id))
                                  .filter(Boolean) as Talent[];

                                return (
                                  <div
                                    key={duty.requirementId || duty.itemName}
                                    className="flex items-center justify-between text-xs px-3 py-2 bg-white dark:bg-surface rounded-lg border border-slate-200/80 dark:border-border-subtle flex-wrap gap-2 shadow-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Package size={13} className="text-text-tertiary shrink-0" />
                                      <span className="font-bold text-text-primary">{duty.itemName}</span>
                                      <span className="text-[11px] font-medium text-text-tertiary">
                                        ({duty.assignedGender})
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {assignedTalents.length > 0 ? (
                                        assignedTalents.map((tal) => (
                                          <button
                                            key={tal.id}
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedTalentForDrawer(tal);
                                            }}
                                            className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-surface-secondary px-2 py-1 rounded-md font-medium text-xs text-text-primary border border-slate-200/80 dark:border-border-subtle hover:border-brand-primary/40 transition-all cursor-pointer"
                                            title={tal.primarySkill}
                                          >
                                            <GenderBadge gender={tal.gender} />
                                            <span>
                                              {tal.firstName} {tal.lastName}
                                            </span>
                                          </button>
                                        ))
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <span className="text-rose-600 text-xs font-bold inline-flex items-center gap-1">
                                            <AlertTriangle size={12} className="shrink-0" />
                                            <span>{t('insufficient_performers')}</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedEvent(ev)}
                                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                                          >
                                            {t('btn_replace')}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs text-text-secondary italic px-2 py-1">
                                {t('no_shifts_yet')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


        </div>

        {/* RIGHT SECTION (4 COLUMNS - RIGHT RAIL) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* A. ACTION REQUIRED & ALERTS */}
          <div className="bg-white dark:bg-surface rounded-xl border border-slate-200/80 dark:border-border-subtle p-5 sm:p-6 shadow-xs flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-border-subtle shrink-0">
              <div>
                <h2 className="text-base font-bold text-text-primary m-0 flex items-center gap-2">
                  <ShieldAlert
                    size={18}
                    className={totalAlertsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}
                  />
                  <span>{t('action_required_alerts')}</span>
                </h2>
                <p className="text-xs text-text-secondary mt-0.5 m-0">
                  {totalAlertsCount > 0
                    ? `${totalAlertsCount} ${language === 'ka' ? 'შეტყობინება მოითხოვს ყურადღებას' : 'alerts requiring action'}`
                    : t('all_clear_alerts')}
                </p>
              </div>

              {totalAlertsCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50">
                  {totalAlertsCount}
                </span>
              )}
            </div>

            {/* Alerts List */}
            {totalAlertsCount === 0 ? (
              <div className="p-8 text-center text-text-secondary flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3 border border-emerald-500/20">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-semibold text-text-primary m-0 mb-1">
                  {t('all_clear_alerts')}
                </h4>
                <p className="text-xs max-w-xs leading-relaxed m-0 text-text-secondary">
                  {t('all_clear_sub')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {/* 1. Sick / Injured Performer Alert */}
                {sickTalents.map((tal) => (
                  <div
                    key={`sick-${tal.id}`}
                    className="p-3.5 rounded-xl border border-rose-200/90 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 flex flex-col gap-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-text-primary block">
                            {tal.firstName} {tal.lastName}
                          </span>
                          <span className="text-[11px] text-text-secondary">{tal.primarySkill}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white shrink-0">
                        {t('status_injury_alert')}
                      </span>
                    </div>

                    <div className="text-xs text-rose-900 dark:text-rose-300 leading-snug">
                      {t('injury_replace_needed')}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-200/60 dark:border-rose-900/40">
                      <button
                        type="button"
                        onClick={() => setSelectedTalentForDrawer(tal)}
                        className="px-2.5 py-1 text-xs font-semibold text-text-primary bg-white dark:bg-surface border border-slate-200 dark:border-border-subtle rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {t('btn_view')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const relEv = todayShows[0] || schedule[0];
                          if (relEv) setSelectedEvent(relEv);
                          else onNavigateTab('calendar');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors cursor-pointer shadow-xs"
                      >
                        {t('btn_replace')}
                      </button>
                    </div>
                  </div>
                ))}

                {/* 2. Document Expiry Alerts */}
                {documentAlerts.map((alert, idx) => (
                  <div
                    key={`doc-${alert.talentId}-${idx}`}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2 shadow-xs ${alert.isExpired
                        ? 'border-rose-200/90 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20'
                        : 'border-amber-200/90 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileWarning
                          size={16}
                          className={`shrink-0 ${alert.isExpired ? 'text-rose-600' : 'text-amber-600'}`}
                        />
                        <span className="text-xs font-bold text-text-primary truncate">
                          {alert.talentName}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${alert.isExpired ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                          }`}
                      >
                        {alert.isExpired
                          ? t('expired_days_ago', { days: Math.abs(alert.daysRemaining) })
                          : t('days_remaining', { days: alert.daysRemaining })}
                      </span>
                    </div>

                    <div className="text-xs text-text-secondary flex items-center gap-1.5 flex-wrap">
                      <FileText size={12} className="shrink-0 text-text-tertiary" />
                      <span>
                        {alert.docName} ({alert.docType}) • {alert.expiryDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedTalentForDrawer(alert.talentObj)}
                        className="px-2.5 py-1 text-xs font-semibold text-text-primary bg-white dark:bg-surface border border-slate-200 dark:border-border-subtle rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {t('btn_view')}
                      </button>
                    </div>
                  </div>
                ))}

                {/* 3. Inventory Shortage Alerts */}
                {inventoryShortageAlerts.map((shortage, idx) => (
                  <div
                    key={`shortage-${shortage.groupId}-${idx}`}
                    className="p-3.5 rounded-xl border border-rose-200/90 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 flex flex-col gap-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                        <span className="text-xs font-bold text-text-primary">{shortage.groupName}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white shrink-0">
                        {t('inventory_shortage_warning')}
                      </span>
                    </div>

                    <div className="text-xs text-rose-950 dark:text-rose-200 leading-snug">
                      {t('shortage_detail', {
                        group: shortage.groupName,
                        gender: shortage.requiredGender,
                        item: shortage.itemName,
                        active: shortage.activeCount,
                        required: shortage.requiredCount
                      })}
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onNavigateTab('groups')}
                        className="px-2.5 py-1 text-xs font-semibold text-text-primary bg-white dark:bg-surface border border-slate-200 dark:border-border-subtle rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {t('btn_replace')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Show Event Details / Duty Management Modal */}
      {selectedEvent && (
        <EventDetailModal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
        />
      )}

      {/* Talent Detail Drawer */}
      <TalentDetailDrawer
        talent={selectedTalentForDrawer}
        isOpen={Boolean(selectedTalentForDrawer)}
        onClose={() => setSelectedTalentForDrawer(null)}
        onEdit={() => {
          setSelectedTalentForDrawer(null);
          onNavigateTab('talents');
        }}
      />
    </div>
  );
};
