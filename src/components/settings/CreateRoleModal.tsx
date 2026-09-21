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
}[] = [
  {
    id: 'Management',
    labelKa: 'მენეჯმენტი',
    labelEn: 'Management',
    titleKa: 'მენეჯმენტი',
    titleEn: 'Management',
    descKa: 'ეს დონე მოიცავს შოუების დაგეგმვას, ტალანტების მართვასა და როტაციების კონტროლს.',
    descEn: 'This level covers show planning, talent roster management, and schedule rotation controls.',
    color: '#0891B2'
  },
  {
    id: 'Operations',
    labelKa: 'საოპერაციო ან საველე მართვა',
    labelEn: 'Operations',
    titleKa: 'საოპერაციო ან საველე მართვა',
    titleEn: 'Operations / Field Management',
    descKa: 'ეს დონე ეთმობა ყოველდღიურ საველე პროცესებს: განრიგის შესრულებას, დასწრებასა და ინვენტარს.',
    descEn: 'This level is dedicated to daily field processes: schedule execution, attendance, and inventory.',
    color: '#16A34A'
  },
  {
    id: 'Custom',
    labelKa: 'მორგებული',
    labelEn: 'Custom',
    titleKa: 'მორგებული',
    titleEn: 'Custom',
    descKa: 'ინდივიდუალური სისტემური წვდომის დონე.',
    descEn: 'Custom system access level.',
    color: '#7C3AED'
  }
];

