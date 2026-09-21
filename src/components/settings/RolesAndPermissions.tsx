import React, { useState, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldPlus,
  Plus,
  CheckCircle2,
  Mail,
  MoreVertical,
  Trash2,
  Key,
  Edit3,
  UserCheck,
  Clock
} from 'lucide-react';
import { SystemUser, UserRoleId } from '../../types/user';
import { CreateUserModal } from './CreateUserModal';
import { CreateRoleModal } from './CreateRoleModal';
import { RoleDefinition, PERMISSION_LABELS_KA, PERMISSION_LABELS_EN, ROLE_TEMPLATES } from '../../types/role';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';

// ─── Types ──────────────────────────────────────────────────────────────────

type PageTab = 'users' | 'roles';

// ─── Static data ─────────────────────────────────────────────────────────────

const ROLES_LIST: RoleDefinition[] = [
  {
    id: 'management',
    title: 'მენეჯმენტი',
    badge: 'მენეჯმენტი',
    badgeColor: '#0891B2',
    desc: 'ეს დონე მოიცავს შოუების დაგეგმვას, ტალანტების მართვასა და როტაციების კონტროლს.',
    permissions: [
      'schedule:view',
      'schedule:book',
      'talents:view',
      'talents:edit',
      'groups:manage',
      'duty:override'
    ]
  }
];

const ROLE_LABEL: Record<string, string> = {
  management: 'მენეჯმენტი',
  operations: 'საოპერაციო ან საველე მართვა',
  custom: 'მორგებული',
  admin: 'ადმინისტრატორი',
  director: 'დირექტორი',
  stage_manager: 'Stage Manager'
};

const ROLE_BADGE_COLOR: Record<string, string> = {
  management: '#0891B2',
  operations: '#16A34A',
  admin: '#7C3AED',
  director: '#0891B2',
  stage_manager: '#16A34A'
};

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'u-seed-1',
    fullName: 'სანდრო ჩოკორაია',
    email: 'admin@artistent.com',
    role: 'management',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10T09:00:00.000Z'
  }
];

// ─── Main Component ──────────────────────────────────────────────────────────

