import React from 'react';
import { Sparkles, Bell, RotateCcw, Plus, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';

export type NavTab = 'dashboard' | 'talents' | 'groups' | 'venues' | 'calendar';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenNewTalent: () => void;
  onOpenNewGroup: () => void;
  onOpenNewVenue: () => void;
  onOpenNewSchedule: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewSchedule,
  onOpenNewTalent
}) => {
  const { resetAllData } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const { confirm } = useConfirm();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}
    >
      {/* Brand Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '7px 16px',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Sparkles size={14} strokeWidth={2.2} />
          </div>
          <span
            style={{
              fontSize: '0.925rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--color-charcoal)'
            }}
          >
            {t('brand_name')}

          </span>
        </div>
      </div>

      {/* Floating Pill Navigation */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}
      >
        {(['dashboard', 'talents', 'groups', 'venues', 'calendar'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const labels: Record<string, string> = {
            dashboard: t('nav_dashboard'),
            talents: t('nav_talents'),
            groups: t('nav_groups'),
            venues: t('nav_venues'),
            calendar: t('nav_calendar')
          };
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: 0,
                border: 'none',
                borderBottom: isActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                background: 'transparent',
                color: isActive ? 'var(--brand-primary)' : 'var(--color-text-secondary)',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                  e.currentTarget.style.borderBottomColor = 'var(--border-medium)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        {/* Language Switcher Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            gap: '2px'
          }}
          title="Switch Language / ენის შეცვლა"
        >
          <div style={{ padding: '0 4px 0 6px', display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
            <Globe size={13} />
          </div>
          <button
            onClick={() => setLanguage('en')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: language === 'en' ? 'var(--brand-primary)' : 'transparent',
              color: language === 'en' ? '#FFFFFF' : 'var(--color-text-secondary)',
              boxShadow: language === 'en' ? '0 2px 8px var(--brand-primary-glow)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ka')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: language === 'ka' ? 'var(--brand-primary)' : 'transparent',
              color: language === 'ka' ? '#FFFFFF' : 'var(--color-text-secondary)',
              boxShadow: language === 'ka' ? '0 2px 8px var(--brand-primary-glow)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            ქარ
          </button>
        </div>

        <button
          onClick={onOpenNewSchedule}
          className="btn btn-primary"
          title="Schedule a new show"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('btn_book_show')}</span>
        </button>

        <button
          onClick={onOpenNewTalent}
          className="btn btn-dark"
          title="Add new performer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('btn_add_talent')}</span>
        </button>

        <button
          onClick={() => {
            confirm({
              title: language === 'ka' ? 'მონაცემების გადატვირთვა' : 'Reset Demo Data',
              message: t('reset_confirm'),
              confirmLabel: language === 'ka' ? 'გადატვირთვა' : 'Reset',
              variant: 'warning',
              icon: 'refresh',
              onConfirm: () => {
                resetAllData();
              }
            });
          }}
          className="btn btn-secondary btn-icon"
          title={t('btn_reset_demo')}
        >
          <RotateCcw size={16} />
        </button>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <button
            className="btn btn-secondary btn-icon"
            title={t('btn_notifications')}
          >
            <Bell size={16} />
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--brand-primary)',
                border: '1.5px solid white'
              }}
            />
          </button>
        </div>

        {/* User avatar pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px 4px 4px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Director"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
            {t('role_director')}
          </span>
        </div>
      </div>
    </header>
  );
};
