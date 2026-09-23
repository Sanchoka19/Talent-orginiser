'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  Calendar,
  Layers,
  ClipboardList,
  Check,
  CheckCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  RoleCategory,
  RoleDefinition,
  PermissionModuleData,
  PERMISSION_MODULES,
  PERMISSION_LABELS,
  ROLE_TEMPLATES
} from '../../types/role';

export { type RoleCategory, type RoleDefinition, PERMISSION_LABELS, ROLE_TEMPLATES };

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (role: RoleDefinition) => void;
  onUpdated?: (role: RoleDefinition) => void;
  editingRole?: RoleDefinition | null;
}

const CATEGORIES: {
  id: RoleCategory;
  labelKa: string;
  labelEn: string;
  titleKa: string;
  titleEn: string;
  descKa: string;
  descEn: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}[] = [
  {
    id: 'Management',
    labelKa: 'მენეჯმენტი',
    labelEn: 'Management',
    titleKa: 'მენეჯმენტი',
    titleEn: 'Management',
    descKa: 'ეს დონე მოიცავს შოუების დაგეგმვას, ტალანტების მართვასა და როტაციების კონტროლს.',
    descEn: 'This level covers show planning, talent roster management, and schedule rotation controls.',
    color: '#0891B2',
    borderColor: 'border-category-management',
    bgColor: 'bg-category-management/10',
    textColor: 'text-category-management',
    dotColor: 'bg-category-management'
  },
  {
    id: 'Operations',
    labelKa: 'საოპერაციო ან საველე მართვა',
    labelEn: 'Operations',
    titleKa: 'საოპერაციო ან საველე მართვა',
    titleEn: 'Operations / Field Management',
    descKa: 'ეს დონე ეთმობა ყოველდღიურ საველე პროცესებს: განრიგის შესრულებას, დასწრებასა და ინვენტარს.',
    descEn: 'This level is dedicated to daily field processes: schedule execution, attendance, and inventory.',
    color: '#16A34A',
    borderColor: 'border-category-operations',
    bgColor: 'bg-category-operations/10',
    textColor: 'text-category-operations',
    dotColor: 'bg-category-operations'
  },
  {
    id: 'Custom',
    labelKa: 'მორგებული',
    labelEn: 'Custom',
    titleKa: 'მორგებული',
    titleEn: 'Custom',
    descKa: 'ინდივიდუალური სისტემური წვდომის დონე.',
    descEn: 'Custom system access level.',
    color: '#7C3AED',
    borderColor: 'border-category-custom',
    bgColor: 'bg-category-custom/10',
    textColor: 'text-category-custom',
    dotColor: 'bg-category-custom'
  }
];

