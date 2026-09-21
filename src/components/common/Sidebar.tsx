import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Layers,
  Building,
  Calendar,
  Settings,
  ChevronRight,
  User,
  ShieldCheck,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export type NavTab =
  | 'dashboard'
  | 'talents'
  | 'groups'
  | 'venues'
  | 'calendar'
  | '/settings/profile'
  | '/settings/roles';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenNewTalent?: () => void;
  onOpenNewGroup?: () => void;
  onOpenNewVenue?: () => void;
  onOpenNewSchedule?: () => void;
  /** Mobile overlay: whether sidebar is open */
  isOpen?: boolean;
  /** Mobile overlay: close callback */
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen = false,
  onClose
}) => {
  const { schedule } = useApp();
  const { t } = useLanguage();

  const isSettingsSubActive =
    activeTab === '/settings/profile' || activeTab === '/settings/roles';
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(true);

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todayShowsCount = useMemo(() => {
    return schedule.filter(
      (ev) => ev.startDateTime.startsWith(todayStr) && ev.status !== 'Cancelled'
    ).length;
  }, [schedule, todayStr]);

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: t('nav_dashboard'),
      icon: LayoutDashboard
    },
    {
      id: 'talents' as NavTab,
      label: t('nav_talents'),
      icon: Users
    },
    {
      id: 'groups' as NavTab,
      label: t('nav_groups'),
      icon: Layers
    },
    {
      id: 'venues' as NavTab,
      label: t('nav_venues'),
      icon: Building
    },
    {
      id: 'calendar' as NavTab,
      label: t('nav_calendar'),
      icon: Calendar
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="sidebar-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 49,
          backdropFilter: 'blur(2px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease'
        }}
      />

      <aside
        className={isOpen ? 'sidebar sidebar-open' : 'sidebar'}
        style={{
          width: '270px',
          minWidth: '270px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 18px 32px 18px',
          zIndex: 50,
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Mobile close button – only visible on mobile overlay */}
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          style={{
            display: 'none', // shown via CSS on mobile
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--bg-surface-secondary)',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)'
          }}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      {/* Top Section: Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            marginBottom: '12px'
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px var(--brand-primary-glow)',
              flexShrink: 0
            }}
          >
            <Sparkles size={18} strokeWidth={2.4} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--color-charcoal)',
                whiteSpace: 'nowrap',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {t('brand_name')}
            </span>
          </div>
        </div>

        <div style={{
          height: '1px',
          background: 'var(--border-subtle)',
          margin: '0 0 12px 0',
          borderRadius: '1px'
        }} />

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '6px 12px 6px 6px',
                  borderRadius: '12px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 650 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  background: isActive ? 'var(--brand-primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? '0 4px 14px var(--brand-primary-glow)' : 'none',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9px',
                    background: isActive
                      ? 'rgba(255, 255, 255, 0.22)'
                      : 'transparent',
                    backdropFilter: isActive ? 'blur(10px)' : 'none',
                    WebkitBackdropFilter: isActive ? 'blur(10px)' : 'none',
                    border: isActive
                      ? '1px solid rgba(255, 255, 255, 0.35)'
                      : '1px solid transparent',
                    boxShadow: isActive
                      ? 'inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 2px 6px rgba(0, 0, 0, 0.08)'
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    style={{
                      color: isActive ? '#FFFFFF' : 'inherit',
                      transition: 'all var(--transition-fast)'
                    }}
                  />
                </div>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Separator with slightly more gap & Settings Collapsible Accordion */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Main Parent Button */}
          <button
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '6px 12px 6px 6px',
              borderRadius: '12px',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              background: isSettingsSubActive ? 'rgba(30, 106, 255, 0.08)' : 'transparent',
              color: isSettingsSubActive ? 'var(--brand-primary)' : 'var(--color-charcoal)',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              if (!isSettingsSubActive) {
                e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSettingsSubActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-charcoal)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  background: isSettingsSubActive
                    ? 'rgba(30, 106, 255, 0.12)'
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Settings
                  size={19}
                  strokeWidth={isSettingsSubActive ? 2.4 : 1.8}
                  style={{
                    color: isSettingsSubActive ? 'var(--brand-primary)' : 'var(--color-text-secondary)',
                    transition: 'color var(--transition-fast)'
                  }}
                />
              </div>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em'
                }}
              >
                {t('nav_settings')}
              </span>
            </div>
            <ChevronRight
              size={16}
              style={{
                color: isSettingsSubActive ? 'var(--brand-primary)' : 'var(--color-text-secondary)',
                transform: isSettingsOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                marginRight: '2px'
              }}
            />
          </button>

          {/* Submenu Items */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: isSettingsOpen ? '140px' : '0px',
              opacity: isSettingsOpen ? 1 : 0,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              paddingLeft: '12px',
              paddingTop: isSettingsOpen ? '4px' : '0px'
            }}
          >
            {/* Submenu Item 1: Profile */}
            <button
              onClick={() => onTabChange('/settings/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '6px 12px 6px 8px',
                borderRadius: '10px',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                fontSize: '0.825rem',
                fontWeight: activeTab === '/settings/profile' ? 650 : 500,
                textAlign: 'left',
                background: activeTab === '/settings/profile' ? 'var(--brand-primary)' : 'transparent',
                color: activeTab === '/settings/profile' ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: activeTab === '/settings/profile' ? '0 4px 14px var(--brand-primary-glow)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== '/settings/profile') {
                  e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== '/settings/profile') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: activeTab === '/settings/profile' ? 'rgba(255, 255, 255, 0.22)' : 'transparent',
                  backdropFilter: activeTab === '/settings/profile' ? 'blur(10px)' : 'none',
                  WebkitBackdropFilter: activeTab === '/settings/profile' ? 'blur(10px)' : 'none',
                  border: activeTab === '/settings/profile' ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid transparent',
                  boxShadow: activeTab === '/settings/profile' ? 'inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <User
                  size={15}
                  strokeWidth={activeTab === '/settings/profile' ? 2.4 : 1.8}
                  style={{
                    color: activeTab === '/settings/profile' ? '#FFFFFF' : 'inherit',
                    transition: 'all var(--transition-fast)'
                  }}
                />
              </div>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em'
                }}
              >
                {t('settings_profile')}
              </span>
            </button>

            {/* Submenu Item 2: Roles & Permissions */}
            <button
              onClick={() => onTabChange('/settings/roles')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '6px 12px 6px 8px',
                borderRadius: '10px',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                fontSize: '0.825rem',
                fontWeight: activeTab === '/settings/roles' ? 650 : 500,
                textAlign: 'left',
                background: activeTab === '/settings/roles' ? 'var(--brand-primary)' : 'transparent',
                color: activeTab === '/settings/roles' ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: activeTab === '/settings/roles' ? '0 4px 14px var(--brand-primary-glow)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== '/settings/roles') {
                  e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== '/settings/roles') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: activeTab === '/settings/roles' ? 'rgba(255, 255, 255, 0.22)' : 'transparent',
                  backdropFilter: activeTab === '/settings/roles' ? 'blur(10px)' : 'none',
                  WebkitBackdropFilter: activeTab === '/settings/roles' ? 'blur(10px)' : 'none',
                  border: activeTab === '/settings/roles' ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid transparent',
                  boxShadow: activeTab === '/settings/roles' ? 'inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <ShieldCheck
                  size={15}
                  strokeWidth={activeTab === '/settings/roles' ? 2.4 : 1.8}
                  style={{
                    color: activeTab === '/settings/roles' ? '#FFFFFF' : 'inherit',
                    transition: 'all var(--transition-fast)'
                  }}
                />
              </div>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em'
                }}
              >
                {t('settings_roles')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Today's Shows Indicator */}
      <div>
        {/* Quick Indicator Widget: Today's Active Shows */}
        <div
          onClick={() => onTabChange('calendar')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: todayShowsCount > 0 ? 'rgba(30, 106, 255, 0.08)' : 'var(--bg-surface-secondary)',
            border: todayShowsCount > 0 ? '1px solid rgba(30, 106, 255, 0.25)' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title={t('click_to_view_calendar')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: todayShowsCount > 0 ? '#16A34A' : '#94A3B8',
                boxShadow: todayShowsCount > 0 ? '0 0 6px rgba(22, 163, 74, 0.7)' : 'none',
                flexShrink: 0
              }}
            />
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 650,
                color: 'var(--color-charcoal)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {todayShowsCount === 1
                ? t('today_active_show', { count: todayShowsCount })
                : t('today_active_shows', { count: todayShowsCount })}
            </span>
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', paddingLeft: '16px' }}>
            {t('click_to_view_calendar')}
          </span>
        </div>
      </div>
      </aside>
    </>
  );
};
