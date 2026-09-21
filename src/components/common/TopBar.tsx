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
  Menu
} from 'lucide-react';

interface TopBarProps {
  activeTab?: NavTab;
  onNavigateTab?: (tab: NavTab) => void;
  onMenuToggle?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeTab, onMenuToggle }) => {
  const { talents, groups, resetAllData } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const { confirm } = useConfirm();
  const toast = useToast();
  const isKa = language === 'ka';

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);



  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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
    // Optional root attribute for dark mode styling
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header
      style={{
        height: '76px',
        minHeight: '76px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 40,
        position: 'sticky',
        top: 0,
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Hamburger button – visible only on mobile via CSS */}
      <button
        className="topbar-burger-btn"
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
        style={{
          display: 'none', // shown via CSS media query
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: 'none',
          background: 'var(--bg-surface-secondary)',
          cursor: 'pointer',
          color: 'var(--color-text-primary)',
          flexShrink: 0
        }}
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      {/* Right: Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          style={{ width: '40px', height: '40px', borderRadius: '10px' }}
          title={isDarkMode ? t('theme_light') : t('theme_dark')}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* 4. Notification Center Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="btn btn-secondary btn-icon"
            style={{ width: '40px', height: '40px', borderRadius: '10px', position: 'relative' }}
            title={t('btn_notifications')}
          >
            <Bell size={18} />
            {totalAlertsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-pill)',
                  border: '2px solid white',
                  lineHeight: 1
                }}
              >
                {totalAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '340px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-lg)',
                padding: '16px',
                zIndex: 100
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                  {t('btn_notifications')} ({totalAlertsCount})
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {totalAlertsCount === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    <CheckCircle2 size={24} style={{ color: '#16A34A', margin: '0 auto 6px auto', display: 'block' }} />
                    {language === 'ka' ? 'ახალი შეტყობინებები არ არის' : 'No new notifications'}
                  </div>
                ) : (
                  <>
                    {documentAlerts.map((alert, idx) => (
                      <div
                        key={`doc-${idx}`}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'var(--bg-surface-secondary)',
                          fontSize: '0.775rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px'
                        }}
                      >
                        <FileText size={14} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>{alert.talentName}</div>
                          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.725rem' }}>
                            {alert.docName} ({alert.daysRemaining} {language === 'ka' ? 'დღე' : 'days'})
                          </div>
                        </div>
                      </div>
                    ))}

                    {inventoryShortages.map((shortage, idx) => (
                      <div
                        key={`shortage-${idx}`}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.08)',
                          fontSize: '0.775rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px'
                        }}
                      >
                        <AlertTriangle size={14} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>{shortage.groupName}</div>
                          <div style={{ color: '#EF4444', fontSize: '0.725rem' }}>
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

        {/* 5. User Profile Card & Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '4px 14px 4px 4px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Admin"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #FFFFFF'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.25 }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 650, color: 'var(--color-charcoal)' }}>
                {t('admin_full_name')}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {t('role_administrator')}
              </span>
            </div>
            <ChevronDown size={16} color="var(--color-text-secondary)" style={{ marginLeft: '2px' }} />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div
              style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                width: '240px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                  {t('admin_full_name')}
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
                  admin@artistent.com
                </div>
              </div>

              {/* Language Selection with Flags */}
              <div style={{ padding: '4px 6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 650, color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Globe size={13} />
                  <span>{isKa ? 'ინტერფეისის ენა' : (language === 'tr' ? 'Arayüz Dili' : 'Interface Language')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { code: 'ka' as const, label: 'ქართული', flag: '🇬🇪' },
                    { code: 'en' as const, label: 'English', flag: '🇬🇧' },
                    { code: 'tr' as const, label: 'Türkçe', flag: '🇹🇷' }
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
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid transparent',
                          background: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                          color: isSelected ? '#FFFFFF' : 'var(--color-charcoal)',
                          fontSize: '0.825rem',
                          fontWeight: 650,
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 2px 8px var(--brand-primary-glow)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.05rem' }}>{item.flag}</span>
                          <span>{item.label}</span>
                        </span>
                        {isSelected && <CheckCircle2 size={15} color="#FFFFFF" />}
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
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.825rem', gap: '8px', padding: '8px 12px' }}
              >
                <RotateCcw size={14} />
                <span>{t('btn_reset_demo')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
