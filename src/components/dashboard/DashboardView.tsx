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
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldAlert,
  Building,
  Activity,
  Layers,
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
  const todayStr = today.toISOString().split('T')[0];
  const localeStr = language === 'ka' ? 'ka-GE' : 'en-US';


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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', maxWidth: 'none' }}>
      {/* Header Banner & Quick Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-charcoal)', letterSpacing: '-0.03em', margin: 0 }}>
            {t('dashboard_title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
            {t('dashboard_subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigateTab('calendar')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Calendar size={15} />
            <span>{t('view_calendar')}</span>
          </button>

          <button
            onClick={onOpenNewSchedule}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>{t('btn_book_show')}</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}
      >
        {/* KPI 1: Talent Status & Availability */}
        <div
          onClick={() => onNavigateTab('talents')}
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          className="kpi-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {t('active_talents_stat')}
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Users size={18} />
            </div>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-charcoal)', marginBottom: '4px' }}>
            {talentStats.active} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>/ {talentStats.total}</span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              height: '6px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-surface-secondary)',
              overflow: 'hidden',
              marginTop: '10px',
              marginBottom: '10px'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${talentStats.activePercent}%`,
                background: 'var(--color-charcoal)',
                borderRadius: 'var(--radius-pill)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
              {talentStats.active} {t('status_active')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EAB308', flexShrink: 0 }} />
              {talentStats.rest} {t('status_rest')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              {talentStats.sick} {t('status_sick')}
            </span>
          </div>
        </div>

        {/* KPI 2: This Week's Shows */}
        <div
          onClick={() => onNavigateTab('calendar')}
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          className="kpi-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {t('weeks_shows_stat')}
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-charcoal)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <Activity size={18} />
            </div>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-charcoal)', marginBottom: '4px' }}>
            {weeklyStats.total} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{t('shows')}</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '8px 0 0 0' }}>
            {t('shows_completed_remaining', {
              completed: weeklyStats.completed,
              remaining: weeklyStats.remaining
            })}
          </p>
        </div>

        {/* KPI 3: Active Hotel Venues */}
        <div
          onClick={() => onNavigateTab('venues')}
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          className="kpi-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {t('active_venues_stat')}
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-charcoal)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <Building size={18} />
            </div>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-charcoal)', marginBottom: '4px' }}>
            {activeVenuesCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>/ {venues.length}</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '8px 0 0 0' }}>
            {t('venues_with_shows', { count: activeVenuesCount })}
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Agenda (Left) & Action Required Alerts (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px',
          width: '100%'
        }}
      >
        {/* LEFT: Today's Operational Agenda */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '580px'
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-subtle)',
              flexShrink: 0
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} strokeWidth={2} style={{ color: 'var(--color-charcoal)', flexShrink: 0 }} />
                <span>{t('todays_agenda')}</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '3px 0 0 0' }}>
                {t('todays_agenda_sub')}
              </p>
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                background: todayShows.length > 0 ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                color: todayShows.length > 0 ? '#FFFFFF' : 'var(--color-charcoal)'
              }}
            >
              {todayShows.length} {todayShows.length === 1 ? t('show') : t('shows')}
            </span>
          </div>

          {/* Shows List or Empty State */}
          {todayShows.length === 0 ? (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1
              }}
            >
              <Calendar size={42} style={{ opacity: 0.35, marginBottom: '14px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-charcoal)', margin: '0 0 6px 0' }}>
                {t('no_shows_today_dashboard')}
              </h4>
              <p style={{ fontSize: '0.825rem', maxWidth: '320px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                {t('no_shows_dashboard_sub')}
              </p>
              <button onClick={onOpenNewSchedule} className="btn btn-secondary" style={{ fontSize: '0.825rem' }}>
                <Plus size={14} /> {t('btn_book_show')}
              </button>
            </div>
          ) : (
            <div
              className="thin-scrollbar"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
                flex: 1,
                paddingRight: '6px'
              }}
            >
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
                    style={{
                      borderRadius: '14px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="agenda-show-card"
                  >
                    {/* Show Title & Details Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0 }}>
                          {ev.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.785rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                            <Users size={13} />
                            {group?.name}
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                        className="btn btn-secondary btn-icon"
                        style={{ width: '30px', height: '30px' }}
                        title={t('manage_duties')}
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    {/* Operational Time Blocks - Compact & Airy */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#FFFFFF',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: '8px',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bus size={15} strokeWidth={2} style={{ color: 'var(--color-charcoal)', flexShrink: 0 }} />
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {t('gathering_label')} (Lobby):
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                            {effectiveLobby}
                          </span>
                        </div>
                      </div>

                      <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={15} strokeWidth={2} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {t('show_time_label')}:
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                            {startTime} - {endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Inventory Duty Accordion */}
                    <div style={{ marginTop: '2px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDuties((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }));
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '6px 12px',
                          background: '#FFFFFF',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.775rem',
                          fontWeight: 600,
                          color: 'var(--color-charcoal)',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-medium)';
                          e.currentTarget.style.background = 'var(--bg-surface)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.background = '#FFFFFF';
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Package size={14} strokeWidth={2} style={{ color: 'var(--color-charcoal)', flexShrink: 0 }} />
                          <span>
                            {language === 'ka'
                              ? `ინვენტარის მორიგეობა (${dutyCount} ნივთი)`
                              : `Inventory Duty (${dutyCount} ${dutyCount === 1 ? 'item' : 'items'})`}
                          </span>
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                          {isDutiesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>

                      {/* Expanded Duty Table / List */}
                      {isDutiesExpanded && (
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {ev.dutyAssignments && ev.dutyAssignments.length > 0 ? (
                            ev.dutyAssignments.map((duty) => {
                              const assignedTalents = duty.assignedTalentIds
                                .map((id) => talentMap.get(id))
                                .filter(Boolean);

                              return (
                                <div
                                  key={duty.requirementId || duty.itemName}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '0.78rem',
                                    padding: '6px 10px',
                                    background: '#FFFFFF',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)'
                                  }}
                                >
                                  <span style={{ fontWeight: 600, color: 'var(--color-charcoal)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <Package size={13} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.7 }} />
                                    <span>{duty.itemName}</span>
                                  </span>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    {assignedTalents.length > 0 ? (
                                      assignedTalents.map((tal) => (
                                        <span
                                          key={tal!.id}
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            background: 'var(--bg-surface-secondary)',
                                            padding: '2px 8px',
                                            borderRadius: 'var(--radius-pill)',
                                            fontWeight: 600,
                                            fontSize: '0.735rem',
                                            color: 'var(--color-charcoal)'
                                          }}
                                        >
                                          <GenderBadge gender={tal!.gender} />
                                          <span>{tal!.firstName} {tal!.lastName}</span>
                                        </span>
                                      ))
                                    ) : (
                                      <span style={{ color: '#DC2626', fontSize: '0.735rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <AlertTriangle size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                                        <span>{t('insufficient_performers')}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', padding: '4px 8px' }}>
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
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '580px'
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-subtle)',
              flexShrink: 0
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color={totalAlertsCount > 0 ? '#DC2626' : '#16A34A'} />
                <span>{t('action_required_alerts')}</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '3px 0 0 0' }}>
                {totalAlertsCount > 0
                  ? `${totalAlertsCount} ${language === 'ka' ? 'შეტყობინება მოითხოვს ყურადღებას' : 'items require your attention'}`
                  : t('all_clear_alerts')}
              </p>
            </div>

            {totalAlertsCount > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  border: '1px solid #FCA5A5'
                }}
              >
                {totalAlertsCount}
              </span>
            )}
          </div>

          {/* Alerts Content */}
          {totalAlertsCount === 0 ? (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(22, 163, 74, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A',
                  marginBottom: '14px'
                }}
              >
                <CheckCircle2 size={26} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-charcoal)', margin: '0 0 4px 0' }}>
                {t('all_clear_alerts')}
              </h4>
              <p style={{ fontSize: '0.825rem', maxWidth: '300px', lineHeight: 1.5, margin: 0 }}>
                {t('all_clear_sub')}
              </p>
            </div>
          ) : (
            <div
              className="thin-scrollbar"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
                flex: 1,
                paddingRight: '6px'
              }}
            >
              {/* 1. Document Expiration Alerts */}
              {documentAlerts.map((alert, idx) => (
                <div
                  key={`doc-${alert.talentId}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: alert.isExpired ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 108, 65, 0.12)',
                    border: alert.isExpired ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 108, 65, 0.35)'
                  }}
                >
                  <FileWarning
                    size={18}
                    color={alert.isExpired ? '#DC2626' : '#EA580C'}
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                        {alert.talentName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-pill)',
                          background: alert.isExpired ? '#DC2626' : '#F59E0B',
                          color: '#FFFFFF'
                        }}
                      >
                        {alert.isExpired
                          ? t('expired_days_ago', { days: Math.abs(alert.daysRemaining) })
                          : t('days_remaining', { days: alert.daysRemaining })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.785rem', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={13} strokeWidth={2} style={{ flexShrink: 0 }} />
                      <span>{alert.docName} ({alert.docType}) • {t('doc_expiring_soon')} ({alert.expiryDate})</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* 2. Inventory Shortage Alerts */}
              {inventoryShortageAlerts.map((shortage, idx) => (
                <div
                  key={`shortage-${shortage.groupId}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <AlertTriangle
                    size={18}
                    color="#DC2626"
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                        {shortage.groupName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-pill)',
                          background: '#DC2626',
                          color: '#FFFFFF'
                        }}
                      >
                        {t('inventory_shortage_warning')}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.785rem', color: 'var(--color-text-primary)', marginTop: '2px', lineHeight: 1.4 }}>
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
