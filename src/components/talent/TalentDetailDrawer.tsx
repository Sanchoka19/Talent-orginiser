import React, { useState } from 'react';
import { Talent, TalentStatus, TalentDocument } from '../../types/talent';
import { Drawer } from '../common/Drawer';
import { StatusBadge, GenderBadge } from '../common/Badge';
import { SplitProgressBar } from '../common/ProgressBar';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import {
  Phone,
  Mail,
  Edit2,
  Trash2,
  Layers,
  Plus,
  ExternalLink,
  User,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  Sparkles,
  Info,
  AlertTriangle,
  MessageSquare,
  PhoneCall,
  Copy,
  Check,
  UploadCloud,
  X,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { extractContractExpiryDate } from '../../utils/contractParser';
import { getCountryFromPhone } from '../common/PhoneInput';

interface TalentDetailDrawerProps {
  talent: Talent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (talent: Talent) => void;
}

type DrawerTab = 'info' | 'docs' | 'stats';

export const DOCUMENT_TYPES: {
  value: TalentDocument['type'];
  labelKa: string;
  labelEn: string;
  short: string;
  bg: string;
  color: string;
}[] = [
  { value: 'Passport', labelKa: 'პასპორტი', labelEn: 'Passport', short: 'PAS', bg: '#E0F2FE', color: '#0284C7' },
  { value: 'Visa', labelKa: 'ვიზა', labelEn: 'Visa', short: 'VISA', bg: '#FEF3C7', color: '#B45309' },
  { value: 'ID Card', labelKa: 'პირადობის მოწმობა', labelEn: 'ID Card', short: 'ID', bg: '#E0E7FF', color: '#4338CA' },
  { value: 'Medical', labelKa: 'სამედიცინო ცნობა', labelEn: 'Medical Clearance', short: 'MED', bg: '#FEE2E2', color: '#DC2626' },
  { value: 'Contract', labelKa: 'კონტრაქტი', labelEn: 'Contract', short: 'CON', bg: '#DCFCE7', color: '#15803D' },
  { value: 'Other', labelKa: 'სხვა დოკუმენტი', labelEn: 'Other Document', short: 'DOC', bg: '#F3F4F6', color: '#4B5563' },
];

export const TalentDetailDrawer: React.FC<TalentDetailDrawerProps> = ({
  talent,
  isOpen,
  onClose,
  onEdit
}) => {
  const { updateTalent, deleteTalent, groups, schedule } = useApp();
  const { t, language } = useLanguage();
  const { confirm } = useConfirm();
  const toast = useToast();
  const isKa = language === 'ka';

  const [activeTab, setActiveTab] = useState<DrawerTab>('info');
  const [statsSubTab, setStatsSubTab] = useState<'rotation' | 'shows'>('rotation');
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<TalentDocument['type']>('Passport');
  const [newDocExpiryDate, setNewDocExpiryDate] = useState('');
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [parseDetected, setParseDetected] = useState<boolean | null>(null);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const contentScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabSelect = (tab: DrawerTab) => {
    setActiveTab(tab);
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!talent) return null;

  // Calculate duty shifts served by this talent & collect shift history
  const servedShifts: {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    itemName: string;
  }[] = [];

  for (const ev of schedule) {
    for (const d of ev.dutyAssignments) {
      if (d.assignedTalentIds.includes(talent.id)) {
        servedShifts.push({
          eventId: ev.id,
          eventTitle: ev.title,
          eventDate: ev.startDateTime,
          itemName: d.itemName
        });
      }
    }
  }

  const totalDutiesServed = servedShifts.length;

  // Shows where this talent's group participated
  const talentGroupIds = new Set(groups.filter((g) => g.memberTalentIds.includes(talent.id)).map((g) => g.id));
  const talentShows = schedule
    .filter((ev) => talentGroupIds.has(ev.groupId))
    .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());

  // Groups this talent is part of
  const memberGroups = groups.filter((g) => g.memberTalentIds.includes(talent.id));

  const handleStatusChange = (newStatus: TalentStatus) => {
    updateTalent(talent.id, { status: newStatus });
    const statusLabel =
      newStatus === 'Active'
        ? (isKa ? 'აქტიური' : 'Active')
        : newStatus === 'Rest'
        ? (isKa ? 'დასვენება' : 'Rest')
        : (isKa ? 'ავად/ტრავმირებული' : 'Sick/Injured');
    toast.success(isKa ? `სტატუსი განახლდა: ${statusLabel}` : `Status updated: ${statusLabel}`);
  };

  // Document uniqueness and type helper states
  const existingDocTypes = new Set(talent.documents.map((d) => d.type));
  const availableDocTypes = DOCUMENT_TYPES.filter((dt) => !existingDocTypes.has(dt.value));
  const allDocTypesUploaded = availableDocTypes.length === 0;

  const currentTypeObj = DOCUMENT_TYPES.find((dt) => dt.value === newDocType) || DOCUMENT_TYPES[0];
  const currentTypeLabel = isKa ? currentTypeObj.labelKa : currentTypeObj.labelEn;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate document title input with the selected file name (without extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setNewDocName(nameWithoutExt || file.name);

      if (newDocType === 'Contract') {
        setIsParsingDoc(true);
        setParseDetected(null);
        try {
          const result = await extractContractExpiryDate(file);
          if (result.date) {
            setNewDocExpiryDate(result.date);
            setParseDetected(true);
            toast.success(
              isKa
                ? `კონტრაქტის ვადა ავტომატურად ამოიცნო: ${result.date}`
                : `Contract expiry date auto-detected: ${result.date}`
            );
          } else {
            setParseDetected(false);
          }
        } catch {
          setParseDetected(false);
        } finally {
          setIsParsingDoc(false);
        }
      }
    }
  };

  const handleDocTypeSelect = async (type: TalentDocument['type']) => {
    setNewDocType(type);
    if (type !== 'Contract') {
      setNewDocExpiryDate('');
      setParseDetected(null);
    } else if (selectedFile && !newDocExpiryDate) {
      setIsParsingDoc(true);
      setParseDetected(null);
      try {
        const result = await extractContractExpiryDate(selectedFile);
        if (result.date) {
          setNewDocExpiryDate(result.date);
          setParseDetected(true);
        } else {
          setParseDetected(false);
        }
      } catch {
        setParseDetected(false);
      } finally {
        setIsParsingDoc(false);
      }
    }
  };

  const handleToggleAddDoc = () => {
    if (!showAddDoc) {
      // Pick first available doc type that hasn't been uploaded yet
      const firstAvailable = availableDocTypes[0]?.value || 'Other';
      setNewDocType(firstAvailable);
      setNewDocName('');
      setSelectedFile(null);
      setNewDocExpiryDate('');
      setParseDetected(null);
      setIsParsingDoc(false);
    }
    setShowAddDoc(!showAddDoc);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error(isKa ? 'გთხოვთ აირჩიოთ დოკუმენტის ფაილი' : 'Please select a document file');
      return;
    }

    // Validate that document type is unique per creator/talent
    if (existingDocTypes.has(newDocType)) {
      toast.error(
        isKa
          ? `დოკუმენტი ტიპით „${currentTypeLabel}“ უკვე ატვირთულია ამ თანამშრომელზე!`
          : `A document of type "${currentTypeLabel}" is already uploaded for this talent!`
      );
      return;
    }

    const fileName = newDocName.trim() || selectedFile.name.replace(/\.[^/.]+$/, '') || 'Document';
    
    let formattedSize = '1.8 MB';
    const bytes = selectedFile.size;
    if (bytes < 1024 * 1024) {
      formattedSize = `${(bytes / 1024).toFixed(0)} KB`;
    } else {
      formattedSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    const newDoc: TalentDocument = {
      id: `doc-${Date.now()}`,
      name: fileName,
      type: newDocType,
      fileSize: formattedSize,
      expiryDate: newDocType === 'Contract' && newDocExpiryDate.trim() ? newDocExpiryDate.trim() : undefined,
      uploadedAt: new Date().toISOString()
    };

    updateTalent(talent.id, {
      documents: [...talent.documents, newDoc]
    });

    toast.success(
      isKa
        ? `დოკუმენტი „${fileName}“ (${currentTypeLabel}) წარმატებით დაემატა`
        : `Document "${fileName}" (${currentTypeLabel}) added successfully`
    );
    setNewDocName('');
    setSelectedFile(null);
    setNewDocExpiryDate('');
    setParseDetected(null);
    setShowAddDoc(false);
  };

  const handleDeleteDocument = (docId: string, docName: string) => {
    confirm({
      title: isKa ? 'დოკუმენტის წაშლა' : 'Delete Document',
      message: isKa
        ? `დარწმუნებული ხართ, რომ გსურთ დოკუმენტის „${docName}“ წაშლა?`
        : `Are you sure you want to delete the document "${docName}"?`,
      itemName: docName,
      confirmLabel: isKa ? 'წაშლა' : 'Delete',
      cancelLabel: isKa ? 'გაუქმება' : 'Cancel',
      variant: 'danger',
      icon: 'trash',
      onConfirm: () => {
        const updatedDocs = talent.documents.filter((d) => d.id !== docId);
        updateTalent(talent.id, { documents: updatedDocs });
        toast.success(isKa ? `დოკუმენტი „${docName}“ წაიშალა` : `Document "${docName}" removed`);
      }
    });
  };

  const handleDelete = () => {
    const fullName = `${talent.firstName} ${talent.lastName}`;
    confirm({
      title: language === 'ka' ? 'ტალანტის წაშლა' : 'Delete Performer',
      message: language === 'ka'
        ? 'ნამდვილად გსურთ ამ შემსრულებლის პროფილის წაშლა? მასთან დაკავშირებული დოკუმენტები და როტაციის ისტორია წაიშლება.'
        : `Are you sure you want to remove this performer profile? All documents, shifts, and rotation records will be deleted.`,
      itemName: fullName,
      requiredMatch: fullName,
      confirmLabel: language === 'ka' ? 'წაშლა' : 'Delete',
      variant: 'danger',
      onConfirm: () => {
        deleteTalent(talent.id);
        toast.success(
          isKa
            ? `თანამშრომელი „${fullName}“ წარმატებით წაიშალა`
            : `Performer "${fullName}" deleted successfully`
        );
        onClose();
      }
    });
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="520px">
      {/* Fixed Top Header (Non-scrolling: avatar, profile info, status, tabs) */}
      <div style={{ flexShrink: 0, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', position: 'relative', zIndex: 5 }}>
        {/* Hero Banner with Modern Brand Aura */}
        <div
          style={{
            height: '84px',
            background: 'radial-gradient(circle at 75% 20%, #FF6C41 0%, #004F72 55%, #082734 95%)',
            position: 'relative',
            padding: '20px'
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '-42px',
              left: '24px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '16px'
            }}
          >
            <img
              src={
                talent.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.firstName}${talent.lastName}`
              }
              alt={talent.firstName}
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #FFFFFF',
                boxShadow: '0 8px 22px -3px rgba(0, 0, 0, 0.22)',
                backgroundColor: '#FFFFFF'
              }}
            />
          </div>
        </div>

        {/* Profile Header Info */}
        <div style={{ padding: '48px 24px 14px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-charcoal)', letterSpacing: '-0.02em', margin: 0 }}>
                {talent.firstName} {talent.lastName}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '3px', margin: 0 }}>
                {talent.primarySkill}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => onEdit(talent)}
                className="btn btn-secondary btn-icon"
                style={{ width: '34px', height: '34px' }}
                title={t('edit_performer')}
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-secondary btn-icon"
                style={{ width: '34px', height: '34px', color: '#EF4444' }}
                title={t('delete')}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Status Selector Custom Dropdown */}
          <div
            ref={statusDropdownRef}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              marginBottom: talent.status !== 'Active' ? '10px' : '14px'
            }}
          >
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {t('availability_status')}:
            </span>

            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                border: talent.status === 'Active'
                  ? '1px solid rgba(22, 163, 74, 0.3)'
                  : talent.status === 'Rest'
                  ? '1px solid rgba(217, 119, 6, 0.3)'
                  : '1px solid rgba(220, 38, 38, 0.3)',
                background: talent.status === 'Active'
                  ? 'rgba(22, 163, 74, 0.08)'
                  : talent.status === 'Rest'
                  ? 'rgba(217, 119, 6, 0.08)'
                  : 'rgba(220, 38, 38, 0.08)',
                color: talent.status === 'Active'
                  ? '#15803D'
                  : talent.status === 'Rest'
                  ? '#B45309'
                  : '#DC2626',
                fontSize: '0.825rem',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: talent.status === 'Active'
                    ? '#16A34A'
                    : talent.status === 'Rest'
                    ? '#D97706'
                    : '#DC2626'
                }}
              />
              <span>
                {talent.status === 'Active'
                  ? t('status_active')
                  : talent.status === 'Rest'
                  ? t('status_rest')
                  : t('status_sick')}
              </span>
              <ChevronDown
                size={14}
                style={{
                  transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform var(--transition-fast)'
                }}
              />
            </button>

            {/* Status Dropdown Menu */}
            {isStatusDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: '12px',
                  minWidth: '160px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                  zIndex: 200,
                  overflow: 'hidden',
                  padding: '4px 0'
                }}
              >
                {(['Active', 'Rest', 'Sick/Injured'] as TalentStatus[]).map((st) => {
                  const isSelected = talent.status === st;
                  const dotColor = st === 'Active' ? '#16A34A' : st === 'Rest' ? '#D97706' : '#DC2626';
                  const label = st === 'Active' ? t('status_active') : st === 'Rest' ? t('status_rest') : t('status_sick');

                  return (
                    <div
                      key={st}
                      onClick={() => {
                        handleStatusChange(st);
                        setIsStatusDropdownOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.825rem',
                        fontWeight: isSelected ? 650 : 500,
                        color: 'var(--color-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--bg-surface-secondary)' : 'transparent',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: dotColor
                          }}
                        />
                        <span>{label}</span>
                      </div>
                      {isSelected && <Check size={14} color={dotColor} strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compact, Refined Warning Notice */}
          {talent.status !== 'Active' && (
            <div
              style={{
                marginBottom: '12px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(255, 108, 65, 0.12)',
                border: '1px solid rgba(255, 108, 65, 0.35)',
                color: '#C2410C',
                fontSize: '0.785rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                lineHeight: 1.4
              }}
            >
              <AlertTriangle size={14} strokeWidth={2} style={{ flexShrink: 0, color: '#C2410C' }} />
              <span>
                {language === 'ka'
                  ? 'ავტომატურად ამოღებულია როტაციიდან და შოუებიდან'
                  : 'Automatically excluded from rotation and show lineups'}
              </span>
            </div>
          )}

          {/* Tab Navigation Buttons - Segmented Pill Control */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px',
              border: '1px solid var(--border-subtle)',
              gap: '6px',
              height: '46px',
              boxSizing: 'border-box'
            }}
          >
            <button
              type="button"
              onClick={() => handleTabSelect('info')}
              title={language === 'ka' ? 'პირადი ინფორმაცია' : 'Personal Information'}
              style={{
                flex: 1,
                height: '38px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '0 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'info' ? 650 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minWidth: 0,
                background: activeTab === 'info' ? 'var(--brand-primary)' : 'transparent',
                color: activeTab === 'info' ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: activeTab === 'info' ? '0 2px 10px var(--brand-primary-glow)' : 'none',
                transition: 'background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast)'
              }}
            >
              <User size={15} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>{t('tab_personal_info')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSelect('docs')}
              title={language === 'ka' ? 'დოკუმენტები' : 'Documents'}
              style={{
                flex: 1,
                position: 'relative',
                height: '38px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '0 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'docs' ? 650 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minWidth: 0,
                background: activeTab === 'docs' ? 'var(--brand-primary)' : 'transparent',
                color: activeTab === 'docs' ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: activeTab === 'docs' ? '0 2px 10px var(--brand-primary-glow)' : 'none',
                transition: 'background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast)'
              }}
            >
              <FileText size={15} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>{t('tab_documentation')}</span>
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '8px',
                  fontSize: '0.675rem',
                  fontWeight: 750,
                  background: activeTab === 'docs' ? '#FFFFFF' : 'var(--brand-primary)',
                  color: activeTab === 'docs' ? 'var(--brand-primary)' : '#FFFFFF',
                  borderRadius: '9999px',
                  padding: '0 5px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: activeTab === 'docs' ? '0 2px 6px rgba(0, 0, 0, 0.16)' : '0 2px 6px rgba(30, 106, 255, 0.28)',
                  border: activeTab === 'docs' ? '1.5px solid rgba(255,255,255,0.9)' : '1.5px solid #FFFFFF',
                  lineHeight: 1,
                  zIndex: 2,
                  pointerEvents: 'none'
                }}
              >
                {talent.documents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSelect('stats')}
              title={language === 'ka' ? 'მორიგეობის სტატისტიკა' : 'Duty Statistics'}
              style={{
                flex: 1,
                height: '38px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '0 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'stats' ? 650 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minWidth: 0,
                background: activeTab === 'stats' ? 'var(--brand-primary)' : 'transparent',
                color: activeTab === 'stats' ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: activeTab === 'stats' ? '0 2px 10px var(--brand-primary-glow)' : 'none',
                transition: 'background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast)'
              }}
            >
              <BarChart3 size={15} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>{t('tab_duty_stats')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Scrollable Tab Content Container */}
      <div
        ref={contentScrollRef}
        className="thin-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          padding: '20px 24px 28px 24px'
        }}
      >
        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === 'info' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {/* Email */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  <Mail size={16} style={{ color: 'var(--color-charcoal)', opacity: 0.7 }} />
                  {t('email_address')}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-charcoal)', wordBreak: 'break-all', textAlign: 'right' }}>
                  {talent.email}
                </span>
              </div>

              {/* Phone */}
              {talent.phone && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                    <Phone size={16} style={{ color: 'var(--color-charcoal)', opacity: 0.7 }} />
                    {t('phone_number')}
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(() => {
                      const country = getCountryFromPhone(talent.phone);
                      const cleanDigits = talent.phone.replace(/[^0-9]/g, '');
                      return (
                        <>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: 'var(--color-charcoal)',
                              background: 'var(--bg-canvas)',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-subtle)'
                            }}
                            title={country ? (language === 'ka' ? country.nameKa : country.name) : undefined}
                          >
                            {country && <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{country.flag}</span>}
                            <span>{talent.phone}</span>
                          </div>

                          {/* Quick Actions: WhatsApp, Call, Copy */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {cleanDigits && (
                              <a
                                href={`https://wa.me/${cleanDigits}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '8px',
                                  background: '#25D36615',
                                  color: '#25D366',
                                  border: '1px solid #25D36630',
                                  transition: 'all 0.15s ease',
                                  textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#25D366';
                                  e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#25D36615';
                                  e.currentTarget.style.color = '#25D366';
                                }}
                              >
                                <MessageSquare size={14} />
                              </a>
                            )}

                            <a
                              href={`tel:${talent.phone}`}
                              title={language === 'ka' ? 'დარეკვა' : 'Call'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: 'var(--brand-primary-light, #FF6C4115)',
                                color: 'var(--brand-primary, #FF6C41)',
                                border: '1px solid var(--brand-primary-light, #FF6C4130)',
                                transition: 'all 0.15s ease',
                                textDecoration: 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--brand-primary, #FF6C41)';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--brand-primary-light, #FF6C4115)';
                                e.currentTarget.style.color = 'var(--brand-primary, #FF6C41)';
                              }}
                            >
                              <PhoneCall size={14} />
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(talent.phone);
                                setCopiedPhone(true);
                                setTimeout(() => setCopiedPhone(false), 2000);
                              }}
                              title={copiedPhone ? (language === 'ka' ? 'დაკოპირებულია!' : 'Copied!') : (language === 'ka' ? 'ნომრის კოპირება' : 'Copy number')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: copiedPhone ? '#10B98115' : 'var(--bg-canvas)',
                                color: copiedPhone ? '#10B981' : 'var(--color-text-secondary)',
                                border: `1px solid ${copiedPhone ? '#10B98140' : 'var(--border-subtle)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {copiedPhone ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Gender, Height & Weight */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {t('gender_height_weight')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GenderBadge gender={talent.gender} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                    {talent.heightCm} {language === 'ka' ? 'სმ' : 'cm'}
                    {talent.weightKg ? ` • ${talent.weightKg} ${language === 'ka' ? 'კგ' : 'kg'}` : ''}
                  </span>
                </div>
              </div>

              {/* Groups */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  <Layers size={16} style={{ color: 'var(--color-charcoal)', opacity: 0.7 }} />
                  {t('nav_groups')}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-charcoal)', textAlign: 'right' }}>
                  {memberGroups.length > 0 ? memberGroups.map((g) => g.name).join(', ') : t('none')}
                </span>
              </div>

              {/* Internal Notes Card */}
              {talent.notes && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '16px 18px',
                    borderRadius: '16px',
                    background: 'var(--bg-surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-charcoal)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FileText size={14} strokeWidth={2} style={{ flexShrink: 0 }} /> {t('internal_notes')}
                    </span>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        color: 'var(--color-text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      {new Date().toLocaleDateString(language === 'ka' ? 'ka-GE' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-charcoal)',
                      lineHeight: 1.55,
                      margin: 0
                    }}
                  >
                    "{talent.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENTATION */}
        {activeTab === 'docs' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {t('docs_and_credentials')} ({talent.documents.length})
              </span>
              {allDocTypesUploaded ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                  {isKa ? 'ყველა ტიპის დოკუმენტი ატვირთულია' : 'All document types uploaded'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleAddDoc}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} /> {t('add_document')}
                </button>
              )}
            </div>

            {showAddDoc && (
              <form
                onSubmit={handleAddDocument}
                style={{
                  background: 'var(--bg-surface-secondary)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '18px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {/* 1. Document Type Selector */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <label style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                      {isKa ? 'დოკუმენტის ტიპი *' : 'Document Type *'}
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                      {isKa ? 'უნიკალური ტიპი (1 თითო თანამშრომელზე)' : 'Unique type (1 per talent)'}
                    </span>
                  </div>
                  <select
                    value={newDocType}
                    onChange={(e) => handleDocTypeSelect(e.target.value as TalentDocument['type'])}
                    className="form-select"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    {DOCUMENT_TYPES.map((dt) => {
                      const isUploaded = existingDocTypes.has(dt.value);
                      return (
                        <option key={dt.value} value={dt.value} disabled={isUploaded}>
                          {isKa ? dt.labelKa : dt.labelEn} {isUploaded ? (isKa ? '— (უკვე ატვირთულია)' : '— (Already uploaded)') : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 2. File Upload Dropzone */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <label style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                      {isKa ? 'დოკუმენტის ფაილი *' : 'Document File *'}
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      {isKa ? 'არჩეული ტიპი:' : 'Type:'} <strong style={{ color: 'var(--brand-primary)' }}>{currentTypeLabel}</strong>
                    </span>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="talent-drawer-file-upload"
                  />

                  {!selectedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '18px 14px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--bg-surface)',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--brand-primary)';
                        e.currentTarget.style.background = 'rgba(30, 106, 255, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-medium)';
                        e.currentTarget.style.background = 'var(--bg-surface)';
                      }}
                    >
                      <UploadCloud size={24} style={{ color: 'var(--brand-primary)', margin: '0 auto 6px auto' }} />
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                        {isKa ? `დააკლიკეთ „${currentTypeLabel}“-ის ასარჩევად` : `Click to select "${currentTypeLabel}" file`}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          padding: '2px 8px', 
                          background: 'var(--bg-surface-secondary)', 
                          borderRadius: 'var(--radius-pill)', 
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: 'var(--brand-primary)' 
                        }}>
                          {currentTypeLabel}
                        </span>
                        <span>PDF, DOC, DOCX, JPG, PNG (მაქს. 10MB)</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: 'var(--radius-xs)',
                            background: currentTypeObj.bg,
                            color: currentTypeObj.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            flexShrink: 0
                          }}
                        >
                          {currentTypeObj.short}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedFile.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ 
                              fontWeight: 600, 
                              color: currentTypeObj.color,
                              background: currentTypeObj.bg,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '0.675rem'
                            }}>
                              {currentTypeLabel}
                            </span>
                            <span>•</span>
                            <span style={{ fontWeight: 600 }}>{selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                            <span>•</span>
                            <span>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer'
                          }}
                        >
                          {isKa ? 'შეცვლა' : 'Change'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex'
                          }}
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Document Title Input */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <label style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                      {isKa ? 'დოკუმენტის დასახელება *' : 'Document Title *'}
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                      {isKa ? '(ივსება ავტომატურად, შესაძლებელია რედაქტირება)' : '(Auto-filled, editable)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder={isKa ? 'შეიყვანეთ დოკუმენტის სახელი' : 'Enter document title'}
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.825rem' }}
                    required
                  />
                </div>

                {/* 4. Contract Expiration Date (ONLY shown when newDocType === 'Contract') */}
                {newDocType === 'Contract' && (
                  <div
                    style={{
                      background: 'rgba(30, 106, 255, 0.04)',
                      border: '1px solid rgba(30, 106, 255, 0.22)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '0.785rem', fontWeight: 650, color: 'var(--color-charcoal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: 'var(--brand-primary)' }} />
                        <span>{t('contract_expiry_date')} *</span>
                      </label>
                      {isParsingDoc && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Loader2 size={13} className="animate-spin" />
                          <span>{t('analyzing_file')}</span>
                        </span>
                      )}
                      {!isParsingDoc && parseDetected === true && (
                        <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={12} />
                          <span>{t('auto_detected_date')} ✓</span>
                        </span>
                      )}
                    </div>

                    <input
                      type="date"
                      value={newDocExpiryDate}
                      onChange={(e) => {
                        setNewDocExpiryDate(e.target.value);
                        setParseDetected(null);
                      }}
                      className="form-input"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.825rem' }}
                      required
                    />

                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {parseDetected === false ? (
                        <span style={{ color: '#D97706', fontWeight: 500 }}>
                          ⚠️ {t('manual_date_hint')}
                        </span>
                      ) : (
                        <span>{t('contract_expiry_hint')}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDoc(false);
                      setSelectedFile(null);
                      setNewDocName('');
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!selectedFile || !newDocName.trim()}
                    style={{ padding: '7px 18px', fontSize: '0.8rem' }}
                  >
                    {t('save')}
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {talent.documents.map((doc) => {
                const docTypeObj = DOCUMENT_TYPES.find((dt) => dt.value === doc.type) || DOCUMENT_TYPES[0];
                const docTypeLabel = isKa ? docTypeObj.labelKa : docTypeObj.labelEn;
                return (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: 'var(--radius-xs)',
                          background: docTypeObj.bg,
                          color: docTypeObj.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {docTypeObj.short}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            fontWeight: 600, 
                            color: docTypeObj.color,
                            background: docTypeObj.bg,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '0.675rem'
                          }}>
                            {docTypeLabel}
                          </span>
                          <span>•</span>
                          <span>{doc.fileSize || '2.0 MB'}</span>
                          {doc.expiryDate && (
                            <>
                              <span>•</span>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 650,
                                color: new Date(doc.expiryDate).getTime() < Date.now()
                                  ? '#DC2626'
                                  : Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30
                                  ? '#D97706'
                                  : '#15803D'
                              }}>
                                <Calendar size={11} />
                                <span>{t('valid_until')} {doc.expiryDate}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '5px' }} title="View">
                        <ExternalLink size={14} />
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px'
                        }}
                        title={isKa ? 'დოკუმენტის წაშლა' : 'Delete document'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DUTY STATISTICS & HISTORY */}
        {activeTab === 'stats' && (
          <div>
            {/* Overview Card */}
            <div
              style={{
                background: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                  {t('total_shifts_handled')}:
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                  {totalDutiesServed}
                </span>
              </div>

              <SplitProgressBar
                yellowPercent={Math.min(100, totalDutiesServed * 20)}
                darkPercent={25}
                stripedPercent={15}
                height={10}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.725rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: '10px'
                }}
              >
                <span>{t('round_robin_pool')}</span>
                <span>{t('fairness_score')}</span>
              </div>
            </div>

            {/* Inner Sub-Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                padding: '4px',
                background: 'var(--bg-surface-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '14px'
              }}
            >
              {([
                {
                  key: 'rotation' as const,
                  label: isKa ? 'როტაცია' : 'Rotation',
                  icon: <Sparkles size={13} strokeWidth={2} />,
                  count: servedShifts.length
                },
                {
                  key: 'shows' as const,
                  label: isKa ? 'შოუები' : 'Shows',
                  icon: <Calendar size={13} strokeWidth={2} />,
                  count: talentShows.length
                }
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatsSubTab(tab.key)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 10px',
                    borderRadius: '9px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: statsSubTab === tab.key ? 700 : 500,
                    background: statsSubTab === tab.key ? 'var(--bg-surface)' : 'transparent',
                    color: statsSubTab === tab.key ? 'var(--color-charcoal)' : 'var(--color-text-secondary)',
                    boxShadow: statsSubTab === tab.key ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      minWidth: '18px',
                      height: '18px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: statsSubTab === tab.key ? 'var(--brand-primary)' : 'var(--border-medium)',
                      color: statsSubTab === tab.key ? '#fff' : 'var(--color-text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Rotation Sub-Tab */}
            {statsSubTab === 'rotation' && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  <span>{t('duty_history')}</span>
                </div>

                {servedShifts.length === 0 ? (
                  <div
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px dashed var(--border-medium)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <Info size={18} style={{ marginBottom: '6px', opacity: 0.5 }} />
                    <div>{t('no_shifts_yet')}</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {servedShifts.map((shift, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-secondary)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                            {shift.eventTitle}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span>{new Date(shift.eventDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            background: 'var(--brand-primary)',
                            color: '#FFFFFF',
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid var(--brand-primary-hover)'
                          }}
                        >
                          {shift.itemName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Shows Sub-Tab */}
            {statsSubTab === 'shows' && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} />
                  <span>{isKa ? 'შოუების ისტორია' : 'Show History'}</span>
                </div>

                {talentShows.length === 0 ? (
                  <div
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px dashed var(--border-medium)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <Info size={18} style={{ marginBottom: '6px', opacity: 0.5 }} />
                    <div>{isKa ? 'შოუები Ⴉარ არის' : 'No shows yet'}</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {talentShows.map((ev) => {
                      const isPast = new Date(ev.endDateTime) < new Date();
                      const startDt = new Date(ev.startDateTime);
                      const endDt = new Date(ev.endDateTime);
                      const venue = groups.find((g) => g.id === ev.groupId);
                      return (
                        <div
                          key={ev.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: isPast ? 'rgba(0,0,0,0.02)' : 'rgba(30,106,255,0.04)',
                            border: `1px solid ${isPast ? 'var(--border-subtle)' : 'rgba(30,106,255,0.15)'}`,
                            fontSize: '0.8rem',
                            opacity: isPast ? 0.82 : 1
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '8px' }}>
                              {ev.title}
                            </div>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: 'var(--radius-pill)',
                                background: isPast ? 'var(--bg-surface-secondary)' : 'rgba(30,106,255,0.1)',
                                color: isPast ? 'var(--color-text-secondary)' : 'var(--brand-primary)',
                                border: `1px solid ${isPast ? 'var(--border-subtle)' : 'rgba(30,106,255,0.2)'}`,
                                flexShrink: 0,
                                display: 'flex', alignItems: 'center', gap: '3px'
                              }}
                            >
                              {isPast && <Check size={10} strokeWidth={2.5} />}
                              {isPast ? (isKa ? 'დასრულდა' : 'Done') : (isKa ? 'დაგეგმილი' : 'Upcoming')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Calendar size={11} strokeWidth={2} />
                              {startDt.toLocaleDateString(isKa ? 'ka-GE' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={11} strokeWidth={2} />
                              {startDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {endDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};
