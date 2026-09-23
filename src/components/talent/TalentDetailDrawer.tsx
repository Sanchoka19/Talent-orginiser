'use client';

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
  badgeClass: string;
  bg: string;
  color: string;
}[] = [
  { value: 'Passport', labelKa: 'პასპორტი', labelEn: 'Passport', short: 'PAS', badgeClass: 'bg-sky-100 text-sky-700', bg: '#E0F2FE', color: '#0284C7' },
  { value: 'Visa', labelKa: 'ვიზა', labelEn: 'Visa', short: 'VISA', badgeClass: 'bg-amber-100 text-amber-800', bg: '#FEF3C7', color: '#B45309' },
  { value: 'ID Card', labelKa: 'პირადობის მოწმობა', labelEn: 'ID Card', short: 'ID', badgeClass: 'bg-indigo-100 text-indigo-700', bg: '#E0E7FF', color: '#4338CA' },
  { value: 'Medical', labelKa: 'სამედიცინო ცნობა', labelEn: 'Medical Clearance', short: 'MED', badgeClass: 'bg-red-100 text-red-700', bg: '#FEE2E2', color: '#DC2626' },
  { value: 'Contract', labelKa: 'კონტრაქტი', labelEn: 'Contract', short: 'CON', badgeClass: 'bg-emerald-100 text-emerald-800', bg: '#DCFCE7', color: '#15803D' },
  { value: 'Other', labelKa: 'სხვა დოკუმენტი', labelEn: 'Other Document', short: 'DOC', badgeClass: 'bg-zinc-100 text-zinc-700', bg: '#F3F4F6', color: '#4B5563' },
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
      <div className="shrink-0 bg-surface border-b border-border-subtle relative z-[5]">
        {/* Hero Banner with Modern Brand Aura */}
        <div className="h-[84px] bg-[radial-gradient(circle_at_75%_20%,#FF6C41_0%,#004F72_55%,#082734_95%)] relative p-5">
          <div className="absolute -bottom-[42px] left-6 flex items-end gap-4">
            <img
              src={
                talent.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.firstName}${talent.lastName}`
              }
              alt={talent.firstName}
              className="w-[88px] h-[88px] rounded-full object-cover border-4 border-white shadow-lg bg-white"
            />
          </div>
        </div>

        {/* Profile Header Info */}
        <div className="pt-12 px-6 pb-3.5">
          <div className="flex items-start justify-between mb-3.5">
            <div>
              <h2 className="text-[1.35rem] font-bold text-text-primary tracking-tight m-0">
                {talent.firstName} {talent.lastName}
              </h2>
              <p className="text-[0.85rem] text-text-secondary mt-0.5 m-0">
                {talent.primarySkill}
              </p>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => onEdit(talent)}
                className="w-8.5 h-8.5 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
                title={t('edit_performer')}
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={handleDelete}
                className="w-8.5 h-8.5 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface-secondary text-danger hover:bg-danger-light hover:border-danger-border transition-all duration-150 cursor-pointer outline-none"
                title={t('delete')}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Status Selector Custom Dropdown */}
          <div
            ref={statusDropdownRef}
            className={`relative flex items-center justify-between gap-3 px-3 py-2 rounded-sm bg-surface-secondary border border-border-subtle ${
              talent.status !== 'Active' ? 'mb-2.5' : 'mb-3.5'
            }`}
          >
            <span className="text-[0.825rem] font-semibold text-text-secondary">
              {t('availability_status')}:
            </span>

            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-pill border text-[0.825rem] font-semibold cursor-pointer transition-all ${
                talent.status === 'Active'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                  : talent.status === 'Rest'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-700'
                  : 'border-danger/30 bg-danger/10 text-danger'
              }`}
            >
              <span
                className={`w-[7px] h-[7px] rounded-full ${
                  talent.status === 'Active'
                    ? 'bg-emerald-600'
                    : talent.status === 'Rest'
                    ? 'bg-amber-600'
                    : 'bg-danger'
                }`}
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
                className={`transition-transform duration-150 ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Status Dropdown Menu */}
            {isStatusDropdownOpen && (
              <div className="absolute top-[calc(100%+6px)] right-3 min-w-[160px] bg-surface rounded-md border border-border-medium shadow-modal z-[200] overflow-hidden py-1">
                {(['Active', 'Rest', 'Sick/Injured'] as TalentStatus[]).map((st) => {
                  const isSelected = talent.status === st;
                  const dotColor = st === 'Active' ? 'bg-emerald-600' : st === 'Rest' ? 'bg-amber-600' : 'bg-danger';
                  const textColor = st === 'Active' ? 'text-emerald-700' : st === 'Rest' ? 'text-amber-700' : 'text-danger';
                  const label = st === 'Active' ? t('status_active') : st === 'Rest' ? t('status_rest') : t('status_sick');

                  return (
                    <div
                      key={st}
                      onClick={() => {
                        handleStatusChange(st);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-[0.825rem] flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'font-bold bg-surface-secondary text-text-primary'
                          : 'font-medium text-text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-[7px] h-[7px] rounded-full ${dotColor}`} />
                        <span>{label}</span>
                      </div>
                      {isSelected && <Check size={14} className={textColor} strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compact, Refined Warning Notice */}
          {talent.status !== 'Active' && (
            <div className="mb-3 px-3 py-2 rounded-sm bg-accent-orange/10 border border-accent-orange/30 text-accent-orange text-[0.785rem] font-medium flex items-center gap-2 leading-relaxed">
              <AlertTriangle size={14} strokeWidth={2} className="shrink-0 text-accent-orange" />
              <span>
                {language === 'ka'
                  ? 'ავტომატურად ამოღებულია როტაციიდან და შოუებიდან'
                  : 'Automatically excluded from rotation and show lineups'}
              </span>
            </div>
          )}

          {/* Tab Navigation Buttons - Segmented Pill Control */}
          <div className="flex items-center bg-surface-secondary rounded-pill p-1 border border-border-subtle gap-1.5 h-[46px] box-border">
            <button
              type="button"
              onClick={() => handleTabSelect('info')}
              title={language === 'ka' ? 'პირადი ინფორმაცია' : 'Personal Information'}
              className={`flex-1 h-[38px] flex items-center justify-center gap-1.5 px-4 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${
                activeTab === 'info'
                  ? 'font-bold bg-brand-primary text-white shadow-glow'
                  : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <User size={15} className="shrink-0" />
              <span className="whitespace-nowrap">{t('tab_personal_info')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSelect('docs')}
              title={language === 'ka' ? 'დოკუმენტები' : 'Documents'}
              className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-4 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${
                activeTab === 'docs'
                  ? 'font-bold bg-brand-primary text-white shadow-glow'
                  : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <FileText size={15} className="shrink-0" />
              <span className="whitespace-nowrap">{t('tab_documentation')}</span>
              <span
                className={`absolute -top-[3px] right-2 text-[0.675rem] font-bold rounded-pill px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none z-[2] pointer-events-none border-[1.5px] ${
                  activeTab === 'docs'
                    ? 'bg-white text-brand-primary shadow-sm border-white/90'
                    : 'bg-brand-primary text-white shadow-glow border-white'
                }`}
              >
                {talent.documents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSelect('stats')}
              title={language === 'ka' ? 'მორიგეობის სტატისტიკა' : 'Duty Statistics'}
              className={`flex-1 h-[38px] flex items-center justify-center gap-1.5 px-4 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${
                activeTab === 'stats'
                  ? 'font-bold bg-brand-primary text-white shadow-glow'
                  : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <BarChart3 size={15} className="shrink-0" />
              <span className="whitespace-nowrap">{t('tab_duty_stats')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Scrollable Tab Content Container */}
      <div
        ref={contentScrollRef}
        className="thin-scrollbar flex-1 overflow-y-auto min-h-0 px-6 pt-5 pb-7"
      >
        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === 'info' && (
          <div>
            <div className="flex flex-col gap-0.5">
              {/* Email */}
              <div className="flex items-center justify-between py-3 border-b border-border-subtle gap-3">
                <span className="text-sm text-text-secondary flex items-center gap-2 font-medium">
                  <Mail size={16} className="text-text-primary opacity-70" />
                  {t('email_address')}
                </span>
                <span className="text-[0.9rem] font-semibold text-text-primary break-all text-right">
                  {talent.email}
                </span>
              </div>

              {/* Phone */}
              {talent.phone && (
                <div className="flex items-center justify-between py-3 border-b border-border-subtle gap-3 flex-wrap">
                  <span className="text-sm text-text-secondary flex items-center gap-2 font-medium">
                    <Phone size={16} className="text-text-primary opacity-70" />
                    {t('phone_number')}
                  </span>

                  <div className="flex items-center gap-2">
                    {(() => {
                      const country = getCountryFromPhone(talent.phone);
                      const cleanDigits = talent.phone.replace(/[^0-9]/g, '');
                      return (
                        <>
                          <div
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-primary bg-canvas px-2.5 py-1 rounded-sm border border-border-subtle"
                            title={country ? (language === 'ka' ? country.nameKa : country.name) : undefined}
                          >
                            {country && <span className="text-[1.05rem] leading-none">{country.flag}</span>}
                            <span>{talent.phone}</span>
                          </div>

                          {/* Quick Actions: WhatsApp, Call, Copy */}
                          <div className="flex items-center gap-1">
                            {cleanDigits && (
                              <a
                                href={`https://wa.me/${cleanDigits}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                                className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-sm bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366] hover:text-white transition-all duration-150 no-underline"
                              >
                                <MessageSquare size={14} />
                              </a>
                            )}

                            <a
                              href={`tel:${talent.phone}`}
                              title={language === 'ka' ? 'დარეკვა' : 'Call'}
                              className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-sm bg-brand-primary-light text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all duration-150 no-underline"
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
                              className={`inline-flex items-center justify-center w-[30px] h-[30px] rounded-sm border cursor-pointer transition-all duration-150 ${
                                copiedPhone
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                  : 'bg-canvas text-text-secondary border-border-subtle hover:text-text-primary hover:bg-surface-tertiary'
                              }`}
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
              <div className="flex items-center justify-between py-3 border-b border-border-subtle gap-3">
                <span className="text-sm text-text-secondary font-medium">
                  {t('gender_height_weight')}
                </span>
                <div className="flex items-center gap-2.5">
                  <GenderBadge gender={talent.gender} />
                  <span className="text-[0.9rem] font-semibold text-text-primary">
                    {talent.heightCm} {language === 'ka' ? 'სმ' : 'cm'}
                    {talent.weightKg ? ` • ${talent.weightKg} ${language === 'ka' ? 'კგ' : 'kg'}` : ''}
                  </span>
                </div>
              </div>

              {/* Groups */}
              <div className="flex items-center justify-between py-3 border-b border-border-subtle gap-3">
                <span className="text-sm text-text-secondary flex items-center gap-2 font-medium">
                  <Layers size={16} className="text-text-primary opacity-70" />
                  {t('nav_groups')}
                </span>
                <span className="text-[0.9rem] font-semibold text-text-primary text-right">
                  {memberGroups.length > 0 ? memberGroups.map((g) => g.name).join(', ') : t('none')}
                </span>
              </div>

              {/* Internal Notes Card */}
              {talent.notes && (
                <div className="mt-4 p-4 rounded-md bg-surface-secondary border border-border-subtle shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} strokeWidth={2} className="shrink-0" /> {t('internal_notes')}
                    </span>
                    <span className="text-[0.725rem] text-text-secondary font-medium">
                      {new Date().toLocaleDateString(language === 'ka' ? 'ka-GE' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed m-0">
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
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[0.8rem] font-semibold text-text-secondary">
                {t('docs_and_credentials')} ({talent.documents.length})
              </span>
              {allDocTypesUploaded ? (
                <span className="text-xs text-text-secondary italic">
                  {isKa ? 'ყველა ტიპის დოკუმენტი ატვირთულია' : 'All document types uploaded'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleAddDoc}
                  className="bg-transparent border-none text-brand-primary text-[0.775rem] font-semibold cursor-pointer flex items-center gap-1 hover:text-brand-primary-hover"
                >
                  <Plus size={14} /> {t('add_document')}
                </button>
              )}
            </div>

            {showAddDoc && (
              <form
                onSubmit={handleAddDocument}
                className="bg-surface-secondary p-4 rounded-sm mb-4.5 border border-border-subtle flex flex-col gap-3.5"
              >
                {/* 1. Document Type Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[0.785rem] font-semibold text-text-primary">
                      {isKa ? 'დოკუმენტის ტიპი *' : 'Document Type *'}
                    </label>
                    <span className="text-[0.7rem] text-text-secondary">
                      {isKa ? 'უნიკალური ტიპი (1 თითო თანამშრომელზე)' : 'Unique type (1 per talent)'}
                    </span>
                  </div>
                  <select
                    value={newDocType}
                    onChange={(e) => handleDocTypeSelect(e.target.value as TalentDocument['type'])}
                    className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface text-text-primary outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[0.785rem] font-semibold text-text-primary">
                      {isKa ? 'დოკუმენტის ფაილი *' : 'Document File *'}
                    </label>
                    <span className="text-[0.72rem] text-text-secondary font-medium">
                      {isKa ? 'არჩეული ტიპი:' : 'Type:'} <strong className="text-brand-primary">{currentTypeLabel}</strong>
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="talent-drawer-file-upload"
                  />

                  {!selectedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border-medium rounded-sm p-4.5 text-center cursor-pointer bg-surface hover:border-brand-primary hover:bg-brand-primary-light/50 transition-all duration-150"
                    >
                      <UploadCloud size={24} className="text-brand-primary mx-auto mb-1.5" />
                      <div className="text-[0.84rem] font-semibold text-text-primary">
                        {isKa ? `დააკლიკეთ „${currentTypeLabel}“-ის ასარჩევად` : `Click to select "${currentTypeLabel}" file`}
                      </div>
                      <div className="text-[0.725rem] text-text-secondary mt-1 flex items-center justify-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 bg-surface-secondary rounded-pill border border-border-subtle text-[0.7rem] font-semibold text-brand-primary">
                          {currentTypeLabel}
                        </span>
                        <span>PDF, DOC, DOCX, JPG, PNG (მაქს. 10MB)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 sm:px-3.5 bg-surface border border-border-medium rounded-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8.5 h-8.5 rounded-xs flex items-center justify-center font-bold text-xs shrink-0 ${currentTypeObj.badgeClass}`}
                        >
                          {currentTypeObj.short}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[0.825rem] font-semibold text-text-primary truncate">
                            {selectedFile.name}
                          </div>
                          <div className="text-[0.72rem] text-text-secondary flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`font-semibold px-1.5 py-0.5 rounded text-[0.675rem] ${currentTypeObj.badgeClass}`}
                            >
                              {currentTypeLabel}
                            </span>
                            <span>•</span>
                            <span className="font-semibold">{selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                            <span>•</span>
                            <span>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-transparent border border-border-subtle rounded px-2 py-1 text-[0.725rem] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary cursor-pointer transition-colors"
                        >
                          {isKa ? 'შეცვლა' : 'Change'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="bg-transparent border-none text-danger hover:bg-danger-light rounded p-1 cursor-pointer flex transition-colors"
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[0.785rem] font-semibold text-text-primary">
                      {isKa ? 'დოკუმენტის დასახელება *' : 'Document Title *'}
                    </label>
                    <span className="text-[0.7rem] text-text-secondary">
                      {isKa ? '(ივსება ავტომატურად, შესაძლებელია რედაქტირება)' : '(Auto-filled, editable)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder={isKa ? 'შეიყვანეთ დოკუმენტის სახელი' : 'Enter document title'}
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-sm border border-border-subtle bg-surface text-text-primary outline-none transition-all duration-150 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 placeholder:text-text-tertiary"
                    required
                  />
                </div>

                {/* 4. Contract Expiration Date (ONLY shown when newDocType === 'Contract') */}
                {newDocType === 'Contract' && (
                  <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-sm p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.785rem] font-semibold text-text-primary flex items-center gap-1.5">
                        <Calendar size={14} className="text-brand-primary" />
                        <span>{t('contract_expiry_date')} *</span>
                      </label>
                      {isParsingDoc && (
                        <span className="text-[0.72rem] text-brand-primary font-semibold flex items-center gap-1.5">
                          <Loader2 size={13} className="animate-spin" />
                          <span>{t('analyzing_file')}</span>
                        </span>
                      )}
                      {!isParsingDoc && parseDetected === true && (
                        <span className="text-[0.72rem] text-emerald-600 font-semibold flex items-center gap-1">
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
                      className="w-full text-xs px-3 py-2 rounded-sm border border-border-subtle bg-surface text-text-primary outline-none transition-all duration-150 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                      required
                    />

                    <div className="text-[0.7rem] text-text-secondary mt-0.5">
                      {parseDetected === false ? (
                        <span className="text-amber-600 font-medium">
                          ⚠️ {t('manual_date_hint')}
                        </span>
                      ) : (
                        <span>{t('contract_expiry_hint')}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDoc(false);
                      setSelectedFile(null);
                      setNewDocName('');
                    }}
                    className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-pill text-xs font-semibold border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-4.5 py-1.5 rounded-pill text-xs font-semibold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 cursor-pointer outline-none"
                    disabled={!selectedFile || !newDocName.trim()}
                  >
                    {t('save')}
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-2">
              {talent.documents.map((doc) => {
                const docTypeObj = DOCUMENT_TYPES.find((dt) => dt.value === doc.type) || DOCUMENT_TYPES[0];
                const docTypeLabel = isKa ? docTypeObj.labelKa : docTypeObj.labelEn;
                const isExpired = doc.expiryDate && new Date(doc.expiryDate).getTime() < Date.now();
                const isExpiringSoon = doc.expiryDate && !isExpired && Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30;

                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 sm:px-3.5 rounded-sm bg-surface-secondary border border-border-subtle hover:border-border-medium transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8.5 h-8.5 rounded-xs flex items-center justify-center text-xs font-bold shrink-0 ${docTypeObj.badgeClass}`}
                      >
                        {docTypeObj.short}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[0.825rem] font-semibold text-text-primary truncate">
                          {doc.name}
                        </div>
                        <div className="text-[0.725rem] text-text-secondary flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span
                            className={`font-semibold px-1.5 py-0.5 rounded text-[0.675rem] ${docTypeObj.badgeClass}`}
                          >
                            {docTypeLabel}
                          </span>
                          <span>•</span>
                          <span>{doc.fileSize || '2.0 MB'}</span>
                          {doc.expiryDate && (
                            <>
                              <span>•</span>
                              <span className={`inline-flex items-center gap-1 font-semibold ${
                                isExpired ? 'text-danger' : isExpiringSoon ? 'text-amber-600' : 'text-emerald-700'
                              }`}>
                                <Calendar size={11} />
                                <span>{t('valid_until')} {doc.expiryDate}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-text-tertiary hover:text-text-primary cursor-pointer p-1.5 transition-colors" title="View">
                        <ExternalLink size={14} />
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                        className="bg-transparent border-none text-danger hover:bg-danger-light cursor-pointer p-1.5 flex items-center justify-center rounded transition-colors"
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
            <div className="bg-surface-secondary rounded-sm p-4 border border-border-subtle mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[0.825rem] text-text-secondary">
                  {t('total_shifts_handled')}:
                </span>
                <span className="text-[1.05rem] font-bold text-text-primary">
                  {totalDutiesServed}
                </span>
              </div>

              <SplitProgressBar
                yellowPercent={Math.min(100, totalDutiesServed * 20)}
                darkPercent={25}
                stripedPercent={15}
                height={10}
              />

              <div className="flex justify-between text-[0.725rem] text-text-secondary mt-2.5">
                <span>{t('round_robin_pool')}</span>
                <span>{t('fairness_score')}</span>
              </div>
            </div>

            {/* Inner Sub-Tabs */}
            <div className="flex gap-1.5 p-1 bg-surface-secondary rounded-md border border-border-subtle mb-3.5">
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
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-sm border-none cursor-pointer text-[0.8rem] transition-all duration-150 ${
                    statsSubTab === tab.key
                      ? 'font-bold bg-surface text-text-primary shadow-sm'
                      : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    className={`text-[0.7rem] font-bold min-w-[18px] h-[18px] inline-flex items-center justify-center rounded-full transition-colors ${
                      statsSubTab === tab.key
                        ? 'bg-brand-primary text-white'
                        : 'bg-border-medium text-text-secondary'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Rotation Sub-Tab */}
            {statsSubTab === 'rotation' && (
              <div>
                <div className="text-[0.8rem] font-semibold text-text-secondary mb-2.5 flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{t('duty_history')}</span>
                </div>

                {servedShifts.length === 0 ? (
                  <div className="p-6 text-center bg-surface-secondary rounded-sm border border-dashed border-border-medium text-text-secondary text-[0.8rem]">
                    <Info size={18} className="mb-1.5 mx-auto opacity-50" />
                    <div>{t('no_shifts_yet')}</div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {servedShifts.map((shift, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2.5 rounded-sm bg-surface-secondary border border-border-subtle flex items-center justify-between text-[0.8rem]"
                      >
                        <div>
                          <div className="font-semibold text-text-primary">
                            {shift.eventTitle}
                          </div>
                          <div className="text-[0.725rem] text-text-secondary mt-0.5 flex items-center gap-1">
                            <Calendar size={12} strokeWidth={2} className="shrink-0" />
                            <span>{new Date(shift.eventDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <span className="bg-brand-primary text-white text-[0.725rem] font-semibold px-2 py-0.5 rounded-pill border border-brand-primary-hover">
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
                <div className="text-[0.8rem] font-semibold text-text-secondary mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>{isKa ? 'შოუების ისტორია' : 'Show History'}</span>
                </div>

                {talentShows.length === 0 ? (
                  <div className="p-6 text-center bg-surface-secondary rounded-sm border border-dashed border-border-medium text-text-secondary text-[0.8rem]">
                    <Info size={18} className="mb-1.5 mx-auto opacity-50" />
                    <div>{isKa ? 'შოუები ჯერ არ არის' : 'No shows yet'}</div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {talentShows.map((ev) => {
                      const isPast = new Date(ev.endDateTime) < new Date();
                      const startDt = new Date(ev.startDateTime);
                      const endDt = new Date(ev.endDateTime);
                      return (
                        <div
                          key={ev.id}
                          className={`px-3 py-2.5 rounded-sm border text-[0.8rem] ${
                            isPast
                              ? 'bg-black/[0.02] border-border-subtle opacity-85'
                              : 'bg-brand-primary/5 border-brand-primary/20'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-semibold text-text-primary truncate flex-1 mr-2">
                              {ev.title}
                            </div>
                            <span
                              className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-pill shrink-0 flex items-center gap-1 border ${
                                isPast
                                  ? 'bg-surface-secondary text-text-secondary border-border-subtle'
                                  : 'bg-brand-primary/10 text-brand-primary border-brand-primary/25'
                              }`}
                            >
                              {isPast && <Check size={10} strokeWidth={2.5} />}
                              {isPast ? (isKa ? 'დასრულდა' : 'Done') : (isKa ? 'დაგეგმილი' : 'Upcoming')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[0.725rem] text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} strokeWidth={2} />
                              {startDt.toLocaleDateString(isKa ? 'ka-GE' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
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