const renderModuleIcon = (type: PermissionModuleData['iconType']) => {
  switch (type) {
    case 'talents':
      return <Users size={16} />;
    case 'schedule':
      return <Calendar size={16} />;
    case 'groups':
      return <Layers size={16} />;
    case 'duty':
      return <ClipboardList size={16} />;
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
    // If 'Custom', preserve the current selection
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
      toast.success(isKa ? `როლის „${finalRoleTitle}“ ცვლილებები შენახულია` : `Changes to role "${finalRoleTitle}" saved`);
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
      toast.success(isKa ? `როლი „${newRole.title}“ წარმატებით შეიქმნა` : `Role "${newRole.title}" created successfully`);
    }

    setIsSubmitting(false);
    handleReset();
    onClose();
  };

  const labelBase: React.CSSProperties = {
    fontSize: '0.775rem',
    fontWeight: 650,
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    marginBottom: '8px',
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
        zIndex: 1100,
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
          maxWidth: '560px',
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
            padding: '22px 26px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(30,106,255,0.07) 0%, transparent 65%)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '11px',
                background: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px var(--brand-primary-glow)',
                color: '#fff'
              }}
            >
              <ShieldCheck size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--color-charcoal)',
                  margin: 0
                }}
              >
                {editingRole
                  ? (isKa ? 'როლის რედაქტირება' : 'Edit Role')
                  : (isKa ? 'ახალი როლის შექმნა' : 'Create New Role')}
              </h2>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  margin: '2px 0 0'
                }}
              >
                {isKa
                  ? 'აირჩიეთ კატეგორია და მიანიჭეთ სისტემური წვდომები'
                  : 'Select role category and assign system permissions'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label={isKa ? 'დახურვა' : 'Close'}
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

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '22px 26px',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Role Title Input */}
          <div>
            <label style={labelBase}>
              {isKa ? 'როლის დასახელება' : 'Role Title'}
              <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder={isKa ? 'მაგ: მენეჯმენტი' : 'e.g. Management'}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--color-charcoal)',
                fontSize: '0.875rem',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* Category Badge Selection */}
          <div>
            <label style={labelBase}>
              {isKa ? 'კატეგორიის ბეიჯი' : 'Category Badge'}
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px'
              }}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                const labelText = isKa ? cat.labelKa : cat.labelEn;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    style={{
                      padding: '11px 12px',
                      borderRadius: '10px',
                      border: isSelected
                        ? `2px solid ${cat.color}`
                        : '1.5px solid var(--border-subtle)',
                      background: isSelected ? `${cat.color}15` : 'var(--bg-surface-secondary)',
                      color: isSelected ? cat.color : 'var(--color-charcoal)',
                      fontWeight: 650,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? `0 2px 8px ${cat.color}25` : 'none'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: cat.color,
                        flexShrink: 0
                      }}
                    />
                    <span>{labelText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}
            >
              <label style={{ ...labelBase, marginBottom: 0 }}>
                {isKa ? 'უფლებების მატრიცა' : 'Permissions Matrix'}
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '12px',
                    background: selectedPermissions.length > 0 ? 'var(--brand-primary-light)' : 'var(--bg-surface-secondary)',
                    color: selectedPermissions.length > 0 ? 'var(--brand-primary)' : 'var(--color-text-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {selectedPermissions.length} / {totalAvailablePermissions}
                </span>
              </label>

              <button
                type="button"
                onClick={handleSelectAllGlobal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={13} />
                {selectedPermissions.length === totalAvailablePermissions
                  ? (isKa ? 'ყველას მოხსნა' : 'Clear All')
                  : (isKa ? 'სრული წვდომა' : 'Full Access')}
              </button>
            </div>

            {/* Matrix Container without internal scroll */}
            <div
              className="permissions-container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '4px',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: '14px',
                background: 'var(--bg-canvas)'
              }}
            >
              {PERMISSION_MODULES.map((module) => {
                const modulePermIds = module.permissions.map((p) => p.id);
                const selectedInModule = modulePermIds.filter((id) =>
                  selectedPermissions.includes(id)
                ).length;
                const isAllModuleSelected = selectedInModule === modulePermIds.length;
                const moduleTitle = isKa ? (module.titleKa || module.title) : (module.titleEn || module.title);

                return (
                  <div
                    key={module.id}
                    style={{
                      background: 'var(--bg-surface)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      padding: '12px 14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Module Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: 'var(--color-charcoal)',
                          fontWeight: 650,
                          fontSize: '0.85rem'
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--brand-primary)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {renderModuleIcon(module.iconType)}
                        </span>
                        <span>{moduleTitle}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-text-secondary)',
                            fontWeight: 500
                          }}
                        >
                          ({selectedInModule}/{module.permissions.length})
                        </span>
                      </div>

                      {/* Select All Quick Button for Module */}
                      <button
                        type="button"
                        onClick={() => toggleModuleAll(module)}
                        style={{
                          background: isAllModuleSelected
                            ? 'var(--brand-primary-light)'
                            : 'var(--bg-surface-secondary)',
                          border: `1px solid ${isAllModuleSelected ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                          color: isAllModuleSelected
                            ? 'var(--brand-primary)'
                            : 'var(--color-text-secondary)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s'
                        }}
                      >
                        <Check size={11} strokeWidth={2.5} />
                        {isAllModuleSelected
                          ? (isKa ? 'მონიშნულია' : 'Selected')
                          : (isKa ? 'ყველას მონიშვნა' : 'Select All')}
                      </button>
                    </div>

                    {/* Permissions list in Module */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}
                    >
                      {module.permissions.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        const permLabel = isKa
                          ? (perm.labelKa || perm.label)
                          : (perm.labelEn || perm.label);

                        return (
                          <button
                            key={perm.id}
                            type="button"
                            onClick={() => togglePermission(perm.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '7px',
                              border: isChecked
                                ? '1.5px solid var(--brand-primary)'
                                : '1px solid var(--border-subtle)',
                              background: isChecked
                                ? 'var(--brand-primary-light)'
                                : 'var(--bg-surface-secondary)',
                              color: isChecked
                                ? 'var(--brand-primary)'
                                : 'var(--color-charcoal)',
                              fontSize: '0.78rem',
                              fontWeight: isChecked ? 600 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.12s',
                              userSelect: 'none'
                            }}
                          >
                            <span
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '4px',
                                border: isChecked
                                  ? 'none'
                                  : '1.5px solid var(--border-medium)',
                                background: isChecked
                                  ? 'var(--brand-primary)'
                                  : 'var(--bg-surface)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '10px'
                              }}
                            >
                              {isChecked && <Check size={10} strokeWidth={3} />}
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: '#EF4444',
                  marginTop: '8px'
                }}
              >
                <Info size={13} />
                {isKa
                  ? 'აირჩიეთ მინიმუმ ერთი სისტემური უფლება როლის შესაქმნელად'
                  : 'Select at least one permission to create role'}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              background: 'var(--bg-surface)',
              flexShrink: 0
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '9px 16px',
                borderRadius: '9px',
                border: '1.5px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {isKa ? 'გაუქმება' : 'Cancel'}
            </button>

            <button
              type="submit"
              id="btn-submit-role"
              disabled={isSubmitDisabled}
              style={{
                padding: '9px 20px',
                borderRadius: '9px',
                border: 'none',
                background: isSubmitDisabled
                  ? 'var(--border-medium)'
                  : 'var(--brand-primary)',
                color: isSubmitDisabled ? 'var(--color-text-tertiary)' : '#fff',
                fontSize: '0.85rem',
                fontWeight: 650,
                cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                boxShadow: isSubmitDisabled
                  ? 'none'
                  : '0 4px 14px var(--brand-primary-glow)',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={15} />
              {isSubmitting
                ? (isKa ? 'ინახება...' : 'Saving...')
                : editingRole
                ? (isKa ? 'ცვლილებების შენახვა' : 'Save Changes')
                : (isKa ? 'როლის შექმნა' : 'Create Role')}
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
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
