'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { NavTab } from '../common/Sidebar';
import { ShowEvent } from '../../types/schedule';
import { EventDetailModal } from '../calendar/EventDetailModal';
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
  const [expandedDuties, setExpandedDuties] = useState<Record<string, boolean>>({});

  const today = new Date();
  // Build date string from LOCAL time (not UTC) to avoid timezone offset issues
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Group and Venue lookup maps
  const groupMap = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);
  const venueMap = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);
  const talentMap = useMemo(() => new Map(talents.map((t) => [t.id, t])), [talents]);

  // 1. Today's Shows
  const todayShows = useMemo(() => {
    return schedule
      .filter((ev) => ev.startDateTime.startsWith(todayStr) && ev.status !== 'Cancelled')
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }, [schedule, todayStr]);

  // 2. Weekly Metrics (Monday to Sunday of current week)
  const weeklyStats = useMemo(() => {
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

    return {
      total: weekShows.length,
      completed,
      remaining
    };
  }, [schedule, today]);

  // 3. Talent Status Breakdown
  const talentStats = useMemo(() => {
    const total = talents.length;
    const active = talents.filter((t) => t.status === 'Active').length;
    const rest = talents.filter((t) => t.status === 'Rest').length;
    const sick = talents.filter((t) => t.status === 'Sick/Injured').length;
    const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;

    return { total, active, rest, sick, activePercent };
  }, [talents]);

  // 4. Active Venues (Hotels that have scheduled shows)
  const activeVenuesCount = useMemo(() => {
    const upcomingHotelIds = new Set(
      schedule
        .filter((ev) => ev.status !== 'Cancelled' && new Date(ev.endDateTime).getTime() >= Date.now() - 86400000)
        .map((ev) => ev.hotelId)
    );
    return upcomingHotelIds.size;
  }, [schedule]);

  // 5. Action Required & Alerts:
  // a) Expiring / Expired Documents (within 30 days)
  const documentAlerts = useMemo(() => {
    const alerts: {
      talentId: string;
      talentName: string;
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

  // b) Group Inventory Shortages (due to inactive talent in group)
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

  const totalAlertsCount = documentAlerts.length + inventoryShortageAlerts.length;

  return (
    <div className="flex flex-col gap-7 w-full max-w-none">
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
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer"
          >
            <Calendar size={15} />
            <span>{t('view_calendar')}</span>
          </button>

          <button
            onClick={onOpenNewSchedule}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-pill text-sm font-medium bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
          >
            <Plus size={16} />
            <span>{t('btn_book_show')}</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Talent Status & Availability */}
        <div
          onClick={() => onNavigateTab('talents')}
          className="bg-surface rounded-lg border border-border-subtle p-5 shadow-sm cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-border-medium"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-text-secondary">
              {t('active_talents_stat')}
            </span>
            <div className="w-9 h-9 rounded-md bg-brand-primary flex items-center justify-center text-white shrink-0">
              <Users size={18} />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-1">
            {talentStats.active} <span className="text-sm font-medium text-text-secondary">/ {talentStats.total}</span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 rounded-pill bg-surface-secondary overflow-hidden my-2.5">
            <div
              className="h-full bg-brand-navy rounded-pill transition-all duration-500"
              style={{ width: `${talentStats.activePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              {talentStats.active} {t('status_active')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              {talentStats.rest} {t('status_rest')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-danger shrink-0" />
              {talentStats.sick} {t('status_sick')}
            </span>
          </div>
        </div>

        {/* KPI 2: This Week's Shows */}
        <div
          onClick={() => onNavigateTab('calendar')}
          className="bg-surface rounded-lg border border-border-subtle p-5 shadow-sm cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-border-medium"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-text-secondary">
              {t('weeks_shows_stat')}
            </span>
            <div className="w-9 h-9 rounded-md bg-surface-secondary flex items-center justify-center text-text-primary border border-border-subtle shrink-0">
              <Activity size={18} />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-1">
            {weeklyStats.total} <span className="text-sm font-medium text-text-secondary">{t('shows')}</span>
          </div>

          <p className="text-xs text-text-secondary mt-2 m-0">
            {t('shows_completed_remaining', {
              completed: weeklyStats.completed,
              remaining: weeklyStats.remaining
            })}
          </p>
        </div>

        {/* KPI 3: Active Hotel Venues */}
        <div
          onClick={() => onNavigateTab('venues')}
          className="bg-surface rounded-lg border border-border-subtle p-5 shadow-sm cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-border-medium"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-text-secondary">
              {t('active_venues_stat')}
            </span>
            <div className="w-9 h-9 rounded-md bg-surface-secondary flex items-center justify-center text-text-primary border border-border-subtle shrink-0">
              <Building size={18} />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-1">
            {activeVenuesCount} <span className="text-sm font-medium text-text-secondary">/ {venues.length}</span>
          </div>

          <p className="text-xs text-text-secondary mt-2 m-0">
            {t('venues_with_shows', { count: activeVenuesCount })}
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Agenda (Left) & Action Required Alerts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* LEFT: Today's Operational Agenda */}
        <div className="bg-surface rounded-lg border border-border-subtle p-6 shadow-sm flex flex-col max-h-[580px]">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border-subtle shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary m-0 flex items-center gap-2">
                <Sparkles size={18} strokeWidth={2} className="text-text-primary shrink-0" />
                <span>{t('todays_agenda')}</span>
              </h2>
              <p className="text-xs text-text-secondary mt-0.5 m-0">
                {t('todays_agenda_sub')}
              </p>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-pill ${
                todayShows.length > 0
                  ? 'bg-brand-primary text-white'
                  : 'bg-surface-secondary text-text-primary'
              }`}
            >
              {todayShows.length} {todayShows.length === 1 ? t('show') : t('shows')}
            </span>
          </div>

          {/* Shows List or Empty State */}
          {todayShows.length === 0 ? (
            <div className="p-12 text-center text-text-secondary flex flex-col items-center justify-center flex-1">
              <Calendar size={42} className="opacity-35 mb-3.5" />
              <h4 className="text-sm font-semibold text-text-primary m-0 mb-1.5">
                {t('no_shows_today_dashboard')}
              </h4>
              <p className="text-xs max-w-xs leading-relaxed m-0 mb-4">
                {t('no_shows_dashboard_sub')}
              </p>
              <button
                onClick={onOpenNewSchedule}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-pill text-xs font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary transition-all duration-150 cursor-pointer"
              >
                <Plus size={14} /> {t('btn_book_show')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1.5">
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

                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="rounded-md border border-border-subtle bg-surface-secondary p-3.5 sm:p-4 cursor-pointer transition-all duration-150 hover:border-border-medium hover:bg-surface-tertiary/40"
                  >
                    {/* Show Title & Details Header */}
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <h3 className="text-sm font-bold text-text-primary m-0">
                          {ev.title}
                        </h3>
                        <div className="flex items-center gap-2.5 mt-1 text-xs text-text-secondary flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-text-primary">
                            <Users size={13} />
                            {group?.name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {venue?.name} {venue?.roomOrBallroom ? `(${venue.roomOrBallroom})` : ''}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className="w-7.5 h-7.5 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary hover:border-border-medium transition-all shrink-0 cursor-pointer"
                        title={t('manage_duties')}
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    {/* Operational Time Blocks - Compact & Airy */}
                    <div className="flex items-center justify-between bg-surface rounded-sm px-3.5 py-2 border border-border-subtle mb-2 gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Bus size={15} strokeWidth={2} className="text-text-primary shrink-0" />
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[11px] text-text-secondary font-semibold">
                            {t('gathering_label')} (Lobby):
                          </span>
                          <span className="text-xs font-bold text-text-primary">
                            {effectiveLobby}
                          </span>
                        </div>
                      </div>

                      <div className="w-px h-4.5 bg-border-subtle" />

                      <div className="flex items-center gap-2">
                        <Sparkles size={15} strokeWidth={2} className="text-brand-primary shrink-0" />
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[11px] text-text-secondary font-semibold">
                            {t('show_time_label')}:
                          </span>
                          <span className="text-xs font-bold text-text-primary">
                            {startTime} - {endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Inventory Duty Accordion */}
                    <div className="mt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDuties((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }));
                        }}
                        className="flex items-center justify-between w-full px-3 py-1.5 bg-surface border border-border-subtle rounded-sm text-xs font-semibold text-text-primary hover:border-border-medium hover:bg-surface-secondary transition-all cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Package size={14} strokeWidth={2} className="text-text-primary shrink-0" />
                          <span>
                            {language === 'ka'
                              ? `ინვენტარის მორიგეობა (${dutyCount} ნივთი)`
                              : `Inventory Duty (${dutyCount} ${dutyCount === 1 ? 'item' : 'items'})`}
                          </span>
                        </span>

                        <div className="flex items-center text-text-secondary">
                          {isDutiesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>

                      {/* Expanded Duty Table / List */}
                      {isDutiesExpanded && (
                        <div className="mt-2 flex flex-col gap-1.5">
                          {ev.dutyAssignments && ev.dutyAssignments.length > 0 ? (
                            ev.dutyAssignments.map((duty) => {
                              const assignedTalents = duty.assignedTalentIds
                                .map((id) => talentMap.get(id))
                                .filter(Boolean);

                              return (
                                <div
                                  key={duty.requirementId || duty.itemName}
                                  className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-surface rounded-sm border border-border-subtle"
                                >
                                  <span className="font-semibold text-text-primary inline-flex items-center gap-1.5">
                                    <Package size={13} strokeWidth={2} className="shrink-0 opacity-70" />
                                    <span>{duty.itemName}</span>
                                  </span>

                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {assignedTalents.length > 0 ? (
                                      assignedTalents.map((tal) => (
                                        <span
                                          key={tal!.id}
                                          className="inline-flex items-center gap-1 bg-surface-secondary px-2 py-0.5 rounded-pill font-semibold text-xs text-text-primary border border-border-subtle"
                                        >
                                          <GenderBadge gender={tal!.gender} />
                                          <span>{tal!.firstName} {tal!.lastName}</span>
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-danger text-xs font-semibold inline-flex items-center gap-1">
                                        <AlertTriangle size={12} strokeWidth={2} className="shrink-0" />
                                        <span>{t('insufficient_performers')}</span>
                                      </span>
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

        {/* RIGHT: Action Required / Alerts Panel */}
        <div className="bg-surface rounded-lg border border-border-subtle p-6 shadow-sm flex flex-col max-h-[580px]">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border-subtle shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary m-0 flex items-center gap-2">
                <ShieldAlert size={18} className={totalAlertsCount > 0 ? 'text-danger' : 'text-emerald-600'} />
                <span>{t('action_required_alerts')}</span>
              </h2>
              <p className="text-xs text-text-secondary mt-0.5 m-0">
                {totalAlertsCount > 0
                  ? `${totalAlertsCount} ${language === 'ka' ? 'შეტყობინება მოითხოვს ყურადღებას' : 'items require your attention'}`
                  : t('all_clear_alerts')}
              </p>
            </div>

            {totalAlertsCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-pill bg-danger-light text-danger border border-danger-border">
                {totalAlertsCount}
              </span>
            )}
          </div>

          {/* Alerts Content */}
          {totalAlertsCount === 0 ? (
            <div className="p-12 text-center text-text-secondary flex flex-col items-center justify-center flex-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3.5">
                <CheckCircle2 size={26} />
              </div>
              <h4 className="text-sm font-semibold text-text-primary m-0 mb-1">
                {t('all_clear_alerts')}
              </h4>
              <p className="text-xs max-w-xs leading-relaxed m-0">
                {t('all_clear_sub')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1.5">
              {/* 1. Document Expiration Alerts */}
              {documentAlerts.map((alert, idx) => (
                <div
                  key={`doc-${alert.talentId}-${idx}`}
                  className={`flex items-start gap-3 p-3 px-3.5 rounded-md border ${
                    alert.isExpired
                      ? 'bg-danger/10 border-danger/30'
                      : 'bg-brand-primary/10 border-brand-primary/30'
                  }`}
                >
                  <FileWarning
                    size={18}
                    className={`shrink-0 mt-0.5 ${alert.isExpired ? 'text-danger' : 'text-amber-600'}`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-text-primary truncate">
                        {alert.talentName}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-pill text-white shrink-0 ${
                          alert.isExpired ? 'bg-danger' : 'bg-amber-500'
                        }`}
                      >
                        {alert.isExpired
                          ? t('expired_days_ago', { days: Math.abs(alert.daysRemaining) })
                          : t('days_remaining', { days: alert.daysRemaining })}
                      </span>
                    </div>

                    <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <FileText size={13} strokeWidth={2} className="shrink-0" />
                      <span>{alert.docName} ({alert.docType}) • {t('doc_expiring_soon')} ({alert.expiryDate})</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* 2. Inventory Shortage Alerts */}
              {inventoryShortageAlerts.map((shortage, idx) => (
                <div
                  key={`shortage-${shortage.groupId}-${idx}`}
                  className="flex items-start gap-3 p-3 px-3.5 rounded-md border bg-danger/10 border-danger/30"
                >
                  <AlertTriangle
                    size={18}
                    className="text-danger shrink-0 mt-0.5"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-text-primary truncate">
                        {shortage.groupName}
                      </span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-pill bg-danger text-white shrink-0">
                        {t('inventory_shortage_warning')}
                      </span>
                    </div>

                    <div className="text-xs text-text-primary mt-0.5 leading-relaxed">
                      {t('shortage_detail', {
                        group: shortage.groupName,
                        gender: shortage.requiredGender,
                        item: shortage.itemName,
                        active: shortage.activeCount,
                        required: shortage.requiredCount
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
};
