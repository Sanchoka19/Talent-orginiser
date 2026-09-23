'use client';

import React, { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
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
  activeTab: propActiveTab,
  onTabChange,
  isOpen = false,
  onClose
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { schedule } = useApp();
  const { t } = useLanguage();

  const activeTab: NavTab = useMemo(() => {
    if (propActiveTab) return propActiveTab;
    if (pathname === '/talents' || pathname.startsWith('/talents')) return 'talents';
    if (pathname === '/groups' || pathname.startsWith('/groups')) return 'groups';
    if (pathname === '/venues' || pathname.startsWith('/venues')) return 'venues';
    if (pathname === '/calendar' || pathname.startsWith('/calendar')) return 'calendar';
    if (pathname === '/settings/roles' || pathname.startsWith('/settings/roles')) return '/settings/roles';
    if (pathname === '/settings/profile' || pathname.startsWith('/settings/profile')) return '/settings/profile';
    return 'dashboard';
  }, [propActiveTab, pathname]);

  const handleTabChange = (tab: NavTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      const tabPaths: Record<NavTab, string> = {
        dashboard: '/',
        talents: '/talents',
        groups: '/groups',
        venues: '/venues',
        calendar: '/calendar',
        '/settings/profile': '/settings/profile',
        '/settings/roles': '/settings/roles'
      };
      router.push(tabPaths[tab] || '/');
    }
    if (onClose) onClose();
  };

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
        onClick={onClose}
        className={`fixed inset-0 bg-black/45 z-40 backdrop-blur-xs transition-opacity duration-200 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`w-[270px] min-w-[270px] h-screen sticky top-0 bg-surface border-r border-border-subtle flex flex-col justify-between p-6 px-4.5 pb-8 z-50 shadow-sm transition-transform duration-200 max-md:fixed max-md:left-0 max-md:top-0 ${
          isOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        }`}
      >
        {/* Mobile close button – only visible on mobile overlay */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-3.5 right-3.5 w-8 h-8 rounded-sm bg-surface-secondary text-text-secondary flex items-center justify-center cursor-pointer hover:text-text-primary"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>

        {/* Top Section: Brand & Navigation */}
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 p-2 px-3 mb-3">
            <div className="w-8.5 h-8.5 rounded-full bg-brand-primary flex items-center justify-center text-white shadow-glow shrink-0">
              <Sparkles size={18} strokeWidth={2.4} />
            </div>
            <div className="min-w-0 overflow-hidden">
              <span className="text-lg font-bold tracking-tight text-text-primary truncate block">
                {t('brand_name')}
              </span>
            </div>
          </div>

          <div className="h-px bg-border-subtle mb-3 rounded" />

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-3 w-full p-1.5 px-3 rounded-md text-sm cursor-pointer transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-brand-primary text-white font-semibold shadow-glow'
                      : 'text-text-secondary font-medium hover:bg-surface-secondary hover:text-text-primary'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 transition-all ${
                      isActive
                        ? 'bg-white/20 backdrop-blur-md border border-white/35 shadow-sm text-white'
                        : 'text-inherit'
                    }`}
                  >
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.4 : 1.8}
                      className={isActive ? 'text-white' : 'text-inherit'}
                    />
                  </div>
                  <span className="truncate tracking-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Separator & Settings Collapsible Accordion */}
          <div className="mt-4 pt-3.5 border-t border-border-subtle flex flex-col">
            {/* Main Parent Button */}
            <button
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className={`flex items-center justify-between w-full p-1.5 px-3 rounded-md text-sm font-semibold cursor-pointer transition-all ${
                isSettingsSubActive
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-primary hover:bg-surface-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 transition-all ${
                    isSettingsSubActive
                      ? 'bg-brand-primary/15 text-brand-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  <Settings
                    size={19}
                    strokeWidth={isSettingsSubActive ? 2.4 : 1.8}
                    className={isSettingsSubActive ? 'text-brand-primary' : 'text-text-secondary'}
                  />
                </div>
                <span className="truncate tracking-tight">
                  {t('nav_settings')}
                </span>
              </div>
              <ChevronRight
                size={16}
                className={`transition-transform duration-200 mr-0.5 ${
                  isSettingsOpen ? 'rotate-90' : 'rotate-0'
                } ${isSettingsSubActive ? 'text-brand-primary' : 'text-text-secondary'}`}
              />
            </button>

            {/* Submenu Items */}
            <div
              className={`overflow-hidden transition-all duration-200 flex flex-col gap-1 pl-3 ${
                isSettingsOpen ? 'max-h-36 opacity-100 pt-1' : 'max-h-0 opacity-0 pt-0'
              }`}
            >
              {/* Submenu Item 1: Profile */}
              <button
                onClick={() => handleTabChange('/settings/profile')}
                className={`flex items-center gap-2.5 w-full p-1.5 px-3 pl-2 rounded-sm text-xs cursor-pointer transition-all text-left ${
                  activeTab === '/settings/profile'
                    ? 'bg-brand-primary text-white font-semibold shadow-glow'
                    : 'text-text-secondary font-medium hover:bg-surface-secondary hover:text-text-primary'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                    activeTab === '/settings/profile'
                      ? 'bg-white/20 backdrop-blur-md border border-white/35 text-white'
                      : 'text-inherit'
                  }`}
                >
                  <User
                    size={15}
                    strokeWidth={activeTab === '/settings/profile' ? 2.4 : 1.8}
                    className={activeTab === '/settings/profile' ? 'text-white' : 'text-inherit'}
                  />
                </div>
                <span className="truncate tracking-tight">
                  {t('settings_profile')}
                </span>
              </button>

              {/* Submenu Item 2: Roles & Permissions */}
              <button
                onClick={() => handleTabChange('/settings/roles')}
                className={`flex items-center gap-2.5 w-full p-1.5 px-3 pl-2 rounded-sm text-xs cursor-pointer transition-all text-left ${
                  activeTab === '/settings/roles'
                    ? 'bg-brand-primary text-white font-semibold shadow-glow'
                    : 'text-text-secondary font-medium hover:bg-surface-secondary hover:text-text-primary'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                    activeTab === '/settings/roles'
                      ? 'bg-white/20 backdrop-blur-md border border-white/35 text-white'
                      : 'text-inherit'
                  }`}
                >
                  <ShieldCheck
                    size={15}
                    strokeWidth={activeTab === '/settings/roles' ? 2.4 : 1.8}
                    className={activeTab === '/settings/roles' ? 'text-white' : 'text-inherit'}
                  />
                </div>
                <span className="truncate tracking-tight">
                  {t('settings_roles')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Today's Shows Indicator */}
        <div>
          <div
            onClick={() => handleTabChange('calendar')}
            className={`flex flex-col gap-1 p-3 px-3.5 rounded-md cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm ${
              todayShowsCount > 0
                ? 'bg-brand-primary/10 border border-brand-primary/25'
                : 'bg-surface-secondary border border-border-subtle'
            }`}
            title={t('click_to_view_calendar')}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  todayShowsCount > 0
                    ? 'bg-emerald-600 shadow-[0_0_6px_rgba(22,163,74,0.7)]'
                    : 'bg-slate-400'
                }`}
              />
              <span className="text-xs font-bold text-text-primary truncate">
                {todayShowsCount === 1
                  ? t('today_active_show', { count: todayShowsCount })
                  : t('today_active_shows', { count: todayShowsCount })}
              </span>
            </div>
            <span className="text-[11px] text-text-secondary pl-4">
              {t('click_to_view_calendar')}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
