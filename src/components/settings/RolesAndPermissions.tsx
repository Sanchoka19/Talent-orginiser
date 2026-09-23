'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
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
import { RoleDefinition, PERMISSION_LABELS_KA, PERMISSION_LABELS_EN } from '../../types/role';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';

const CreateUserModal = dynamic(
  () => import('./CreateUserModal').then((mod) => mod.CreateUserModal),
  { ssr: false }
);

const CreateRoleModal = dynamic(
  () => import('./CreateRoleModal').then((mod) => mod.CreateRoleModal),
  { ssr: false }
);

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
  const getRoleLabel = useCallback(
    (roleId: string) => {
      const found = roles.find((r) => r.id === roleId);
      if (found) return found.title;
      return ROLE_LABEL[roleId as UserRoleId] || roleId;
    },
    [roles]
  );

  // ── Role actions ───────────────────────────────────────────────────────────
  const handleRoleCreated = useCallback((newRole: RoleDefinition) => {
    setRoles((p) => [...p, newRole]);
  }, []);

  const handleRoleUpdated = useCallback((updatedRole: RoleDefinition) => {
    setRoles((p) => p.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
    setEditingRole(null);
  }, []);

  const handleDeleteRole = useCallback(
    (role: RoleDefinition) => {
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
    },
    [confirm, toast, isKa]
  );

  // ── User actions ───────────────────────────────────────────────────────────
  const handleUserCreated = useCallback(
    (user: SystemUser) => {
      setUsers((p) => [user, ...p]);
      toast.success(
        isKa
          ? `თანამშრომელი „${user.fullName}“ წარმატებით დაემატა`
          : `Staff member "${user.fullName}" added successfully`
      );
    },
    [toast, isKa]
  );

  const handleDeleteUser = useCallback(
    (id: string) => {
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
          toast.success(
            isKa
              ? `თანამშრომელი „${user.fullName}“ წაიშალა`
              : `Staff member "${user.fullName}" removed`
          );
        }
      });
    },
    [users, toast, confirm, isKa]
  );

  const handleRoleChange = useCallback(
    (userId: string, newRole: UserRoleId) => {
      setUsers((p) => (p.map((u) => (u.id === userId ? { ...u, role: newRole } : u))));
      setEditingRoleFor(null);
      setOpenMenuId(null);
      toast.success(isKa ? `როლი განახლდა: ${ROLE_LABEL[newRole]}` : `Role updated: ${ROLE_LABEL[newRole]}`);
    },
    [toast, isKa]
  );

  const handleResetPassword = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      setOpenMenuId(null);
      if (user) {
        toast.success(
          isKa
            ? `პაროლის განახლების ბმული გაიგზავნა ${user.email}-ზე`
            : `Password reset link sent to ${user.email}`
        );
      }
    },
    [users, toast, isKa]
  );

  return (
    <div className="w-full flex flex-col">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mb-1.5">
          {isKa ? 'როლები და წვდომები' : 'Roles & Permissions'}
        </h1>
        <p className="text-sm text-text-secondary">
          {isKa
            ? 'სისტემური მომხმარებლების მართვა, როლების განაწილება და უსაფრთხოების წვდომის დონეები'
            : 'System user management, role assignments, and security permission levels'}
        </p>
      </div>

      {/* Tab bar + CTA */}
      <div className="w-full flex items-center justify-between mb-6 flex-wrap gap-4">
        {/* Segmented tabs */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-md bg-surface-secondary border border-border-subtle">
          <button
            id="tab-roles"
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold transition-all duration-150 outline-none cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-brand-primary text-text-inverse shadow-glow'
                : 'bg-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isKa ? 'როლები და უფლებები' : 'Roles & Permissions'}</span>
            <span
              className={`text-[11px] font-bold rounded-pill px-1.5 py-0.5 ${
                activeTab === 'roles'
                  ? 'bg-white/25 text-text-inverse'
                  : 'bg-brand-primary text-text-inverse'
              }`}
            >
              {roles.length}
            </span>
          </button>

          <button
            id="tab-users"
            type="button"
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold transition-all duration-150 outline-none cursor-pointer ${
              activeTab === 'users'
                ? 'bg-brand-primary text-text-inverse shadow-glow'
                : 'bg-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isKa ? 'თანამშრომლები' : 'Staff'}</span>
            <span
              className={`text-[11px] font-bold rounded-pill px-1.5 py-0.5 ${
                activeTab === 'users'
                  ? 'bg-white/25 text-text-inverse'
                  : 'bg-brand-primary text-text-inverse'
              }`}
            >
              {users.length}
            </span>
          </button>
        </div>

        {/* CTA button */}
        <button
          id={activeTab === 'roles' ? 'btn-add-role' : 'btn-add-user'}
          type="button"
          onClick={() => {
            if (activeTab === 'roles') {
              setIsCreateRoleModalOpen(true);
            } else {
              setIsCreateModalOpen(true);
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill text-sm font-semibold text-text-inverse bg-brand-primary shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeTab === 'roles'
              ? isKa
                ? 'ახალი როლის შექმნა'
                : 'Create Role'
              : isKa
              ? 'თანამშრომლის დამატება'
              : 'Add Staff'}
          </span>
        </button>
      </div>

      {/* ── Users Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-surface border border-border-subtle shadow-sm p-4 sm:p-5 rounded-md flex items-center gap-4 flex-wrap relative transition-all duration-150"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-border-subtle"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-lg">
                    {user.fullName.charAt(0)}
                  </div>
                )}
                {/* Online dot */}
                {user.status === 'active' && (
                  <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-status-active-dot border-2 border-surface shadow-sm" />
                )}
              </div>

              {/* Name + email */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary truncate">
                  {user.fullName}
                </div>
                <div className="text-xs text-text-secondary flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3 h-3 text-text-secondary" />
                  <span>{user.email}</span>
                </div>
              </div>

              {/* Role badge */}
              {editingRoleFor === user.id ? (
                <div className="relative">
                  <select
                    autoFocus
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRoleId)}
                    onBlur={() => setEditingRoleFor(null)}
                    className="px-2.5 py-1.5 rounded-xs border-2 border-brand-primary bg-surface text-text-primary text-xs font-semibold cursor-pointer outline-none"
                  >
                    {roles.length > 0 ? (
                      roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))
                    ) : (
                      ROLES_LIST.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              ) : (
                <span className="px-3 py-1 rounded-pill text-xs font-semibold whitespace-nowrap border border-border-subtle bg-surface-secondary text-text-primary">
                  {getRoleLabel(user.role)}
                </span>
              )}

              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold whitespace-nowrap ${
                  user.status === 'active'
                    ? 'bg-status-active-bg text-status-active-text border border-status-active-dot/30'
                    : 'bg-status-rest-bg text-status-rest-text border border-status-rest-dot/30'
                }`}
              >
                {user.status === 'active' ? (
                  <>
                    <UserCheck className="w-3 h-3" />
                    <span>{isKa ? 'აქტიური' : 'Active'}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>{isKa ? 'მოწვევა გაგზავნილია' : 'Invited'}</span>
                  </>
                )}
              </span>

              {/* Actions menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                  className="p-1.5 rounded-xs bg-surface-secondary border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all duration-150 cursor-pointer"
                  title="Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {openMenuId === user.id && (
                  <div className="absolute right-0 top-10 z-[200] bg-surface border border-border-subtle rounded-md shadow-lg min-w-[200px] overflow-hidden">
                    <MenuAction
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      label={isKa ? 'როლის შეცვლა' : 'Change Role'}
                      onClick={() => {
                        setEditingRoleFor(user.id);
                        setOpenMenuId(null);
                      }}
                    />
                    <MenuAction
                      icon={<Key className="w-3.5 h-3.5" />}
                      label={isKa ? 'პაროლის განახლება' : 'Reset Password'}
                      onClick={() => handleResetPassword(user.id)}
                    />
                    <div className="h-px bg-border-subtle my-1" />
                    <MenuAction
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      label={isKa ? 'ანგარიშის წაშლა' : 'Delete Account'}
                      danger
                      onClick={() => handleDeleteUser(user.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-16 px-5 text-text-secondary bg-surface-secondary rounded-lg border-2 border-dashed border-border-subtle flex flex-col items-center">
              <Users className="w-10 h-10 opacity-30 mb-3" />
              <div className="font-semibold text-text-primary mb-1">
                {isKa ? 'თანამშრომლები არ არიან' : 'No staff members'}
              </div>
              <div className="text-xs text-text-secondary">
                {isKa ? 'დაამატეთ პირველი თანამშრომელი' : 'Add your first staff member'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Roles Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'roles' && (
        <div className="flex flex-col gap-5">
          {/* 1. Role Levels Info Banner */}
          <div className="p-3 rounded-lg border border-border-subtle bg-surface-secondary grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Management Column */}
            <div className="flex items-start gap-3 bg-surface border border-border-subtle rounded-md p-3.5 sm:p-4 shadow-sm">
              <div className="w-9 h-9 rounded-sm bg-category-management/10 text-category-management flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary mb-0.5">
                  {isKa ? 'მენეჯმენტი' : 'Management'}
                </div>
                <div className="text-xs text-text-secondary leading-relaxed">
                  {isKa
                    ? 'ეს დონე მოიცავს შოუების დაგეგმვას, ტალანტების მართვასა და როტაციების კონტროლს.'
                    : 'This level covers show planning, talent roster management, and schedule rotation controls.'}
                </div>
              </div>
            </div>

            {/* Operations Column */}
            <div className="flex items-start gap-3 bg-surface border border-border-subtle rounded-md p-3.5 sm:p-4 shadow-sm">
              <div className="w-9 h-9 rounded-sm bg-category-operations/10 text-category-operations flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary mb-0.5">
                  {isKa ? 'საოპერაციო ან საველე მართვა' : 'Operations / Field Management'}
                </div>
                <div className="text-xs text-text-secondary leading-relaxed">
                  {isKa
                    ? 'ეს დონე ეთმობა ყოველდღიურ საველე პროცესებს: განრიგის შესრულებას, დასწრებასა და ინვენტარს.'
                    : 'This level is dedicated to daily field processes: schedule execution, attendance, and inventory.'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Central Empty State or Created Roles List */}
          {roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 sm:p-16 rounded-lg border-2 border-dashed border-border-medium bg-surface">
              <ShieldPlus className="w-12 h-12 text-text-tertiary mb-3.5 stroke-1" />
              <div className="text-base font-semibold text-text-primary mb-1.5">
                {isKa ? 'როლები ჯერ არ არის შექმნილი' : 'No roles created yet'}
              </div>
              <p className="text-xs sm:text-sm text-text-secondary max-w-[460px] leading-relaxed mb-5">
                {isKa
                  ? 'შექმენით თქვენს გუნდზე მორგებული როლი და განსაზღვრეთ შესაბამისი უფლებამოსილებები.'
                  : 'Create a custom role for your team and configure its system permissions.'}
              </p>
              <button
                type="button"
                onClick={() => setIsCreateRoleModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill text-sm font-semibold text-text-inverse bg-brand-primary shadow-glow hover:bg-brand-primary-hover transition-all duration-150 cursor-pointer outline-none"
              >
                <Plus className="w-4 h-4" />
                <span>{isKa ? 'პირველი როლის შექმნა' : 'Create First Role'}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {roles.map((role) => {
                const memberCount = users.filter((u) => u.role === role.id).length;
                return (
                  <div
                    key={role.id}
                    className="bg-surface border border-border-subtle shadow-sm p-5 sm:p-6 rounded-md flex flex-col gap-3.5 transition-all duration-150"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2.5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-sm bg-category-management/10 text-category-management flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-text-primary">
                            {role.title}
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">
                            {role.desc}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary px-2.5 py-1 rounded-pill bg-surface-secondary border border-border-subtle">
                          <Users className="w-3 h-3" />
                          <span>
                            {memberCount} {isKa ? 'წევრი' : memberCount === 1 ? 'member' : 'members'}
                          </span>
                        </span>
                        <span className="px-2.5 py-1 rounded-pill text-xs font-semibold bg-surface-secondary border border-border-subtle text-text-primary">
                          {role.badge === 'Operations' ||
                          role.badge === 'ოპერაციული' ||
                          role.badge === 'საოპერაციო ან საველე მართვა'
                            ? isKa
                              ? 'საოპერაციო ან საველე მართვა'
                              : 'Operations'
                            : role.badge === 'Management' || role.badge === 'მენეჯმენტი'
                            ? isKa
                              ? 'მენეჯმენტი'
                              : 'Management'
                            : role.badge === 'Custom' || role.badge === 'მორგებული'
                            ? isKa
                              ? 'მორგებული'
                              : 'Custom'
                            : role.badge}
                        </span>

                        <div className="flex items-center gap-1.5 ml-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRole(role);
                              setIsCreateRoleModalOpen(true);
                            }}
                            className="w-7.5 h-7.5 rounded-xs border border-border-subtle bg-surface-secondary text-text-secondary hover:text-text-primary hover:border-border-medium flex items-center justify-center cursor-pointer transition-all duration-150"
                            title={isKa ? 'როლის რედაქტირება' : 'Edit Role'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(role)}
                            className="w-7.5 h-7.5 rounded-xs border border-border-subtle bg-surface-secondary text-danger hover:bg-danger-light hover:border-danger-border flex items-center justify-center cursor-pointer transition-all duration-150"
                            title={isKa ? 'როლის წაშლა' : 'Delete Role'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-border-subtle">
                      {role.permissions.map((perm, idx) => {
                        const localizedLabel = (isKa ? PERMISSION_LABELS_KA : PERMISSION_LABELS_EN)[
                          perm
                        ] || perm;
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xs bg-surface-secondary text-text-primary border border-border-subtle"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-status-active-dot shrink-0" />
                            <span>{localizedLabel}</span>
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
          className="fixed inset-0 z-[100]"
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
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-medium text-left cursor-pointer transition-colors duration-150 outline-none ${
      danger ? 'text-danger hover:bg-danger-light' : 'text-text-primary hover:bg-surface-secondary'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
