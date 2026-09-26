'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { NavTab } from '../common/Sidebar';
import { ShowEvent } from '../../types/schedule';
import { Talent } from '../../types/talent';
import { EventDetailModal } from '../calendar/EventDetailModal';
import { TalentDetailDrawer } from '../talent/TalentDetailDrawer';
import { ShowEventCard } from '../common/ShowEventCard';
import {
  CalendarCheck,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldAlert,
  Building,
  Activity,
  FileWarning,
  FileText
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

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const groupMap = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);
  const venueMap = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);
  const talentMap = useMemo(() => new Map(talents.map((t) => [t.id, t])), [talents]);

  // 1. Today's Shows
  const todayShows = useMemo(() => {
    return schedule
      .filter((ev) => ev.startDateTime.startsWith(todayStr) && ev.status !== 'Cancelled')
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }, [schedule, todayStr]);

  // 2. Weekly Metrics & Sparkline Data
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

    return { total, active, rest, sick };
  }, [talents]);

  // 4. Active Venues Count
  const occupiedVenuesCount = useMemo(() => {
    const upcomingHotelIds = new Set(
      schedule
        .filter((ev) => ev.status !== 'Cancelled' && new Date(ev.endDateTime).getTime() >= Date.now() - 86400000)
        .map((ev) => ev.hotelId)
    );
    const todayHotelIds = new Set(todayShows.map((ev) => ev.hotelId));
    return todayHotelIds.size > 0 ? todayHotelIds.size : upcomingHotelIds.size;
  }, [schedule, todayShows]);

  // 5. Alerts
  const sickTalents = useMemo(() => talents.filter((t) => t.status === 'Sick/Injured'), [talents]);

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

  return (
    <div className="flex flex-col gap-6 w-full max-w-none">
      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight m-0">
            {t('dashboard_title')}
          </h1>
          <p className="text-sm text-text-secondary mt-1 m-0">
            {t('dashboard_subtitle')}
          </p>
        </div>

        <div className="flex gap-2.5 items-center flex-wrap">
          <button
            onClick={() => onNavigateTab('calendar')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary transition-all cursor-pointer shadow-xs"
          >
            <Calendar size={15} />
            <span>{t('view_calendar')}</span>
          </button>

          <button
            onClick={onOpenNewSchedule}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-primary text-white shadow-xs hover:bg-brand-primary-hover transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>{t('btn_book_show')}</span>
          </button>
        </div>
      </div>

      {/* 1. TOP KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI 1: Talent Availability (Rounded Pill Segments) */}
        <div
          onClick={() => onNavigateTab('talents')}
          className="bg-surface rounded-xl border border-border-subtle p-5 shadow-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-primary/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('active_talents_stat')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-brand-primary flex items-center justify-center shrink-0 border border-blue-500/20">
                <Users size={16} />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
              {talentStats.active}{' '}
              <span className="text-sm font-medium text-text-secondary">/ {talentStats.total}</span>
            </div>

            {/* Segmented Rounded Pill Progress Bar */}
            <div className="flex items-center gap-1.5 h-2 my-2.5">
              {talentStats.active > 0 && (
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${talentStats.total > 0 ? (talentStats.active / talentStats.total) * 100 : 0}%` }}
                  title={`${talentStats.active} Active`}
                />
              )}
              {talentStats.rest > 0 && (
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${talentStats.total > 0 ? (talentStats.rest / talentStats.total) * 100 : 0}%` }}
                  title={`${talentStats.rest} Rest`}
                />
              )}
              {talentStats.sick > 0 && (
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${talentStats.total > 0 ? (talentStats.sick / talentStats.total) * 100 : 0}%` }}
                  title={`${talentStats.sick} Sick/Injured`}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border-subtle">
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

        {/* KPI 2: Weekly Shows Bar Chart */}
        <div
          onClick={() => onNavigateTab('calendar')}
          className="bg-surface rounded-xl border border-border-subtle p-5 shadow-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-primary/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('weeks_shows_stat')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Activity size={16} />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
              {weeklyStats.total}{' '}
              <span className="text-sm font-medium text-text-secondary">{t('shows')}</span>
            </div>

            {/* Sparkline Bar Chart */}
            <div className="flex items-end justify-between gap-1.5 h-12 my-2 px-1">
              {weekDaysChart.days.map((d, idx) => {
                const heightPercent =
                  d.count === 0 ? 16 : Math.max(28, Math.round((d.count / weekDaysChart.maxCount) * 100));

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group/bar relative"
                    title={`${d.label}: ${d.count} ${t('shows')}`}
                  >
                    <div
                      className={`w-full rounded-md transition-all duration-200 ${d.isToday
                          ? 'bg-brand-primary shadow-xs ring-2 ring-brand-primary/30'
                          : d.count > 0
                            ? 'bg-blue-500/80 hover:bg-blue-600'
                            : 'bg-surface-secondary'
                        }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span
                      className={`text-[10px] font-bold leading-none ${d.isToday ? 'text-brand-primary' : 'text-text-tertiary'
                        }`}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-text-secondary pt-2 border-t border-border-subtle font-medium">
            {t('shows_completed_remaining', {
              completed: weeklyStats.completed,
              remaining: weeklyStats.remaining
            })}
          </div>
        </div>

        {/* KPI 3: Active Hotel Venues */}
        <div
          onClick={() => onNavigateTab('venues')}
          className="bg-surface rounded-xl border border-border-subtle p-5 shadow-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-primary/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('active_venues_stat')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Building size={16} />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
              {occupiedVenuesCount}{' '}
              <span className="text-sm font-medium text-text-secondary">/ {venues.length}</span>
            </div>

            <div className="flex items-center gap-1.5 my-2.5">
              {venues.slice(0, 4).map((v, i) => {
                const isBooked = i < occupiedVenuesCount;
                return (
                  <div
                    key={v.id}
                    className={`flex-1 h-2 rounded-full transition-all ${isBooked ? 'bg-blue-600 dark:bg-blue-500 shadow-xs' : 'bg-surface-secondary'
                      }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="text-xs text-text-secondary pt-2 border-t border-border-subtle font-medium">
            {t('active_venues_occupied_free', {
              occupied: occupiedVenuesCount,
              free: Math.max(0, venues.length - occupiedVenuesCount)
            })}
          </div>
        </div>
      </div>

      {/* 2. MAIN 12-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-stretch">
        {/* LEFT SECTION (8 COLUMNS) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-surface rounded-xl border border-border-subtle p-5 sm:p-6 shadow-xs flex flex-col h-full justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border-subtle">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-text-primary m-0 flex items-center gap-2">
                    <CalendarCheck size={18} className="text-brand-primary shrink-0" />
                    <span>{t('todays_agenda')}</span>
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5 m-0">
                    {t('todays_agenda_sub')}
                  </p>
                </div>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${todayShows.length > 0
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'bg-surface-secondary text-text-secondary'
                    }`}
                >
                  {todayShows.length} {todayShows.length === 1 ? t('show') : t('shows')}
                </span>
              </div>

              {/* Shows List */}
              {todayShows.length === 0 ? (
                <div className="py-16 text-center text-text-secondary flex flex-col items-center justify-center">
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
                  {todayShows.map((ev) => (
                    <ShowEventCard
                      key={ev.id}
                      event={ev}
                      group={groupMap.get(ev.groupId)}
                      venue={venueMap.get(ev.hotelId)}
                      talentsMap={talentMap}
                      onSelectEvent={setSelectedEvent}
                      onSelectTalent={(tal) => setSelectedTalentForDrawer(tal)}
                      defaultExpandedDuties={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION (4 COLUMNS) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-surface rounded-xl border border-border-subtle p-5 sm:p-6 shadow-xs flex flex-col h-full justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border-subtle">
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
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50">
                    {totalAlertsCount}
                  </span>
                )}
              </div>

              {/* Alerts List */}
              {totalAlertsCount === 0 ? (
                <div className="py-16 text-center text-text-secondary flex flex-col items-center justify-center">
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
                <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {/* Sick / Injured Alerts */}
                  {sickTalents.map((tal) => (
                    <div
                      key={`sick-${tal.id}`}
                      className="p-3.5 rounded-xl border border-rose-200/90 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col gap-2.5 shadow-xs"
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

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shrink-0">
                          {t('status_injury_alert')}
                        </span>
                      </div>

                      <div className="text-xs text-rose-900 dark:text-rose-300 leading-snug">
                        {t('injury_replace_needed')}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/40">
                        <button
                          type="button"
                          onClick={() => setSelectedTalentForDrawer(tal)}
                          className="px-2.5 py-1 text-xs font-semibold text-text-primary bg-surface border border-border-subtle rounded-md hover:bg-surface-secondary transition-colors cursor-pointer"
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

                  {/* Document Alerts */}
                  {documentAlerts.map((alert, idx) => (
                    <div
                      key={`doc-${alert.talentId}-${idx}`}
                      className={`p-3.5 rounded-xl border flex flex-col gap-2.5 shadow-xs ${alert.isExpired
                          ? 'border-rose-200/90 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20'
                          : 'border-amber-200/90 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20'
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
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${alert.isExpired ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
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

                      <div className="flex items-center justify-end pt-2 border-t border-border-subtle">
                        <button
                          type="button"
                          onClick={() => setSelectedTalentForDrawer(alert.talentObj)}
                          className="px-2.5 py-1 text-xs font-semibold text-text-primary bg-surface border border-border-subtle rounded-md hover:bg-surface-secondary transition-colors cursor-pointer"
                        >
                          {t('btn_view')}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Inventory Shortages */}
                  {inventoryShortageAlerts.map((shortage, idx) => (
                    <div
                      key={`shortage-${shortage.groupId}-${idx}`}
                      className="p-3.5 rounded-xl border border-rose-200/90 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col gap-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                          <span className="text-xs font-bold text-text-primary">{shortage.groupName}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shrink-0">
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

                      <div className="flex items-center justify-end pt-2 border-t border-rose-200/60 dark:border-rose-900/40">
                        <button
                          type="button"
                          onClick={() => onNavigateTab('groups')}
                          className="px-2.5 py-1 text-xs font-semibold text-text-primary bg-surface border border-border-subtle rounded-md hover:bg-surface-secondary transition-colors cursor-pointer"
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
      </div>

      {/* Show Event Details Modal */}
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