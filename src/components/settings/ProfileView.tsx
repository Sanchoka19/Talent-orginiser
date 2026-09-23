'use client';

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
  Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

type ProfileTab = 'personal' | 'security' | 'notifications' | 'preferences';

export const ProfileView: React.FC = () => {
  const { language, setLanguage } = useLanguage();
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

  const handleToggleNotification = (type: 'show' | 'duty' | 'doc') => {
    if (type === 'show') setNotifyShowBooking((p) => !p);
    if (type === 'duty') setNotifyDutyRotation((p) => !p);
    if (type === 'doc') setNotifyDocExpiry((p) => !p);
    toast.success(isKa ? 'შეტყობინებების პარამეტრი განახლდა' : 'Notification preference updated');
  };

  const tabs = [
    {
      id: 'personal' as ProfileTab,
      label: isKa ? 'პირადი მონაცემები' : 'Personal Data',
      icon: <User className="w-4 h-4" />
    },
    {
      id: 'security' as ProfileTab,
      label: isKa ? 'უსაფრთხოება' : 'Security',
      icon: <ShieldCheck className="w-4 h-4" />
    },
    {
      id: 'notifications' as ProfileTab,
      label: isKa ? 'შეტყობინებები' : 'Notifications',
      icon: <Bell className="w-4 h-4" />
    },
    {
      id: 'preferences' as ProfileTab,
      label: isKa ? 'პრეფერენციები' : 'Preferences',
      icon: <Sliders className="w-4 h-4" />
    }
  ];

  return (
    <div className="w-full max-w-[1100px] flex flex-col">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="mb-5">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mb-1.5">
          {isKa ? 'პროფილი' : 'Profile'}
        </h1>
        <p className="text-sm text-text-secondary">
          {isKa
            ? 'თქვენი პირადი ანგარიშის დეტალები, უსაფრთხოება და სისტემური პარამეტრები'
            : 'Your personal account details, security settings, and system preferences'}
        </p>
      </div>

      {/* ── 1. Horizontal Header Tabs ─────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 bg-surface-secondary p-1 rounded-md border border-border-subtle mb-6 w-fit max-w-full overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4.5 py-2 rounded-sm border-none cursor-pointer text-sm font-semibold transition-all duration-150 whitespace-nowrap outline-none ${
                isActive
                  ? 'bg-brand-primary text-text-inverse shadow-glow'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
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
        <form onSubmit={handleSavePersonal} className="w-full">
          <div className="bg-surface rounded-lg border border-border-subtle p-6 sm:p-7 flex flex-col gap-6 shadow-sm">
            {/* Avatar & Badges Hero */}
            <div className="flex items-center gap-5 pb-5 border-b border-border-subtle flex-wrap">
              <div className="relative w-20 h-20 shrink-0">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-surface shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-primary text-text-inverse border-2 border-surface flex items-center justify-center cursor-pointer shadow-sm hover:bg-brand-primary-hover transition-colors duration-150"
                  title={isKa ? 'ფოტოს შეცვლა' : 'Change photo'}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div>
                <div className="text-xl font-bold text-text-primary tracking-tight">
                  {fullName}
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {email}
                </div>

                <div className="flex gap-2 mt-2.5 flex-wrap">
                  {/* Status Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold bg-status-active-bg text-status-active-text border border-status-active-dot/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-active-dot" />
                    <span>{isKa ? 'სისტემა აქტიურია' : 'System Active'}</span>
                  </span>

                  {/* Role Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold bg-category-management/10 text-category-management border border-category-management/25">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isKa ? 'მენეჯმენტი' : 'Management'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <User className="w-3.5 h-3.5" />
                  <span>{isKa ? 'სრული სახელი' : 'Full Name'}</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface text-text-primary text-sm outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isKa ? 'ელ-ფოსტა' : 'Email Address'}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface text-text-primary text-sm outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                  required
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isKa ? 'ტელეფონის ნომერი' : 'Phone Number'}</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+995 599 00 00 00"
                  className="w-full px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface text-text-primary text-sm outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>

              {/* Role Readonly Preview */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isKa ? 'სისტემური როლი' : 'System Role'}</span>
                </label>
                <input
                  type="text"
                  value={isKa ? 'მენეჯმენტი' : 'Management'}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-secondary text-sm cursor-not-allowed outline-none"
                />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-pill font-semibold text-sm bg-brand-primary text-text-inverse shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none"
              >
                <Save className="w-4 h-4" />
                <span>{isKa ? 'მონაცემების შენახვა' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY */}
      {activeTab === 'security' && (
        <div className="w-full flex flex-col gap-5">
          {/* Change Password Card */}
          <form onSubmit={handlePasswordChange}>
            <div className="bg-surface rounded-lg border border-border-subtle p-6 sm:p-7 flex flex-col gap-4.5 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-sm bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    {isKa ? 'პაროლის შეცვლა' : 'Change Password'}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {isKa
                      ? 'უსაფრთხოების გასაძლიერებლად რეგულარულად განაახლეთ თქვენი პაროლი'
                      : 'Regularly update your password to keep your account safe'}
                  </p>
                </div>
              </div>

              {/* Current Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {isKa ? 'მიმდინარე პაროლი' : 'Current Password'}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-sm border border-border-subtle bg-surface text-text-primary text-sm outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer p-0.5 outline-none"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {isKa ? 'ახალი პაროლი' : 'New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-sm border border-border-subtle bg-surface text-text-primary text-sm outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer p-0.5 outline-none"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {isKa ? 'დაადასტურეთ ახალი პაროლი' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-sm border border-border-subtle bg-surface text-text-primary text-sm outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer p-0.5 outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1.5">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill text-sm font-semibold bg-brand-primary text-text-inverse shadow-glow hover:bg-brand-primary-hover transition-all duration-150 cursor-pointer outline-none"
                >
                  {isKa ? 'პაროლის განახლება' : 'Update Password'}
                </button>
              </div>
            </div>
          </form>

          {/* Active Sessions Card */}
          <div className="bg-surface rounded-lg border border-border-subtle p-6 sm:p-7 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-status-active-bg text-status-active-text flex items-center justify-center shrink-0">
                  <Laptop className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    {isKa ? 'აქტიური სესიები' : 'Active Sessions'}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {isKa
                      ? 'მოწყობილობები, სადაც თქვენი ანგარიშია ავტორიზებული'
                      : 'Devices where your account is currently signed in'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill border border-danger-border bg-danger-light text-danger text-xs font-semibold cursor-pointer hover:bg-danger hover:text-white transition-all duration-150 outline-none"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isKa ? 'სისტემიდან გამოსვლა' : 'Log Out'}</span>
              </button>
            </div>

            {/* Current Session Item */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-md bg-surface-secondary border border-border-subtle gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-brand-primary shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-text-primary flex items-center gap-2 flex-wrap">
                    <span>Linux Workstation • Chrome (Zen Browser)</span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-status-active-bg text-status-active-text text-[10px] font-bold border border-status-active-dot/20">
                      {isKa ? 'ეს მოწყობილობა' : 'This Device'}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    Tbilisi, Georgia • IP: 178.134.x.x • {isKa ? 'აქტიური ახლა' : 'Active now'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-status-active-dot shadow-sm" />
                <span className="text-xs font-semibold text-status-active-text">Online</span>
              </div>
            </div>

            {/* Secondary Session Item */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-md bg-surface-secondary border border-border-subtle gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-text-secondary shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-text-primary">
                    iPhone 15 Pro • Safari Mobile
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    Tbilisi, Georgia • {isKa ? 'ბოლო აქტივობა: 2 საათის წინ' : 'Last active: 2 hours ago'}
                  </div>
                </div>
              </div>

              <span className="text-xs text-text-tertiary font-medium">
                {isKa ? 'მობილური' : 'Mobile'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="w-full">
          <div className="bg-surface rounded-lg border border-border-subtle p-6 sm:p-7 flex flex-col gap-5 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {isKa ? 'შეტყობინებების პარამეტრები' : 'Notification Preferences'}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {isKa
                  ? 'მართეთ თქვენთვის სასურველი სისტემური შეხსენებები და გაფრთხილებები'
                  : 'Manage which alerts and reminders you receive from the system'}
              </p>
            </div>

            {/* Switch Item 1: Show Booking */}
            <div className="flex items-center justify-between p-4 rounded-md bg-surface-secondary border border-border-subtle gap-4">
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  {isKa ? 'შოუების დაჯავშნის შეტყობინებები' : 'Show Booking Notifications'}
                </div>
                <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  {isKa
                    ? 'მყისიერი შეტყობინება ახალი შოუს დაჯავშნის, ცვლილების ან გაუქმების დროს'
                    : 'Instant alerts when shows are booked, modified, or canceled'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleNotification('show')}
                className={`w-11 h-6 rounded-pill relative transition-colors duration-200 cursor-pointer outline-none shrink-0 ${
                  notifyShowBooking ? 'bg-brand-primary' : 'bg-border-medium'
                }`}
              >
                <span
                  className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 shadow-sm transition-all duration-200 ${
                    notifyShowBooking ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Switch Item 2: Duty Rotation */}
            <div className="flex items-center justify-between p-4 rounded-md bg-surface-secondary border border-border-subtle gap-4">
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  {isKa ? 'მორიგეობის როტაციის შეხსენებები' : 'Duty Rotation Reminders'}
                </div>
                <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  {isKa
                    ? 'ავტომატური შეხსენება მორიგეობის განრიგის დაწყებამდე 24 საათით ადრე'
                    : 'Automated notification 24 hours prior to scheduled duty shifts'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleNotification('duty')}
                className={`w-11 h-6 rounded-pill relative transition-colors duration-200 cursor-pointer outline-none shrink-0 ${
                  notifyDutyRotation ? 'bg-brand-primary' : 'bg-border-medium'
                }`}
              >
                <span
                  className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 shadow-sm transition-all duration-200 ${
                    notifyDutyRotation ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Switch Item 3: Document Expiry */}
            <div className="flex items-center justify-between p-4 rounded-md bg-surface-secondary border border-border-subtle gap-4">
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  {isKa ? 'დოკუმენტების ვადის ამოწურვა' : 'Document Expiry Alerts'}
                </div>
                <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  {isKa
                    ? 'გაფრთხილება არტისტების პასპორტის, დაზღვევის ან ვიზის ვადის გასვლამდე 30 დღით ადრე'
                    : 'Warnings 30 days before performer passports, visas, or health checks expire'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleNotification('doc')}
                className={`w-11 h-6 rounded-pill relative transition-colors duration-200 cursor-pointer outline-none shrink-0 ${
                  notifyDocExpiry ? 'bg-brand-primary' : 'bg-border-medium'
                }`}
              >
                <span
                  className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 shadow-sm transition-all duration-200 ${
                    notifyDocExpiry ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="w-full">
          <div className="bg-surface rounded-lg border border-border-subtle p-6 sm:p-7 flex flex-col gap-6 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {isKa ? 'სისტემური პრეფერენციები' : 'System Preferences'}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {isKa
                  ? 'მოარგეთ ინტერფეისის ენა და ფორმატები თქვენს სამუშაო სტილს'
                  : 'Customize UI language and regional formats'}
              </p>
            </div>

            {/* Language Selection */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <Globe className="w-3.5 h-3.5" />
                <span>{isKa ? 'ინტერფეისის ენა' : 'Interface Language'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Georgian */}
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('ka');
                    toast.success('ენა შეიცვალა: ქართული');
                  }}
                  className={`p-4 rounded-md border text-left cursor-pointer flex items-center justify-between transition-all duration-150 outline-none ${
                    language === 'ka'
                      ? 'border-brand-primary bg-brand-primary text-text-inverse shadow-glow'
                      : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🇬🇪</span>
                    <div>
                      <div className="text-sm font-semibold">
                        ქართული
                      </div>
                      <div className={`text-xs ${language === 'ka' ? 'text-white/85' : 'text-text-secondary'}`}>
                        Georgian (Default)
                      </div>
                    </div>
                  </div>
                  {language === 'ka' && <CheckCircle2 className="w-4.5 h-4.5 text-white" />}
                </button>

                {/* English */}
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    toast.success('Language changed: English');
                  }}
                  className={`p-4 rounded-md border text-left cursor-pointer flex items-center justify-between transition-all duration-150 outline-none ${
                    language === 'en'
                      ? 'border-brand-primary bg-brand-primary text-text-inverse shadow-glow'
                      : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🇬🇧</span>
                    <div>
                      <div className="text-sm font-semibold">
                        English
                      </div>
                      <div className={`text-xs ${language === 'en' ? 'text-white/85' : 'text-text-secondary'}`}>
                        United Kingdom / International
                      </div>
                    </div>
                  </div>
                  {language === 'en' && <CheckCircle2 className="w-4.5 h-4.5 text-white" />}
                </button>

                {/* Turkish */}
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('tr');
                    toast.success('Dil değiştirildi: Türkçe');
                  }}
                  className={`p-4 rounded-md border text-left cursor-pointer flex items-center justify-between transition-all duration-150 outline-none ${
                    language === 'tr'
                      ? 'border-brand-primary bg-brand-primary text-text-inverse shadow-glow'
                      : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🇹🇷</span>
                    <div>
                      <div className="text-sm font-semibold">
                        Türkçe
                      </div>
                      <div className={`text-xs ${language === 'tr' ? 'text-white/85' : 'text-text-secondary'}`}>
                        Türkiye / International
                      </div>
                    </div>
                  </div>
                  {language === 'tr' && <CheckCircle2 className="w-4.5 h-4.5 text-white" />}
                </button>
              </div>
            </div>

            {/* Time Format */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <Clock className="w-3.5 h-3.5" />
                <span>{isKa ? 'დროის ფორმატი' : 'Time Format'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTimeFormat('24h');
                    toast.success(isKa ? 'არჩეულია 24-საათიანი ფორმატი' : '24-hour format selected');
                  }}
                  className={`p-3.5 rounded-md border text-left cursor-pointer flex items-center justify-between transition-all duration-150 outline-none ${
                    timeFormat === '24h'
                      ? 'border-brand-primary bg-brand-primary text-text-inverse shadow-glow'
                      : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">
                      {isKa ? '24 საათიანი' : '24-hour'}
                    </div>
                    <div className={`text-xs ${timeFormat === '24h' ? 'text-white/85' : 'text-text-secondary'}`}>
                      14:30 / 21:00
                    </div>
                  </div>
                  {timeFormat === '24h' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimeFormat('12h');
                    toast.success(isKa ? 'არჩეულია 12-საათიანი (AM/PM) ფორმატი' : '12-hour format selected');
                  }}
                  className={`p-3.5 rounded-md border text-left cursor-pointer flex items-center justify-between transition-all duration-150 outline-none ${
                    timeFormat === '12h'
                      ? 'border-brand-primary bg-brand-primary text-text-inverse shadow-glow'
                      : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">
                      {isKa ? '12 საათიანი (AM/PM)' : '12-hour (AM/PM)'}
                    </div>
                    <div className={`text-xs ${timeFormat === '12h' ? 'text-white/85' : 'text-text-secondary'}`}>
                      02:30 PM / 09:00 PM
                    </div>
                  </div>
                  {timeFormat === '12h' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>

            {/* First day of week */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <Sliders className="w-3.5 h-3.5" />
                <span>{isKa ? 'კვირის პირველი დღე (კალენდარში)' : 'First Day of Week'}</span>
              </label>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setFirstDayOfWeek('monday');
                    toast.success(isKa ? 'კვირის დასაწყისი: ორშაბათი' : 'First day set to Monday');
                  }}
                  className={`flex-1 p-3 rounded-md border text-xs font-semibold cursor-pointer transition-all duration-150 outline-none ${
                    firstDayOfWeek === 'monday'
                      ? 'border-brand-primary bg-brand-primary text-text-inverse shadow-glow'
                      : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium'
                  }`}
                >
                  {isKa ? 'ორშაბათი' : 'Monday'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFirstDayOfWeek('sunday');
                    toast.success(isKa ? 'კვირის დასაწყისი: კვირა' : 'First day set to Sunday');
                  }}
                  className={`flex-1 p-3 rounded-md border text-xs font-semibold cursor-pointer transition-all duration-150 outline-none ${
                    firstDayOfWeek === 'sunday'
                      ? 'border-brand-primary bg-brand-primary text-text-inverse shadow-glow'
                      : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium'
                  }`}
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
