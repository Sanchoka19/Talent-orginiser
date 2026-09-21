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
      toast.error(isKa ? 'გთხოვთ შეავსოთ სავალდებულო ველები და აირჩიოთ მინიმუმ ერთი უფლება' : 'Please fill in required fields and select a role');
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

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    color: 'var(--color-charcoal)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box'
  };

  const labelBase: React.CSSProperties = {
    fontSize: '0.775rem',
    fontWeight: 650,
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(35, 35, 35, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          width: '100%',
          maxWidth: '520px',
          height: '100vh',
          maxHeight: '100vh',
          boxShadow: 'var(--shadow-modal)',
          borderLeft: '1px solid var(--border-subtle)',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(30,106,255,0.06) 0%, transparent 60%)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px var(--brand-primary-glow)'
                }}
              >
                <User size={18} color="#fff" strokeWidth={2.2} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0 }}>
                  {isKa ? 'თანამშრომლის დამატება' : 'Add Staff Member'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {isKa ? 'ახალი ანგარიშის შექმნა სისტემაში' : 'Create new account in system'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              transition: 'all 0.15s'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '24px 28px',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {/* Full Name */}
          <div>
            <label style={labelBase}>
              <User size={13} />
              {isKa ? 'სახელი და გვარი' : 'Full Name'}
            </label>
            <input
              id="cu-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isKa ? 'მაგ. სანდრო ჩოკორაია' : 'e.g. Sandro Chokoraia'}
              style={{
                ...inputBase,
                borderColor: errors.fullName ? '#EF4444' : 'var(--border-subtle)'
              }}
            />
            {errors.fullName && (
              <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={labelBase}>
              <Mail size={13} />
              {isKa ? 'ელ-ფოსტა' : 'Email'}
            </label>
            <input
              id="cu-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sandro@artistent.com"
              style={{
                ...inputBase,
                borderColor: errors.email ? '#EF4444' : 'var(--border-subtle)'
              }}
            />
            {errors.email && (
              <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Role selector - ONLY CREATED ROLES */}
          <div>
            <label style={labelBase}>
              <ShieldCheck size={13} />
              {isKa ? 'როლი სისტემაში' : 'Role in System'}
            </label>

            {roles.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1.5px dashed var(--border-medium)',
                  background: 'var(--bg-surface-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontSize: '0.85rem', fontWeight: 650 }}>
                  <ShieldAlert size={17} />
                  <span>{isKa ? 'როლები ჯერ არ არის შექმნილი' : 'No roles created yet'}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, maxWidth: '360px' }}>
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
                    style={{
                      marginTop: '6px',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--brand-primary)',
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: 650,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px var(--brand-primary-glow)'
                    }}
                  >
                    <ShieldPlus size={14} />
                    <span>{isKa ? 'როლის შექმნა' : 'Create Role'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: roles.length === 1 ? '1fr' : roles.length === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px'
                }}
              >
                {roles.map((r) => {
                  const isSelected = activeRole === r.id;
                  const badgeColor = r.badgeColor || 'var(--brand-primary)';
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoleId(r.id)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '10px',
                        border: isSelected
                          ? `2px solid ${badgeColor}`
                          : '1.5px solid var(--border-subtle)',
                        background: isSelected ? `${badgeColor}14` : 'var(--bg-surface-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 650,
                          color: isSelected ? badgeColor : 'var(--color-charcoal)',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}
                      >
                        {r.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          color: isSelected ? badgeColor : 'var(--color-text-secondary)',
                          fontWeight: 500
                        }}
                      >
                        {r.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.role && (
              <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                {errors.role}
              </span>
            )}
          </div>

          {/* Authorization Section with Email Invite toggle */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ ...labelBase, marginBottom: 0 }}>
                <Key size={13} />
                {isKa ? 'ავტორიზაცია' : 'Authorization'}
              </label>
              {!sendInvite && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 4px'
                  }}
                >
                  <RefreshCw size={12} />
                  {isKa ? 'პაროლის გენერირება' : 'Generate Password'}
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
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: sendInvite
                  ? '1.5px solid var(--brand-primary)'
                  : '1.5px solid var(--border-subtle)',
                background: sendInvite
                  ? 'rgba(30, 106, 255, 0.06)'
                  : 'var(--bg-surface-secondary)',
                cursor: 'pointer',
                marginBottom: sendInvite ? '0' : '10px',
                transition: 'all 0.15s'
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '5px',
                  border: sendInvite
                    ? 'none'
                    : '1.5px solid var(--border-medium)',
                  background: sendInvite ? 'var(--brand-primary)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'all 0.15s'
                }}
              >
                {sendInvite && <Check size={12} strokeWidth={3} />}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 650,
                    color: sendInvite ? 'var(--brand-primary)' : 'var(--color-charcoal)'
                  }}
                >
                  {isKa ? 'მოწვევის ბმულის გაგზავნა მეილზე' : 'Send invitation link via email'}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary)',
                    marginTop: '2px',
                    lineHeight: 1.4
                  }}
                >
                  {isKa
                    ? 'თანამშრომელი მეილზე მიიღებს ლინკს და პაროლს თვითონ დააყენებს'
                    : 'Employee will receive an email link and set their own password'}
                </div>
              </div>
            </div>

            {/* If sendInvite is false, show temporary password input */}
            {!sendInvite && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    id="cu-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isKa ? 'დროებითი პაროლი' : 'Temporary password'}
                    style={{
                      ...inputBase,
                      paddingRight: '40px',
                      borderColor: errors.password ? '#EF4444' : 'var(--border-subtle)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                    {errors.password}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              flexShrink: 0
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {isKa ? 'გაუქმება' : 'Cancel'}
            </button>
            <button
              id="cu-submit-btn"
              type="submit"
              disabled={isSubmitting || roles.length === 0}
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                background:
                  isSubmitting || roles.length === 0
                    ? 'rgba(30,106,255,0.45)'
                    : 'var(--brand-primary)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 650,
                cursor: isSubmitting || roles.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: isSubmitting || roles.length === 0 ? 'none' : '0 4px 14px var(--brand-primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: '15px',
                      height: '15px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite'
                    }}
                  />
                  {sendInvite
                    ? (isKa ? 'იგზავნება...' : 'Sending...')
                    : (isKa ? 'იქმნება...' : 'Creating...')}
                </>
              ) : (
                <>
                  {sendInvite ? <Send size={15} /> : <User size={15} />}
                  {sendInvite
                    ? (isKa ? 'მოწვევის გაგზავნა' : 'Send Invite')
                    : (isKa ? 'ანგარიშის შექმნა' : 'Create Account')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
