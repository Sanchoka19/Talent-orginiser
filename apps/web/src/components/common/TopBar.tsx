'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { NavTab } from './Sidebar';
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Globe,
  AlertTriangle,
  FileText,
  RotateCcw,
  CheckCircle2,
  X,
  Menu,
  Search
} from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';

interface TopBarProps {
  activeTab?: NavTab;
  onNavigateTab?: (tab: NavTab) => void;
  onMenuToggle?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { talents, groups, resetAllData, currentUser } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const { confirm } = useConfirm();
  const toast = useToast();
  const isKa = language === 'ka';

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState('⌘K');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Detect platform for shortcut label & bind global keyboard shortcut
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);
      setShortcutLabel(isMac ? '⌘K' : 'Ctrl+K');
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute alert notifications count
  const documentAlerts = useMemo(() => {
    const alerts: { talentName: string; docName: string; daysRemaining: number }[] = [];
    const now = Date.now();
    talents.forEach((tal) => {
      tal.documents.forEach((doc) => {
        if (doc.expiryDate) {
          const expTime = new Date(doc.expiryDate).getTime();
          const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
          if (diffDays <= 30) {
            alerts.push({
              talentName: `${tal.firstName} ${tal.lastName}`,
              docName: doc.name,
              daysRemaining: diffDays
            });
          }
        }
      });
    });
    return alerts;
  }, [talents]);

  const inventoryShortages = useMemo(() => {
    const shortages: { groupName: string; itemName: string }[] = [];
    groups.forEach((group) => {
      const activeMembers = talents.filter(
        (t) => group.memberTalentIds.includes(t.id) && t.status === 'Active'
      );
      const activeMales = activeMembers.filter((t) => t.gender === 'Male').length;
      const activeFemales = activeMembers.filter((t) => t.gender === 'Female').length;

      group.inventoryRequirements.forEach((item) => {
        let available = 0;
        if (item.assignedGender === 'Male Only') available = activeMales;
        else if (item.assignedGender === 'Female Only') available = activeFemales;
        else available = activeMembers.length;

        if (available < item.requiredHeadcount) {
          shortages.push({
            groupName: group.name,
            itemName: item.itemName
          });
        }
      });
    });
    return shortages;
  }, [groups, talents]);

  const totalAlertsCount = documentAlerts.length + inventoryShortages.length;

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-[68px] sm:h-[76px] min-h-[68px] sm:min-h-[76px] bg-surface border-b border-border-subtle flex items-center justify-between px-3.5 sm:px-6 lg:px-8 z-30 sticky top-0 backdrop-blur-md">
      {/* Hamburger button – visible only on mobile */}
      <button
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
        className="md:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-sm border-none bg-surface-secondary cursor-pointer text-text-primary shrink-0 mr-2 sm:mr-3"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      {/* Left: Global Command Menu / Search Input Bar */}
      <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mr-2 sm:mr-4 min-w-0">
        <div
          onClick={() => setIsGlobalSearchOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsGlobalSearchOpen(true);
            }
          }}
          className="group relative flex items-center w-full h-9 sm:h-10 px-3 sm:px-3.5 rounded-lg bg-surface-secondary border border-border-subtle hover:border-border-medium hover:bg-surface-tertiary transition-all duration-150 cursor-pointer shadow-2xs select-none"
          title={isKa ? 'გლობალური ძებნა' : 'Global Search'}
        >
          <Search
            size={16}
            className="text-text-secondary group-hover:text-brand-primary transition-colors shrink-0 mr-2 sm:mr-2.5"
          />
          <span className="w-full text-xs sm:text-sm text-text-secondary group-hover:text-text-primary truncate">
            {t('global_search_placeholder').replace(/\s*\(.*\)/, '')}
          </span>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5 ml-auto shrink-0">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-md inline-flex items-center justify-center border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer shrink-0"
          title={isDarkMode ? t('theme_light') : t('theme_dark')}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification Center Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-md inline-flex items-center justify-center border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer shrink-0 relative"
            title={t('btn_notifications')}
          >
            <Bell size={16} />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white leading-none shadow-xs">
                {totalAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute top-12 right-0 w-[290px] sm:w-[340px] max-w-[calc(100vw-32px)] bg-surface rounded-lg border border-border-subtle shadow-xl p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-sm text-text-primary">
                  {t('btn_notifications')} ({totalAlertsCount})
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary p-0"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {totalAlertsCount === 0 ? (
                  <div className="text-center p-4 text-xs text-text-secondary">
                    <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-1.5 block" />
                    {language === 'ka' ? 'ახალი შეტყობინებები არ არის' : 'No new notifications'}
                  </div>
                ) : (
                  <>
                    {documentAlerts.map((alert, idx) => (
                      <div
                        key={`doc-${idx}`}
                        className="p-2 px-2.5 rounded-md bg-surface-secondary text-xs flex items-start gap-2 border border-border-subtle"
                      >
                        <FileText size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-text-primary">{alert.talentName}</div>
                          <div className="text-text-secondary text-[11px]">
                            {alert.docName} ({alert.daysRemaining} {language === 'ka' ? 'დღე' : 'days'})
                          </div>
                        </div>
                      </div>
                    ))}

                    {inventoryShortages.map((shortage, idx) => (
                      <div
                        key={`shortage-${idx}`}
                        className="p-2 px-2.5 rounded-md bg-danger/10 text-xs flex items-start gap-2 border border-danger/25"
                      >
                        <AlertTriangle size={14} className="text-danger shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-text-primary">{shortage.groupName}</div>
                          <div className="text-danger text-[11px]">
                            {shortage.itemName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card & Dropdown */}
        <div ref={profileRef} className="relative">
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-lg bg-surface-secondary border border-border-subtle cursor-pointer hover:border-border-medium transition-all select-none shrink-0"
          >
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.fullName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white shrink-0"
            />
            <div className="hidden lg:flex flex-col text-left leading-tight max-w-[120px]">
              <span className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                {currentUser.fullName}
              </span>
              <span className="text-[11px] text-text-secondary font-medium truncate">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown size={14} className="text-text-secondary hidden sm:block shrink-0" />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute top-12 right-0 w-56 sm:w-60 max-w-[calc(100vw-32px)] bg-surface rounded-lg border border-border-subtle shadow-xl p-3 z-50 flex flex-col gap-2 animate-in fade-in duration-150">
              <div className="p-1.5 px-2 border-b border-border-subtle">
                <div className="font-semibold text-sm text-text-primary truncate">
                  {currentUser.fullName}
                </div>
                <div className="text-xs text-text-secondary truncate">
                  {currentUser.email}
                </div>
              </div>

              {/* Language Selection with Flags */}
              <div className="p-1 px-1.5 border-b border-border-subtle pb-2">
                <div className="text-[11px] font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                  <Globe size={13} />
                  <span>{isKa ? 'ინტერფეისის ენა' : (language === 'tr' ? 'Arayüz Dili' : 'Interface Language')}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    { code: 'ka' as const, label: 'ქართული' },
                    { code: 'en' as const, label: 'English' },
                    { code: 'tr' as const, label: 'Türkçe' }
                  ].map((item) => {
                    const isSelected = language === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setLanguage(item.code);
                          toast.success(
                            item.code === 'ka'
                              ? 'ენა შეიცვალა: ქართული'
                              : item.code === 'tr'
                                ? 'Dil değiştirildi: Türkçe'
                                : 'Language changed: English'
                          );
                        }}
                        className={`flex items-center justify-between p-1.5 px-2.5 rounded-sm border text-xs font-semibold cursor-pointer transition-all ${isSelected
                          ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                          : 'border-transparent bg-surface-secondary text-text-primary hover:bg-surface-tertiary'
                          }`}
                      >
                        <span>{item.label}</span>
                        {isSelected && <CheckCircle2 size={15} className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  confirm({
                    title: language === 'ka' ? 'მონაცემების გადატვირთვა' : 'Reset Demo Data',
                    message: t('reset_confirm'),
                    confirmLabel: language === 'ka' ? 'გადატვირთვა' : 'Reset',
                    variant: 'warning',
                    icon: 'refresh',
                    onConfirm: () => {
                      resetAllData();
                      toast.success(
                        isKa
                          ? 'მონაცემები გადაიტვირთა საწყის დემო მდგომარეობაში'
                          : 'Demo data reset successfully'
                      );
                    }
                  });
                }}
                className="w-full inline-flex items-center justify-start text-xs gap-2 p-2 px-3 rounded-md font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>{t('btn_reset_demo')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Search / Command Menu Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />
    </header>
  );
};