export const RolesAndPermissions: React.FC = () => {
  const { language } = useLanguage();
  const { confirm } = useConfirm();
  const toast = useToast();
  const isKa = language === 'ka';

  const [activeTab, setActiveTab] = useState<PageTab>('roles');
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [roles, setRoles] = useState<RoleDefinition[]>(ROLES_LIST);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingRoleFor, setEditingRoleFor] = useState<string | null>(null);

  // ── Role display helpers ───────────────────────────────────────────────────
  const getRoleLabel = useCallback((roleId: string) => {
    const found = roles.find((r) => r.id === roleId);
    if (found) return found.title;
    return ROLE_LABEL[roleId as UserRoleId] || roleId;
  }, [roles]);

  const getRoleBadgeColor = useCallback((roleId: string) => {
    const found = roles.find((r) => r.id === roleId);
    if (found) return found.badgeColor;
    return ROLE_BADGE_COLOR[roleId as UserRoleId] || 'var(--brand-primary)';
  }, [roles]);

  // ── Role actions ───────────────────────────────────────────────────────────
  const handleRoleCreated = useCallback((newRole: RoleDefinition) => {
    setRoles((p) => [...p, newRole]);
  }, []);

  const handleRoleUpdated = useCallback((updatedRole: RoleDefinition) => {
    setRoles((p) => p.map((r) => r.id === updatedRole.id ? updatedRole : r));
    setEditingRole(null);
  }, []);

  const handleDeleteRole = useCallback((role: RoleDefinition) => {
    const isSystemRole =
      role.id === 'admin' ||
      role.id === 'operations' ||
      role.id === 'management' ||
      (role as any).isSystem;

    if (isSystemRole) {
      toast.error(isKa ? 'სისტემური როლის წაშლა შეუძლებელია' : 'System role cannot be deleted');
      return;
    }

    confirm({
      title: isKa ? 'როლის წაშლა' : 'Delete Role',
      message: isKa
        ? `ნამდვილად გსურთ როლის „${role.title}“ წაშლა?`
        : `Are you sure you want to delete role "${role.title}"?`,
      itemName: role.title,
      confirmLabel: isKa ? 'წაშლა' : 'Delete',
      variant: 'danger',
      onConfirm: () => {
        setRoles((p) => p.filter((r) => r.id !== role.id));
        toast.success(isKa ? 'როლი წარმატებით წაიშალა' : 'Role deleted successfully');
      }
    });
  }, [confirm, toast, isKa]);

  // ── User actions ───────────────────────────────────────────────────────────
  const handleUserCreated = useCallback((user: SystemUser) => {
    setUsers((p) => [user, ...p]);
    toast.success(isKa ? `თანამშრომელი „${user.fullName}“ წარმატებით დაემატა` : `Staff member "${user.fullName}" added successfully`);
  }, [toast, isKa]);

  const handleDeleteUser = useCallback((id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    setOpenMenuId(null);
    confirm({
      title: isKa ? 'თანამშრომლის წაშლა' : 'Delete Staff Member',
      message: isKa
        ? `ნამდვილად გსურთ ${user.fullName}-ს ანგარიშის წაშლა? თანამშრომელი დაკარგავს წვდომას სისტემაზე.`
        : `Are you sure you want to remove ${user.fullName}? They will lose access to the system.`,
      itemName: `${user.fullName} (${user.email})`,
      confirmLabel: isKa ? 'წაშლა' : 'Delete',
      variant: 'danger',
      onConfirm: () => {
        setUsers((p) => p.filter((u) => u.id !== id));
        toast.success(isKa ? `თანამშრომელი „${user.fullName}“ წაიშალა` : `Staff member "${user.fullName}" removed`);
      }
    });
  }, [users, toast, confirm, isKa]);

  const handleRoleChange = useCallback((userId: string, newRole: UserRoleId) => {
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    setEditingRoleFor(null);
    setOpenMenuId(null);
    toast.success(isKa ? `როლი განახლდა: ${ROLE_LABEL[newRole]}` : `Role updated: ${ROLE_LABEL[newRole]}`);
  }, [toast, isKa]);

  const handleResetPassword = useCallback((userId: string) => {
    const user = users.find((u) => u.id === userId);
    setOpenMenuId(null);
    if (user) toast.success(isKa ? `პაროლის განახლების ბმული გაიგზავნა ${user.email}-ზე` : `Password reset link sent to ${user.email}`);
  }, [users, toast, isKa]);

  // ── Shared styles ──────────────────────────────────────────────────────────
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    outline: 'none',
    fontSize: '0.875rem',
    fontWeight: active ? 650 : 500,
    cursor: 'pointer',
    background: active ? 'var(--brand-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--color-text-secondary)',
    boxShadow: active ? '0 4px 14px var(--brand-primary-glow)' : 'none',
    transition: 'all 0.18s',
    display: 'flex',
    alignItems: 'center',
    gap: '7px'
  });

  return (
    <div className="w-full" style={{ width: '100%' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: '6px' }}>
          {isKa ? 'როლები და წვდომები' : 'Roles & Permissions'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          {isKa
            ? 'სისტემური მომხმარებლების მართვა, როლების განაწილება და უსაფრთხოების წვდომის დონეები'
            : 'System user management, role assignments, and security permission levels'}
        </p>
      </div>

      {/* Tab bar + CTA */}
      <div
        className="w-full flex items-center justify-between mb-6"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: '16px'
        }}
      >
        {/* Segmented tabs */}
        <div
          className="flex items-center gap-3"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px',
            borderRadius: '12px',
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <button
            id="tab-roles"
            onClick={() => setActiveTab('roles')}
            style={tabBtn(activeTab === 'roles')}
          >
            <ShieldCheck size={15} />
            {isKa ? 'როლები და უფლებები' : 'Roles & Permissions'}
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              background: activeTab === 'roles' ? 'rgba(255,255,255,0.25)' : 'var(--brand-primary)',
              color: '#fff',
              borderRadius: '20px', padding: '1px 7px'
            }}>
              {roles.length}
            </span>
          </button>
          <button
            id="tab-users"
            onClick={() => setActiveTab('users')}
            style={tabBtn(activeTab === 'users')}
          >
            <Users size={15} />
            {isKa ? 'თანამშრომლები' : 'Staff'}
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              background: activeTab === 'users' ? 'rgba(255,255,255,0.25)' : 'var(--brand-primary)',
              color: '#fff',
              borderRadius: '20px', padding: '1px 7px'
            }}>
              {users.length}
            </span>
          </button>
        </div>

        {/* CTA button */}
        <button
          id={activeTab === 'roles' ? 'btn-add-role' : 'btn-add-user'}
          onClick={() => {
            if (activeTab === 'roles') {
              setIsCreateRoleModalOpen(true);
            } else {
              setIsCreateModalOpen(true);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--brand-primary)',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 650,
            cursor: 'pointer',
            boxShadow: '0 4px 14px var(--brand-primary-glow)',
            transition: 'all 0.15s',
            flexShrink: 0
          }}
        >
          <Plus size={16} />
          {activeTab === 'roles'
            ? (isKa ? 'ახალი როლის შექმნა' : 'Create Role')
            : (isKa ? 'თანამშრომლის დამატება' : 'Add Staff')}
        </button>
      </div>

      {/* ── Users Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map((user) => (
            <div
              key={user.id}
              className="card"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                padding: '16px 20px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                position: 'relative',
                transition: 'all var(--transition-fast)'
              }}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-subtle)' }}
                  />
                ) : (
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '50%',
                    background: 'rgba(30,106,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--brand-primary)', fontWeight: 700, fontSize: '1.1rem'
                  }}>
                    {user.fullName.charAt(0)}
                  </div>
                )}
                {/* Online dot */}
                {user.status === 'active' && (
                  <span style={{
                    position: 'absolute', bottom: '1px', right: '1px',
                    width: '11px', height: '11px', borderRadius: '50%',
                    background: '#16A34A',
                    border: '2px solid var(--bg-surface)',
                    boxShadow: '0 0 5px rgba(22,163,74,0.6)'
                  }} />
                )}
              </div>

              {/* Name + email */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 650, color: 'var(--color-charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.fullName}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <Mail size={12} />
                  {user.email}
                </div>
              </div>

              {/* Role badge */}
              {editingRoleFor === user.id ? (
                <div style={{ position: 'relative' }}>
                  <select
                    autoFocus
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRoleId)}
                    onBlur={() => setEditingRoleFor(null)}
                    style={{
                      padding: '5px 10px', borderRadius: '8px',
                      border: '2px solid var(--brand-primary)',
                      background: 'var(--bg-surface)',
                      color: 'var(--color-charcoal)',
                      fontSize: '0.8rem', fontWeight: 600,
                      cursor: 'pointer', outline: 'none'
                    }}
                  >
                    {roles.length > 0 ? (
                      roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))
                    ) : (
                      ROLES_LIST.map((r) => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))
                    )}
                  </select>
                </div>
              ) : (
                <span
                  style={{
                    padding: '4px 11px', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: 650,
                    background: `${getRoleBadgeColor(user.role)}18`,
                    color: getRoleBadgeColor(user.role),
                    border: `1px solid ${getRoleBadgeColor(user.role)}30`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {getRoleLabel(user.role)}
                </span>
              )}

              {/* Status badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px', borderRadius: '20px',
                fontSize: '0.75rem', fontWeight: 600,
                background: user.status === 'active' ? 'rgba(22,163,74,0.08)' : 'rgba(234,179,8,0.1)',
                color: user.status === 'active' ? '#15803D' : '#A16207',
                border: `1px solid ${user.status === 'active' ? 'rgba(22,163,74,0.25)' : 'rgba(234,179,8,0.3)'}`,
                whiteSpace: 'nowrap'
              }}>
                {user.status === 'active'
                  ? <><UserCheck size={12} /> აქტიური</>
                  : <><Clock size={12} /> მოწვევა გაგზავნილია</>}
              </span>

              {/* Actions menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                  style={{
                    background: 'var(--bg-surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px', padding: '6px 8px',
                    cursor: 'pointer', color: 'var(--color-text-secondary)',
                    display: 'flex', alignItems: 'center', transition: 'all 0.15s'
                  }}
                  title="მოქმედებები"
                >
                  <MoreVertical size={15} />
                </button>

                {openMenuId === user.id && (
                  <div
                    style={{
                      position: 'absolute', right: 0, top: '36px', zIndex: 200,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
                      minWidth: '200px',
                      overflow: 'hidden'
                    }}
                  >
                    <MenuAction
                      icon={<Edit3 size={14} />}
                      label="როლის შეცვლა"
                      onClick={() => { setEditingRoleFor(user.id); setOpenMenuId(null); }}
                    />
                    <MenuAction
                      icon={<Key size={14} />}
                      label="პაროლის განახლება"
                      onClick={() => handleResetPassword(user.id)}
                    />
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <MenuAction
                      icon={<Trash2 size={14} />}
                      label="ანგარიშის წაშლა"
                      danger
                      onClick={() => handleDeleteUser(user.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              color: 'var(--color-text-secondary)',
              background: 'var(--bg-surface-secondary)',
              borderRadius: '16px', border: '1.5px dashed var(--border-subtle)'
            }}>
              <Users size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <div style={{ fontWeight: 600, marginBottom: '6px' }}>თანამშრომლები არ არიან</div>
              <div style={{ fontSize: '0.85rem' }}>დაამატეთ პირველი თანამშრომელი</div>
            </div>
          )}
        </div>
      )}

      {/* ── Roles Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Role Levels Info Banner */}
          <div
            style={{
              padding: '12px',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px'
            }}
          >
            {/* Management Column */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '14px 16px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(8, 145, 178, 0.12)',
                  color: '#0891B2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--color-charcoal)', marginBottom: '3px' }}>
                  {isKa ? 'მენეჯმენტი' : 'Management'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  {isKa
                    ? 'ეს დონე მოიცავს შოუების დაგეგმვას, ტალანტების მართვასა და როტაციების კონტროლს.'
                    : 'This level covers show planning, talent roster management, and schedule rotation controls.'}
                </div>
              </div>
            </div>

            {/* Operations Column */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '14px 16px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(22, 163, 74, 0.12)',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--color-charcoal)', marginBottom: '3px' }}>
                  {isKa ? 'საოპერაციო ან საველე მართვა' : 'Operations / Field Management'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  {isKa
                    ? 'ეს დონე ეთმობა ყოველდღიურ საველე პროცესებს: განრიგის შესრულებას, დასწრებასა და ინვენტარს.'
                    : 'This level is dedicated to daily field processes: schedule execution, attendance, and inventory.'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Central Empty State or Created Roles List */}
          {roles.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '64px 24px',
                borderRadius: '16px',
                border: '1.5px dashed var(--border-medium)',
                background: 'var(--bg-surface)'
              }}
            >
              <ShieldPlus
                className="w-12 h-12 text-stone-400 stroke-1"
                size={48}
                strokeWidth={1}
                style={{ color: 'var(--color-text-tertiary)', marginBottom: '14px' }}
              />
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 650,
                  color: 'var(--color-charcoal)',
                  marginBottom: '6px'
                }}
              >
                {isKa ? 'როლები ჯერ არ არის შექმნილი' : 'No roles created yet'}
              </div>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                  maxWidth: '460px',
                  lineHeight: 1.45,
                  marginBottom: '20px'
                }}
              >
                {isKa
                  ? 'შექმენით თქვენს გუნდზე მორგებული როლი და განსაზღვრეთ შესაბამისი უფლებამოსილებები.'
                  : 'Create a custom role for your team and configure its system permissions.'}
              </p>
              <button
                onClick={() => setIsCreateRoleModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px var(--brand-primary-glow)',
                  transition: 'all 0.15s'
                }}
              >
                <Plus size={16} />
                <span>{isKa ? 'პირველი როლის შექმნა' : 'Create First Role'}</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {roles.map((role) => {
                const memberCount = users.filter((u) => u.role === role.id).length;
                return (
                  <div
                    key={role.id}
                    className="card"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)',
                      padding: '20px 24px',
                      borderRadius: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px', height: '42px', borderRadius: '11px',
                          background: `${role.badgeColor}14`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: role.badgeColor
                        }}>
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 650, color: 'var(--color-charcoal)' }}>
                            {role.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            {role.desc}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          fontSize: '0.775rem', fontWeight: 600,
                          color: 'var(--color-text-secondary)',
                          padding: '3px 10px', borderRadius: '20px',
                          background: 'var(--bg-surface-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          <Users size={12} />
                          {memberCount} {isKa ? 'წევრი' : (memberCount === 1 ? 'member' : 'members')}
                        </span>
                        <span style={{
                          padding: '4px 11px', borderRadius: 'var(--radius-pill)',
                          fontSize: '0.75rem', fontWeight: 650,
                          background: `${role.badgeColor}14`,
                          color: role.badgeColor,
                          border: `1px solid ${role.badgeColor}30`
                        }}>
                          {role.badge === 'Operations' || role.badge === 'ოპერაციული' || role.badge === 'საოპერაციო ან საველე მართვა'
                            ? (isKa ? 'საოპერაციო ან საველე მართვა' : 'Operations')
                            : role.badge === 'Management' || role.badge === 'მენეჯმენტი'
                            ? (isKa ? 'მენეჯმენტი' : 'Management')
                            : role.badge === 'Custom' || role.badge === 'მორგებული'
                            ? (isKa ? 'მორგებული' : 'Custom')
                            : role.badge}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRole(role);
                              setIsCreateRoleModalOpen(true);
                            }}
                            className="btn btn-secondary btn-icon"
                            style={{ width: '30px', height: '30px', borderRadius: '8px' }}
                            title={isKa ? 'როლის რედაქტირება' : 'Edit Role'}
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(role)}
                            className="btn btn-secondary btn-icon"
                            style={{ width: '30px', height: '30px', borderRadius: '8px', color: '#EF4444' }}
                            title={isKa ? 'როლის წაშლა' : 'Delete Role'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      {role.permissions.map((perm, idx) => {
                        const localizedLabel = (isKa ? PERMISSION_LABELS_KA : PERMISSION_LABELS_EN)[perm] || perm;
                        return (
                          <span key={idx} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '0.775rem', padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface-secondary)',
                            color: 'var(--color-charcoal)',
                            border: '1px solid var(--border-subtle)'
                          }}>
                            <CheckCircle2 size={13} color="#16A34A" />
                            {localizedLabel}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Backdrop closer for dropdown */}
      {openMenuId && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100 }}
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleUserCreated}
        roles={roles}
        onRequestCreateRole={() => {
          setActiveTab('roles');
          setIsCreateRoleModalOpen(true);
        }}
      />

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateRoleModalOpen}
        onClose={() => {
          setIsCreateRoleModalOpen(false);
          setEditingRole(null);
        }}
        onCreated={handleRoleCreated}
        onUpdated={handleRoleUpdated}
        editingRole={editingRole}
      />

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// ─── Helper: Menu Action item ─────────────────────────────────────────────────

const MenuAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}> = ({ icon, label, danger, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      width: '100%', padding: '9px 14px',
      border: 'none', background: 'transparent',
      cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
      color: danger ? '#EF4444' : 'var(--color-charcoal)',
      transition: 'background 0.12s',
      textAlign: 'left'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.07)' : 'var(--bg-surface-secondary)';
    }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
  >
    {icon}
    {label}
  </button>
);