const renderModuleIcon = (type: PermissionModuleData['iconType']) => {
  switch (type) {
    case 'talents':
      return <Users className="w-4 h-4" />;
    case 'schedule':
      return <Calendar className="w-4 h-4" />;
    case 'groups':
      return <Layers className="w-4 h-4" />;
    case 'duty':
      return <ClipboardList className="w-4 h-4" />;
  }
};

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  editingRole
}) => {
  const { language } = useLanguage();
  const toast = useToast();
  const isKa = language === 'ka';

  const [category, setCategory] = useState<RoleCategory>('Management');
  const [roleTitle, setRoleTitle] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    ...ROLE_TEMPLATES.Management
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (editingRole) {
      setSelectedPermissions([...editingRole.permissions]);
      setCategory(checkMatchingCategory(editingRole.permissions));
      setRoleTitle(editingRole.title);
    } else {
      setCategory('Management');
      setSelectedPermissions([...ROLE_TEMPLATES.Management]);
      const catObj = CATEGORIES.find((c) => c.id === 'Management');
      setRoleTitle(catObj ? (isKa ? catObj.titleKa : catObj.titleEn) : '');
    }
  }, [editingRole, isOpen, isKa]);

  if (!isOpen) return null;

  const totalAvailablePermissions = PERMISSION_MODULES.reduce(
    (acc, mod) => acc + mod.permissions.length,
    0
  );

  const hasNoPermissions = selectedPermissions.length === 0;
  const isSubmitDisabled = hasNoPermissions || isSubmitting;

  const checkMatchingCategory = (newPermissions: string[]): RoleCategory => {
    const isExactMatch = (template: string[]) =>
      newPermissions.length === template.length &&
      template.every((p) => newPermissions.includes(p));

    if (isExactMatch(ROLE_TEMPLATES.Management)) return 'Management';
    if (isExactMatch(ROLE_TEMPLATES.Operations)) return 'Operations';
    return 'Custom';
  };

  const handleCategorySelect = (selectedCat: RoleCategory) => {
    setCategory(selectedCat);
    const catObj = CATEGORIES.find((c) => c.id === selectedCat);
    if (catObj) {
      setRoleTitle(isKa ? catObj.titleKa : catObj.titleEn);
    }
    if (selectedCat === 'Operations') {
      setSelectedPermissions([...ROLE_TEMPLATES.Operations]);
    } else if (selectedCat === 'Management') {
      setSelectedPermissions([...ROLE_TEMPLATES.Management]);
    }
  };

  const handleReset = () => {
    setCategory('Management');
    setSelectedPermissions([...ROLE_TEMPLATES.Management]);
    const catObj = CATEGORIES.find((c) => c.id === 'Management');
    setRoleTitle(catObj ? (isKa ? catObj.titleKa : catObj.titleEn) : '');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) => {
      const next = prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId];
      setCategory(checkMatchingCategory(next));
      return next;
    });
  };

  const toggleModuleAll = (module: PermissionModuleData) => {
    const modPermIds = module.permissions.map((p) => p.id);
    const allSelected = modPermIds.every((id) => selectedPermissions.includes(id));

    let next: string[];
    if (allSelected) {
      next = selectedPermissions.filter((id) => !modPermIds.includes(id));
    } else {
      next = Array.from(new Set([...selectedPermissions, ...modPermIds]));
    }
    setSelectedPermissions(next);
    setCategory(checkMatchingCategory(next));
  };

  const handleSelectAllGlobal = () => {
    const allIds = PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.id));
    const next = selectedPermissions.length === totalAvailablePermissions ? [] : allIds;
    setSelectedPermissions(next);
    setCategory(checkMatchingCategory(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0) {
      toast.error(
        isKa
          ? 'გთხოვთ შეავსოთ სავალდებულო ველები და აირჩიოთ მინიმუმ ერთი უფლება'
          : 'Please select at least one permission'
      );
      return;
    }

    setIsSubmitting(true);

    const activeCat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
    const finalRoleTitle = roleTitle.trim() || (isKa ? activeCat.titleKa : activeCat.titleEn);
    const roleDesc = editingRole ? editingRole.desc : (isKa ? activeCat.descKa : activeCat.descEn);
    const roleBadge = isKa ? activeCat.labelKa : activeCat.labelEn;

    if (editingRole && onUpdated) {
      const updatedRole: RoleDefinition = {
        ...editingRole,
        title: finalRoleTitle,
        badge: roleBadge,
        badgeColor: activeCat.color,
        desc: roleDesc,
        permissions: selectedPermissions
      };
      await new Promise((r) => setTimeout(r, 200));
      onUpdated(updatedRole);
      toast.success(
        isKa
          ? `როლის „${finalRoleTitle}“ ცვლილებები შენახულია`
          : `Changes to role "${finalRoleTitle}" saved`
      );
    } else {
      const newRole: RoleDefinition = {
        id: `role-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: finalRoleTitle,
        badge: roleBadge,
        badgeColor: activeCat.color,
        desc: roleDesc,
        permissions: selectedPermissions
      };
      await new Promise((r) => setTimeout(r, 200));
      onCreated(newRole);
      toast.success(
        isKa
          ? `როლი „${newRole.title}“ წარმატებით შეიქმნა`
          : `Role "${newRole.title}" created successfully`
      );
    }

    setIsSubmitting(false);
    handleReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex justify-end bg-surface-overlay backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-surface w-full max-w-[560px] h-screen max-h-screen shadow-modal border-l border-border-subtle flex flex-col relative overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-subtle flex items-start justify-between bg-gradient-to-br from-brand-primary/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-brand-primary flex items-center justify-center shadow-glow text-text-inverse shrink-0">
              <ShieldCheck className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {editingRole
                  ? isKa
                    ? 'როლის რედაქტირება'
                    : 'Edit Role'
                  : isKa
                  ? 'ახალი როლის შექმნა'
                  : 'Create New Role'}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {isKa
                  ? 'აირჩიეთ კატეგორია და მიანიჭეთ სისტემური წვდომები'
                  : 'Select role category and assign system permissions'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={isKa ? 'დახურვა' : 'Close'}
            className="p-1.5 rounded-xs bg-surface-secondary border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 flex-1 overflow-y-auto flex flex-col gap-5"
        >
          {/* Role Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
              <span>{isKa ? 'როლის დასახელება' : 'Role Title'}</span>
              <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder={isKa ? 'მაგ: მენეჯმენტი' : 'e.g. Management'}
              className="w-full px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface text-text-primary text-sm font-semibold outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              required
            />
          </div>

          {/* Category Badge Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {isKa ? 'კატეგორიის ბეიჯი' : 'Category Badge'}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                const labelText = isKa ? cat.labelKa : cat.labelEn;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`p-3 rounded-sm border text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-150 outline-none ${
                      isSelected
                        ? `${cat.borderColor} ${cat.bgColor} ${cat.textColor} shadow-sm`
                        : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cat.dotColor}`} />
                    <span>{labelText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <span>{isKa ? 'უფლებების მატრიცა' : 'Permissions Matrix'}</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill border border-border-subtle ${
                    selectedPermissions.length > 0
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'bg-surface-secondary text-text-secondary'
                  }`}
                >
                  {selectedPermissions.length} / {totalAvailablePermissions}
                </span>
              </label>

              <button
                type="button"
                onClick={handleSelectAllGlobal}
                className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer flex items-center gap-1 p-1 outline-none"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>
                  {selectedPermissions.length === totalAvailablePermissions
                    ? isKa
                      ? 'ყველას მოხსნა'
                      : 'Clear All'
                    : isKa
                    ? 'სრული წვდომა'
                    : 'Full Access'}
                </span>
              </button>
            </div>

            {/* Matrix Container */}
            <div className="flex flex-col gap-2.5 p-1 border border-border-subtle rounded-md bg-canvas">
              {PERMISSION_MODULES.map((module) => {
                const modulePermIds = module.permissions.map((p) => p.id);
                const selectedInModule = modulePermIds.filter((id) =>
                  selectedPermissions.includes(id)
                ).length;
                const isAllModuleSelected = selectedInModule === modulePermIds.length;
                const moduleTitle = isKa
                  ? module.titleKa || module.title
                  : module.titleEn || module.title;

                return (
                  <div
                    key={module.id}
                    className="bg-surface rounded-sm border border-border-subtle p-3 sm:p-3.5 shadow-sm"
                  >
                    {/* Module Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
                        <span className="text-brand-primary flex items-center">
                          {renderModuleIcon(module.iconType)}
                        </span>
                        <span>{moduleTitle}</span>
                        <span className="text-xs text-text-secondary font-normal">
                          ({selectedInModule}/{module.permissions.length})
                        </span>
                      </div>

                      {/* Select All Quick Button for Module */}
                      <button
                        type="button"
                        onClick={() => toggleModuleAll(module)}
                        className={`text-xs font-semibold px-2 py-1 rounded-xs border cursor-pointer flex items-center gap-1 transition-all duration-150 outline-none ${
                          isAllModuleSelected
                            ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                            : 'bg-surface-secondary border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-medium'
                        }`}
                      >
                        <Check className="w-3 h-3" strokeWidth={2.5} />
                        <span>
                          {isAllModuleSelected
                            ? isKa
                              ? 'მონიშნულია'
                              : 'Selected'
                            : isKa
                            ? 'ყველას მონიშვნა'
                            : 'Select All'}
                        </span>
                      </button>
                    </div>

                    {/* Permissions list in Module */}
                    <div className="flex flex-wrap gap-1.5">
                      {module.permissions.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        const permLabel = isKa
                          ? perm.labelKa || perm.label
                          : perm.labelEn || perm.label;

                        return (
                          <button
                            key={perm.id}
                            type="button"
                            onClick={() => togglePermission(perm.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs border text-xs font-medium cursor-pointer transition-all duration-150 select-none outline-none ${
                              isChecked
                                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold'
                                : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center text-text-inverse text-[10px] ${
                                isChecked
                                  ? 'bg-brand-primary'
                                  : 'border border-border-medium bg-surface'
                              }`}
                            >
                              {isChecked && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                            </span>
                            <span>{permLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasNoPermissions && (
              <div className="flex items-center gap-1.5 text-xs text-danger mt-2">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isKa
                    ? 'აირჩიეთ მინიმუმ ერთი სისტემური უფლება როლის შესაქმნელად'
                    : 'Select at least one permission to create role'}
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-end gap-2.5 bg-surface shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-pill border border-border-subtle bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary font-semibold text-sm transition-all duration-150 cursor-pointer outline-none"
            >
              {isKa ? 'გაუქმება' : 'Cancel'}
            </button>

            <button
              type="submit"
              id="btn-submit-role"
              disabled={isSubmitDisabled}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-pill text-sm font-semibold text-text-inverse bg-brand-primary shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? isKa
                    ? 'ინახება...'
                    : 'Saving...'
                  : editingRole
                  ? isKa
                    ? 'ცვლილებების შენახვა'
                    : 'Save Changes'
                  : isKa
                  ? 'როლის შექმნა'
                  : 'Create Role'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
