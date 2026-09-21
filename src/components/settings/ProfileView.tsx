import React, { useState, useRef } from 'react';
import {
  User,
  ShieldCheck,
  Bell,
  Sliders,
  Camera,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Laptop,
  Smartphone,
  LogOut,
  Save,
  CheckCircle2,
  Globe,
  Clock,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

type ProfileTab = 'personal' | 'security' | 'notifications' | 'preferences';

export const ProfileView: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();
  const isKa = language === 'ka';

  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');

  // ── Tab 1: Personal Info State ─────────────────────────────────────────────
  const [fullName, setFullName] = useState('სანდრო ჩოკორაია');
  const [email, setEmail] = useState('admin@artistent.com');
  const [phone, setPhone] = useState('+995 599 12 34 56');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Tab 2: Security State ──────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Tab 3: Notifications State ─────────────────────────────────────────────
  const [notifyShowBooking, setNotifyShowBooking] = useState(true);
  const [notifyDutyRotation, setNotifyDutyRotation] = useState(true);
  const [notifyDocExpiry, setNotifyDocExpiry] = useState(false);
  const [notifyEmailDigest, setNotifyEmailDigest] = useState(true);

  // ── Tab 4: Preferences State ───────────────────────────────────────────────
  const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<'monday' | 'sunday'>('monday');

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setAvatarUrl(tempUrl);
      toast.success(isKa ? 'პროფილის ფოტო წარმატებით განახლდა' : 'Profile photo updated successfully');
    }
  };

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error(isKa ? 'გთხოვთ მიუთითოთ სახელი და გვარი' : 'Please enter full name');
      return;
    }
    if (!email.trim()) {
      toast.error(isKa ? 'გთხოვთ მიუთითოთ ელ-ფოსტა' : 'Please enter email');
      return;
    }
    toast.success(isKa ? 'პირადი მონაცემები წარმატებით შეინახა' : 'Personal info saved successfully');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error(isKa ? 'შეიყვანეთ მიმდინარე პაროლი' : 'Enter current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error(isKa ? 'ახალი პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს' : 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(isKa ? 'ახალი პაროლები ერთმანეთს არ ემთხვევა' : 'New passwords do not match');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success(isKa ? 'პაროლი წარმატებით შეიცვალა' : 'Password changed successfully');
  };

  const handleLogout = () => {
    confirm({
      title: isKa ? 'სისტემიდან გამოსვლა' : 'Log Out',
      message: isKa
        ? 'ნამდვილად გსურთ სისტემიდან გამოსვლა? მიმდინარე სესია დაიხურება.'
        : 'Are you sure you want to log out? Your active session will be terminated.',
      confirmLabel: isKa ? 'გამოსვლა' : 'Log Out',
      variant: 'danger',
      onConfirm: () => {
        toast.info(isKa ? 'სესია დასრულებულია' : 'Session ended');
      }
    });
  };

  const handleToggleNotification = (type: 'show' | 'duty' | 'doc' | 'digest') => {
    if (type === 'show') setNotifyShowBooking((p) => !p);
    if (type === 'duty') setNotifyDutyRotation((p) => !p);
    if (type === 'doc') setNotifyDocExpiry((p) => !p);
    if (type === 'digest') setNotifyEmailDigest((p) => !p);
    toast.success(isKa ? 'შეტყობინებების პარამეტრი განახლდა' : 'Notification preference updated');
  };

  const tabs = [
    {
      id: 'personal' as ProfileTab,
      label: isKa ? 'პირადი მონაცემები' : 'Personal Data',
      icon: <User size={18} />
    },
    {
      id: 'security' as ProfileTab,
      label: isKa ? 'უსაფრთხოება' : 'Security',
      icon: <ShieldCheck size={18} />
    },
    {
      id: 'notifications' as ProfileTab,
      label: isKa ? 'შეტყობინებები' : 'Notifications',
      icon: <Bell size={18} />
    },
    {
      id: 'preferences' as ProfileTab,
      label: isKa ? 'პრეფერენციები' : 'Preferences',
      icon: <Sliders size={18} />
    }
  ];

  // ── Common Styling ─────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    color: 'var(--color-charcoal)',
    fontSize: '0.875rem',
    fontWeight: 500,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s'
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.785rem',
    fontWeight: 650,
    color: 'var(--color-text-secondary)',
    marginBottom: '7px'
  };

  return (
    <div style={{ maxWidth: '1100px', width: '100%' }}>
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '22px' }}>
        <h1 className="page-title" style={{ marginBottom: '6px' }}>
          {isKa ? 'პროფილი' : 'Profile'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
          {isKa
            ? 'თქვენი პირადი ანგარიშის დეტალები, უსაფრთხოება და სისტემური პარამეტრები'
            : 'Your personal account details, security settings, and system preferences'}
        </p>
      </div>

      {/* ── 1. Horizontal Header Tabs ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-surface-secondary)',
          padding: '5px',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '26px',
          width: 'fit-content',
          maxWidth: '100%',
          overflowX: 'auto'
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.86rem',
                fontWeight: isActive ? 650 : 500,
                background: isActive ? 'var(--brand-primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: isActive ? '0 3px 12px var(--brand-primary-glow)' : 'none',
                transition: 'all 0.18s ease-in-out',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 2. Tab Contents ───────────────────────────────────────────────── */}

      {/* TAB 1: PERSONAL DATA */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSavePersonal} style={{ maxWidth: '100%' }}>
          <div
            className="card"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '18px',
              border: '1px solid var(--border-subtle)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
            {/* Avatar & Badges Hero */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '22px',
                paddingBottom: '22px',
                borderBottom: '1px solid var(--border-subtle)',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
                <img
                  src={avatarUrl}
                  alt={fullName}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--brand-primary)',
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                  title={isKa ? 'ფოტოს შეცვლა' : 'Change photo'}
                >
                  <Camera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 750, color: 'var(--color-charcoal)', letterSpacing: '-0.02em' }}>
                  {fullName}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {email}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {/* Status Badge */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.725rem',
                      fontWeight: 650,
                      background: 'rgba(22, 163, 74, 0.08)',
                      color: '#15803D',
                      border: '1px solid rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} />
                    {isKa ? 'სისტემა აქტიურია' : 'System Active'}
                  </span>

                  {/* Role Badge */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.725rem',
                      fontWeight: 650,
                      background: '#0891B214',
                      color: '#0891B2',
                      border: '1px solid #0891B230'
                    }}
                  >
                    <ShieldCheck size={12} />
                    {isKa ? 'მენეჯმენტი' : 'Management'}
                  </span>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>
                  <User size={14} />
                  <span>{isKa ? 'სრული სახელი' : 'Full Name'}</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>
                  <Mail size={14} />
                  <span>{isKa ? 'ელ-ფოსტა' : 'Email Address'}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>
                  <Phone size={14} />
                  <span>{isKa ? 'ტელეფონის ნომერი' : 'Phone Number'}</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                  placeholder="+995 599 00 00 00"
                />
              </div>

              {/* Role Readonly Preview */}
              <div>
                <label style={labelStyle}>
                  <ShieldCheck size={14} />
                  <span>{isKa ? 'სისტემური როლი' : 'System Role'}</span>
                </label>
                <input
                  type="text"
                  value={isKa ? 'მენეჯმენტი' : 'Management'}
                  disabled
                  style={{
                    ...inputStyle,
                    background: 'var(--bg-surface-secondary)',
                    color: 'var(--color-text-secondary)',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontWeight: 650,
                  fontSize: '0.875rem'
                }}
              >
                <Save size={16} />
                <span>{isKa ? 'მონაცემების შენახვა' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY */}
      {activeTab === 'security' && (
        <div style={{ maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Change Password Card */}
          <form onSubmit={handlePasswordChange}>
            <div
              className="card"
              style={{
                background: 'var(--bg-surface)',
                borderRadius: '18px',
                border: '1px solid var(--border-subtle)',
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(30, 106, 255, 0.08)',
                    color: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Lock size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0 }}>
                    {isKa ? 'პაროლის შეცვლა' : 'Change Password'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                    {isKa
                      ? 'უსაფრთხოების გასაძლიერებლად რეგულარულად განაახლეთ თქვენი პაროლი'
                      : 'Regularly update your password to keep your account safe'}
                  </p>
                </div>
              </div>

              {/* Current Password */}
              <div>
                <label style={labelStyle}>{isKa ? 'მიმდინარე პაროლი' : 'Current Password'}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-tertiary)',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>{isKa ? 'ახალი პაროლი' : 'New Password'}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: '40px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{isKa ? 'დაადასტურეთ ახალი პაროლი' : 'Confirm New Password'}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: '40px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '9px 22px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 650 }}
                >
                  {isKa ? 'პაროლის განახლება' : 'Update Password'}
                </button>
              </div>
            </div>
          </form>

          {/* Active Sessions Card */}
          <div
            className="card"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '18px',
              border: '1px solid var(--border-subtle)',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(22, 163, 74, 0.08)',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Laptop size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0 }}>
                    {isKa ? 'აქტიური სესიები' : 'Active Sessions'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                    {isKa ? 'მოწყობილობები, სადაც თქვენი ანგარიშია ავტორიზებული' : 'Devices where your account is currently signed in'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.06)',
                  color: '#DC2626',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} />
                <span>{isKa ? 'სისტემიდან გამოსვლა' : 'Log Out'}</span>
              </button>
            </div>

            {/* Current Session Item */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Laptop size={22} style={{ color: 'var(--brand-primary)' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--color-charcoal)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Linux Workstation • Chrome (Zen Browser)</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: 'rgba(22, 163, 74, 0.12)',
                        color: '#15803D',
                        fontSize: '0.675rem',
                        fontWeight: 700
                      }}
                    >
                      {isKa ? 'ეს მოწყობილობა' : 'This Device'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Tbilisi, Georgia • IP: 178.134.x.x • {isKa ? 'აქტიური ახლა' : 'Active now'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 8px #16A34A' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16A34A' }}>Online</span>
              </div>
            </div>

            {/* Secondary Session Item */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Smartphone size={22} style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                    iPhone 15 Pro • Safari Mobile
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Tbilisi, Georgia • {isKa ? 'ბოლო აქტივობა: 2 საათის წინ' : 'Last active: 2 hours ago'}
                  </div>
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                {isKa ? 'მობილური' : 'Mobile'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div style={{ maxWidth: '100%' }}>
          <div
            className="card"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '18px',
              border: '1px solid var(--border-subtle)',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0 }}>
                {isKa ? 'შეტყობინებების პარამეტრები' : 'Notification Preferences'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                {isKa
                  ? 'მართეთ თქვენთვის სასურველი სისტემური შეხსენებები და გაფრთხილებები'
                  : 'Manage which alerts and reminders you receive from the system'}
              </p>
            </div>

            {/* Switch Item 1: Show Booking */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 650, color: 'var(--color-charcoal)' }}>
                  {isKa ? 'შოუების დაჯავშნის შეტყობინებები' : 'Show Booking Notifications'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {isKa
                    ? 'მყისიერი შეტყობინება ახალი შოუს დაჯავშნის, ცვლილების ან გაუქმების დროს'
                    : 'Instant alerts when shows are booked, modified, or canceled'}
                </div>
              </div>

              {/* iOS Style Switch */}
              <button
                type="button"
                onClick={() => handleToggleNotification('show')}
                style={{
                  width: '46px',
                  height: '26px',
                  borderRadius: '13px',
                  background: notifyShowBooking ? 'var(--brand-primary)' : '#CBD5E1',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  flexShrink: 0
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: notifyShowBooking ? '23px' : '3px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s ease'
                  }}
                />
              </button>
            </div>

            {/* Switch Item 2: Duty Rotation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 650, color: 'var(--color-charcoal)' }}>
                  {isKa ? 'მორიგეობის როტაციის შეხსენებები' : 'Duty Rotation Reminders'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {isKa
                    ? 'ავტომატური შეხსენება მორიგეობის განრიგის დაწყებამდე 24 საათით ადრე'
                    : 'Automated notification 24 hours prior to scheduled duty shifts'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleNotification('duty')}
                style={{
                  width: '46px',
                  height: '26px',
                  borderRadius: '13px',
                  background: notifyDutyRotation ? 'var(--brand-primary)' : '#CBD5E1',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  flexShrink: 0
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: notifyDutyRotation ? '23px' : '3px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s ease'
                  }}
                />
              </button>
            </div>

            {/* Switch Item 3: Document Expiry */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 650, color: 'var(--color-charcoal)' }}>
                  {isKa ? 'დოკუმენტების ვადის ამოწურვა' : 'Document Expiry Alerts'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {isKa
                    ? 'გაფრთხილება არტისტების პასპორტის, დაზღვევის ან ვიზის ვადის გასვლამდე 30 დღით ადრე'
                    : 'Warnings 30 days before performer passports, visas, or health checks expire'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleNotification('doc')}
                style={{
                  width: '46px',
                  height: '26px',
                  borderRadius: '13px',
                  background: notifyDocExpiry ? 'var(--brand-primary)' : '#CBD5E1',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  flexShrink: 0
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: notifyDocExpiry ? '23px' : '3px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s ease'
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div style={{ maxWidth: '100%' }}>
          <div
            className="card"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '18px',
              border: '1px solid var(--border-subtle)',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0 }}>
                {isKa ? 'სისტემური პრეფერენციები' : 'System Preferences'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                {isKa ? 'მოარგეთ ინტერფეისის ენა და ფორმატები თქვენს სამუშაო სტილს' : 'Customize UI language and regional formats'}
              </p>
            </div>

            {/* Language Selection */}
            <div>
              <label style={labelStyle}>
                <Globe size={14} />
                <span>{isKa ? 'ინტერფეისის ენა' : 'Interface Language'}</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {/* Georgian */}
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('ka');
                    toast.success('ენა შეიცვალა: ქართული');
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: language === 'ka' ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-subtle)',
                    background: language === 'ka' ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                    boxShadow: language === 'ka' ? '0 4px 14px var(--brand-primary-glow)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'all 0.18s ease-in-out'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem' }}>🇬🇪</span>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 650, color: language === 'ka' ? '#FFFFFF' : 'var(--color-charcoal)' }}>
                        ქართული
                      </div>
                      <div style={{ fontSize: '0.75rem', color: language === 'ka' ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-text-secondary)' }}>
                        Georgian (Default)
                      </div>
                    </div>
                  </div>
                  {language === 'ka' && <CheckCircle2 size={18} color="#FFFFFF" />}
                </button>

                {/* English */}
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    toast.success('Language changed: English');
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: language === 'en' ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-subtle)',
                    background: language === 'en' ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                    boxShadow: language === 'en' ? '0 4px 14px var(--brand-primary-glow)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'all 0.18s ease-in-out'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem' }}>🇬🇧</span>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 650, color: language === 'en' ? '#FFFFFF' : 'var(--color-charcoal)' }}>
                        English
                      </div>
                      <div style={{ fontSize: '0.75rem', color: language === 'en' ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-text-secondary)' }}>
                        United Kingdom / International
                      </div>
                    </div>
                  </div>
                  {language === 'en' && <CheckCircle2 size={18} color="#FFFFFF" />}
                </button>

                {/* Turkish */}
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('tr');
                    toast.success('Dil değiştirildi: Türkçe');
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: language === 'tr' ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-subtle)',
                    background: language === 'tr' ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                    boxShadow: language === 'tr' ? '0 4px 14px var(--brand-primary-glow)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'all 0.18s ease-in-out'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem' }}>🇹🇷</span>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 650, color: language === 'tr' ? '#FFFFFF' : 'var(--color-charcoal)' }}>
                        Türkçe
                      </div>
                      <div style={{ fontSize: '0.75rem', color: language === 'tr' ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-text-secondary)' }}>
                        Türkiye / International
                      </div>
                    </div>
                  </div>
                  {language === 'tr' && <CheckCircle2 size={18} color="#FFFFFF" />}
                </button>
              </div>
            </div>

            {/* Time Format */}
            <div>
              <label style={labelStyle}>
                <Clock size={14} />
                <span>{isKa ? 'დროის ფორმატი' : 'Time Format'}</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setTimeFormat('24h');
                    toast.success(isKa ? 'არჩეულია 24-საათიანი ფორმატი' : '24-hour format selected');
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: timeFormat === '24h' ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-subtle)',
                    background: timeFormat === '24h' ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                    boxShadow: timeFormat === '24h' ? '0 4px 14px var(--brand-primary-glow)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.18s ease-in-out'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 650, color: timeFormat === '24h' ? '#FFFFFF' : 'var(--color-charcoal)' }}>
                      {isKa ? '24 საათიანი' : '24-hour'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: timeFormat === '24h' ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-text-secondary)' }}>
                      14:30 / 21:00
                    </div>
                  </div>
                  {timeFormat === '24h' && <CheckCircle2 size={16} color="#FFFFFF" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimeFormat('12h');
                    toast.success(isKa ? 'არჩეულია 12-საათიანი (AM/PM) ფორმატი' : '12-hour format selected');
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: timeFormat === '12h' ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-subtle)',
                    background: timeFormat === '12h' ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                    boxShadow: timeFormat === '12h' ? '0 4px 14px var(--brand-primary-glow)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.18s ease-in-out'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 650, color: timeFormat === '12h' ? '#FFFFFF' : 'var(--color-charcoal)' }}>
                      {isKa ? '12 საათიანი (AM/PM)' : '12-hour (AM/PM)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: timeFormat === '12h' ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-text-secondary)' }}>
                      02:30 PM / 09:00 PM
                    </div>
                  </div>
                  {timeFormat === '12h' && <CheckCircle2 size={16} color="#FFFFFF" />}
                </button>
              </div>
            </div>

            {/* First day of week */}
            <div>
              <label style={labelStyle}>
                <Sliders size={14} />
                <span>{isKa ? 'კვირის პირველი დღე (კალენდარში)' : 'First Day of Week'}</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setFirstDayOfWeek('monday');
                    toast.success(isKa ? 'კვირის დასაწყისი: ორშაბათი' : 'First day set to Monday');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: firstDayOfWeek === 'monday' ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-subtle)',
                    background: firstDayOfWeek === 'monday' ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                    color: firstDayOfWeek === 'monday' ? '#FFFFFF' : 'var(--color-charcoal)',
                    boxShadow: firstDayOfWeek === 'monday' ? '0 4px 14px var(--brand-primary-glow)' : 'none',
                    fontWeight: 650,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease-in-out'
                  }}
                >
                  {isKa ? 'ორშაბათი' : 'Monday'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFirstDayOfWeek('sunday');
                    toast.success(isKa ? 'კვირის დასაწყისი: კვირა' : 'First day set to Sunday');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: firstDayOfWeek === 'sunday' ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-subtle)',
                    background: firstDayOfWeek === 'sunday' ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                    color: firstDayOfWeek === 'sunday' ? '#FFFFFF' : 'var(--color-charcoal)',
                    boxShadow: firstDayOfWeek === 'sunday' ? '0 4px 14px var(--brand-primary-glow)' : 'none',
                    fontWeight: 650,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease-in-out'
                  }}
                >
                  {isKa ? 'კვირა' : 'Sunday'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
