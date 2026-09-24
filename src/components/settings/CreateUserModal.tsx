'use client';

import React, { useState, useCallback } from 'react';
import { X, User, Mail, ShieldCheck, ShieldAlert, ShieldPlus, Key, RefreshCw, Eye, EyeOff, Check, Send } from 'lucide-react';
import { SystemUser } from '../../types/user';
import { RoleDefinition } from '../../types/role';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (user: SystemUser) => void;
  roles: RoleDefinition[];
  onRequestCreateRole?: () => void;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let p = '';
  for (let i = 0; i < 12; i++) {
    p += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return p;
}

const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80',
];

function buildNewUser(fullName: string, email: string, role: string, isInvited: boolean): SystemUser {
  return {
    id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    role,
    status: isInvited ? 'invited' : 'active',
    avatarUrl: AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)],
    createdAt: new Date().toISOString()
  };
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  roles,
  onRequestCreateRole
}) => {
  const { language } = useLanguage();
  const toast = useToast();
  const isKa = language === 'ka';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [sendInvite, setSendInvite] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRole = roles.some((r) => r.id === selectedRoleId)
    ? selectedRoleId
    : (roles[0]?.id || '');

  const handleGenerate = useCallback(() => {
    setPassword(generatePassword());
    setShowPassword(true);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) {
      e.fullName = isKa ? 'სახელი და გვარი სავალდებულოა' : 'Full name is required';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = isKa ? 'სწორი ელ-ფოსტა სავალდებულოა' : 'Valid email is required';
    }
    if (roles.length === 0 || !activeRole) {
      e.role = isKa ? 'გთხოვთ ჯერ შექმნათ და აირჩიოთ როლი' : 'Please create and select a role';
    }
    if (!sendInvite && !password.trim()) {
      e.password = isKa ? 'შეიყვანეთ ან დააგენერირეთ დროებითი პაროლი' : 'Enter or generate a temporary password';
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error(
        isKa
          ? 'გთხოვთ შეავსოთ სავალდებულო ველები და აირჩიოთ მინიმუმ ერთი უფლება'
          : 'Please fill in required fields and select a role'
      );
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const newUser = buildNewUser(fullName, email, activeRole, sendInvite);

    onCreated(newUser);
    setIsSubmitting(false);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setSelectedRoleId('');
    setSendInvite(true);
    setPassword('');
    setShowPassword(false);
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex justify-end bg-surface-overlay backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-surface w-full max-w-[520px] h-screen max-h-screen shadow-modal border-l border-border-subtle flex flex-col relative overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-subtle flex items-start justify-between bg-gradient-to-br from-brand-primary/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-brand-primary flex items-center justify-center shadow-glow text-text-inverse shrink-0">
              <User className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {isKa ? 'თანამშრომლის დამატება' : 'Add Staff Member'}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {isKa ? 'ახალი ანგარიშის შექმნა სისტემაში' : 'Create new account in system'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xs bg-surface-secondary border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 flex-1 overflow-y-auto flex flex-col gap-4.5"
        >
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{isKa ? 'სახელი და გვარი' : 'Full Name'}</span>
              <span className="text-danger">*</span>
            </label>
            <input
              id="cu-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isKa ? 'მაგ. სანდრო ჩოკორაია' : 'e.g. Sandro Chokoraia'}
              className={`w-full px-3.5 py-2.5 rounded-sm border bg-surface text-text-primary text-sm outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 ${
                errors.fullName ? 'border-danger' : 'border-border-subtle'
              }`}
            />
            {errors.fullName && (
              <span className="text-xs text-danger mt-0.5 block">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{isKa ? 'ელ-ფოსტა' : 'Email'}</span>
              <span className="text-danger">*</span>
            </label>
            <input
              id="cu-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sandro@artistent.com"
              className={`w-full px-3.5 py-2.5 rounded-sm border bg-surface text-text-primary text-sm outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 ${
                errors.email ? 'border-danger' : 'border-border-subtle'
              }`}
            />
            {errors.email && (
              <span className="text-xs text-danger mt-0.5 block">
                {errors.email}
              </span>
            )}
          </div>

          {/* Role selector - ONLY CREATED ROLES */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isKa ? 'როლი სისტემაში' : 'Role in System'}</span>
              <span className="text-danger">*</span>
            </label>

            {roles.length === 0 ? (
              <div className="p-4 rounded-md border border-dashed border-border-medium bg-surface-secondary flex flex-col items-center text-center gap-2">
                <div className="flex items-center gap-2 text-status-rest-text text-sm font-semibold">
                  <ShieldAlert className="w-4.5 h-4.5" />
                  <span>{isKa ? 'როლები ჯერ არ არის შექმნილი' : 'No roles created yet'}</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed max-w-[360px]">
                  {isKa
                    ? 'თანამშრომლის დასამატებლად აუცილებელია ჯერ შეიქმნას შესაბამისი როლი „როლები და უფლებები“ განყოფილებიდან.'
                    : 'To add a staff member, you must first create an appropriate role from the Roles & Permissions tab.'}
                </p>
                {onRequestCreateRole && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestCreateRole();
                    }}
                    className="mt-1.5 px-3.5 py-1.5 rounded-md bg-brand-primary text-text-inverse text-xs font-semibold shadow-xs hover:bg-brand-primary-hover flex items-center gap-1.5 transition-all duration-150 cursor-pointer outline-none"
                  >
                    <ShieldPlus className="w-3.5 h-3.5" />
                    <span>{isKa ? 'როლის შექმნა' : 'Create Role'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roles.map((r) => {
                  const isSelected = activeRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoleId(r.id)}
                      className={`p-3 rounded-sm border text-xs cursor-pointer flex flex-col items-center gap-1 transition-all duration-150 outline-none ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold shadow-sm'
                          : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium'
                      }`}
                    >
                      <span className="font-semibold text-xs text-center truncate max-w-full">
                        {r.title}
                      </span>
                      <span className="text-[10px] text-text-secondary font-medium">
                        {r.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.role && (
              <span className="text-xs text-danger mt-0.5 block">
                {errors.role}
              </span>
            )}
          </div>

          {/* Authorization Section with Email Invite toggle */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>{isKa ? 'ავტორიზაცია' : 'Authorization'}</span>
              </label>
              {!sendInvite && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer flex items-center gap-1 p-0.5 outline-none"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isKa ? 'პაროლის გენერირება' : 'Generate Password'}</span>
                </button>
              )}
            </div>

            {/* Email Invite Checkbox / Toggle card */}
            <div
              onClick={() => {
                setSendInvite((prev) => {
                  const next = !prev;
                  if (next) {
                    setPassword('');
                    setErrors((e) => {
                      const copy = { ...e };
                      delete copy.password;
                      return copy;
                    });
                  }
                  return next;
                });
              }}
              className={`flex items-start gap-3 p-3 sm:p-3.5 rounded-sm border cursor-pointer transition-all duration-150 select-none ${
                sendInvite
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-border-subtle bg-surface-secondary hover:border-border-medium'
              } ${sendInvite ? 'mb-0' : 'mb-2.5'}`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-xs flex items-center justify-center shrink-0 mt-0.5 text-text-inverse transition-all duration-150 ${
                  sendInvite
                    ? 'bg-brand-primary'
                    : 'border border-border-medium bg-surface'
                }`}
              >
                {sendInvite && <Check className="w-3 h-3" strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <div
                  className={`text-sm font-semibold ${
                    sendInvite ? 'text-brand-primary' : 'text-text-primary'
                  }`}
                >
                  {isKa ? 'მოწვევის ბმულის გაგზავნა მეილზე' : 'Send invitation link via email'}
                </div>
                <div className="text-xs text-text-secondary mt-0.5 leading-normal">
                  {isKa
                    ? 'თანამშრომელი მეილზე მიიღებს ლინკს და პაროლს თვითონ დააყენებს'
                    : 'Employee will receive an email link and set their own password'}
                </div>
              </div>
            </div>

            {/* If sendInvite is false, show temporary password input */}
            {!sendInvite && (
              <div className="mt-2.5 flex flex-col gap-1">
                <div className="relative">
                  <input
                    id="cu-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isKa ? 'დროებითი პაროლი' : 'Temporary password'}
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-sm border bg-surface text-text-primary text-sm outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 ${
                      errors.password ? 'border-danger' : 'border-border-subtle'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer p-0.5 outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs text-danger mt-0.5 block">
                    {errors.password}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 mt-auto pt-4 border-t border-border-subtle bg-surface shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 rounded-md border border-border-subtle bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary font-medium text-sm transition-all duration-150 cursor-pointer outline-none"
            >
              {isKa ? 'გაუქმება' : 'Cancel'}
            </button>
            <button
              id="cu-submit-btn"
              type="submit"
              disabled={isSubmitting || roles.length === 0}
              className="flex-[2] py-2 px-4 rounded-md text-sm font-semibold text-text-inverse bg-brand-primary shadow-xs hover:bg-brand-primary-hover transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 outline-none disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>
                    {sendInvite
                      ? isKa
                        ? 'იგზავნება...'
                        : 'Sending...'
                      : isKa
                      ? 'იქმნება...'
                      : 'Creating...'}
                  </span>
                </>
              ) : (
                <>
                  {sendInvite ? <Send className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>
                    {sendInvite
                      ? isKa
                        ? 'მოწვევის გაგზავნა'
                        : 'Send Invite'
                      : isKa
                      ? 'ანგარიშის შექმნა'
                      : 'Create Account'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
