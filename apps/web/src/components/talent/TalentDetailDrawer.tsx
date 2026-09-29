'use client';

import React, { useState, useMemo } from 'react';
import { Talent, TalentStatus, TalentDocument, TalentReview, RehireStatus, ReviewType, ContractRecord } from '../../types/talent';
import { Drawer } from '../common/Drawer';
import { StatusBadge, GenderBadge, RehireBadge } from '../common/Badge';
import { SplitProgressBar } from '../common/ProgressBar';
import { DatePicker } from '../common/DatePicker';
import { getTalentAvatar } from '../../utils/avatarUtils';
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
  Users,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  RotateCw,
  CalendarCheck,
  Info,
  AlertTriangle,
  MessageSquare,
  PhoneCall,
  Copy,
  Check,
  CheckCircle2,
  UploadCloud,
  X,
  Loader2,
  ChevronDown,
  Star,
  UserCheck,
  UserX,
  Lock,
  ShieldCheck,
  MoreVertical,
  Ruler,
  Scale,
  BookMarked,
  Globe,
  CreditCard,
  Stethoscope,
  FileCheck2,
  FolderOpen
} from 'lucide-react';
import { extractContractExpiryDate } from '../../utils/contractParser';
import { getCountryFromPhone } from '../common/PhoneInput';
import { TalentReviewModal } from './TalentReviewModal';
import { CascadeImpactModal } from './CascadeImpactModal';
import { StatusChangeImpactModal, AffectedDutyShift } from './StatusChangeImpactModal';
import {
  analyzeContractTerminationImpact,
  CascadeImpactReport
} from '../../services/cascadeImpactEngine';
import {
  computeHistoricalDutyCounts,
  computeFairnessScore,
  getCycleKey
} from '../../services/rotationEngine';

interface TalentDetailDrawerProps {
  talent: Talent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (talent: Talent) => void;
}

type DrawerTab = 'info' | 'docs' | 'stats' | 'reviews';

export const DOCUMENT_TYPE_ICON: Record<string, React.ElementType> = {
  Passport: BookMarked,
  Visa: Globe,
  'ID Card': CreditCard,
  Medical: Stethoscope,
  Contract: FileCheck2,
  Other: FolderOpen,
};

export const DOCUMENT_TYPES: {
  value: TalentDocument['type'];
  labelKa: string;
  labelEn: string;
  short: string;
  badgeClass: string;
}[] = [
  { value: 'Passport', labelKa: 'პასპორტი', labelEn: 'Passport', short: 'PAS', badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20' },
  { value: 'Visa', labelKa: 'ვიზა', labelEn: 'Visa', short: 'VISA', badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20' },
  { value: 'ID Card', labelKa: 'პირადობის მოწმობა', labelEn: 'ID Card', short: 'ID', badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20' },
  { value: 'Medical', labelKa: 'სამედიცინო ცნობა', labelEn: 'Medical Clearance', short: 'MED', badgeClass: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20' },
  { value: 'Contract', labelKa: 'კონტრაქტი', labelEn: 'Contract', short: 'CON', badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' },
  { value: 'Other', labelKa: 'სხვა დოკუმენტი', labelEn: 'Other Document', short: 'DOC', badgeClass: 'bg-surface-secondary text-text-secondary border border-border-subtle' },
];

export const TalentDetailDrawer: React.FC<TalentDetailDrawerProps> = ({
  talent,
  isOpen,
  onClose,
  onEdit
}) => {
  const { updateTalent, deleteTalent, terminateTalentWithCascade, changeTalentStatusWithDutyResolution, groups, talents, schedule, formatTimeRange } = useApp();
  const { t, language } = useLanguage();
  const { confirm } = useConfirm();
  const toast = useToast();
  const isKa = language === 'ka';

  const [activeTab, setActiveTab] = useState<DrawerTab>('info');
  const [statsSubTab, setStatsSubTab] = useState<'rotation' | 'shows'>('rotation');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewType, setSelectedReviewType] = useState<ReviewType>('End of Season');
  const [isCascadeModalOpen, setIsCascadeModalOpen] = useState(false);
  const [cascadeReport, setCascadeReport] = useState<CascadeImpactReport | null>(null);
  const [pendingTerminationReview, setPendingTerminationReview] = useState<ContractRecord | null>(null);
  const [isStatusImpactModalOpen, setIsStatusImpactModalOpen] = useState(false);
  const [pendingTargetStatus, setPendingTargetStatus] = useState<TalentStatus>('Sick/Injured');
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = React.useRef<HTMLDivElement>(null);
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
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsStatusDropdownOpen(false);
        setIsActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setIsStatusDropdownOpen(false);
      setIsActionsMenuOpen(false);
    }
  }, [isOpen]);

  const handleOpenReview = (type: ReviewType = 'End of Season') => {
    setSelectedReviewType(type);
    setIsReviewModalOpen(true);
  };

  const handleTabSelect = (tab: DrawerTab) => {
    setActiveTab(tab);
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Safe collections
  const servedShifts: {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    itemName: string;
  }[] = useMemo(() => {
    if (!talent || !schedule) return [];
    const shifts: {
      eventId: string;
      eventTitle: string;
      eventDate: string;
      itemName: string;
    }[] = [];

    for (const ev of schedule) {
      if (!ev.dutyAssignments) continue;
      for (const d of ev.dutyAssignments) {
        if (d.assignedTalentIds && d.assignedTalentIds.includes(talent.id)) {
          shifts.push({
            eventId: ev.id,
            eventTitle: ev.title,
            eventDate: ev.startDateTime,
            itemName: d.itemName
          });
        }
      }
    }
    return shifts;
  }, [talent, schedule]);

  const totalDutiesServed = servedShifts.length;

  // Future upcoming shifts for this talent (must be declared before early returns)
  const futureShifts: AffectedDutyShift[] = useMemo(() => {
    if (!talent || !schedule) return [];
    const now = Date.now();
    const upcoming: AffectedDutyShift[] = [];

    for (const ev of schedule) {
      if (ev.status === 'Completed' || ev.status === 'Cancelled') continue;
      if (new Date(ev.startDateTime).getTime() < now) continue;

      for (const d of ev.dutyAssignments || []) {
        if (d.assignedTalentIds && d.assignedTalentIds.includes(talent.id)) {
          let assignedGender = d.assignedGender;
          if (!assignedGender && ev.groupId) {
            const grp = (groups || []).find((g) => g.id === ev.groupId);
            const req = grp?.inventoryRequirements?.find(
              (r) => r.id === d.requirementId || r.itemName === d.itemName
            );
            if (req) assignedGender = req.assignedGender;
          }
          upcoming.push({
            eventId: ev.id,
            eventTitle: ev.title,
            eventDate: ev.startDateTime,
            itemName: d.itemName,
            requirementId: d.requirementId,
            groupId: ev.groupId,
            assignedGender: assignedGender || 'Any'
          });
        }
      }
    }
    return upcoming;
  }, [talent, schedule, groups]);

  // Groups this talent is part of
  const memberGroups = useMemo(() => {
    if (!talent || !groups) return [];
    return groups.filter((g) => g.memberTalentIds && g.memberTalentIds.includes(talent.id));
  }, [talent, groups]);

  // Shows where this talent's group participated
  const talentGroupIds = useMemo(() => new Set(memberGroups.map((g) => g.id)), [memberGroups]);
  const talentShows = useMemo(() => {
    if (!schedule) return [];
    return schedule
      .filter((ev) => talentGroupIds.has(ev.groupId))
      .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
  }, [schedule, talentGroupIds]);

  // Compute real fairness score + this talent's duty share in current cycles
  const { fairnessScore, talentDutySharePct } = useMemo(() => {
    if (!talent || memberGroups.length === 0) {
      return { fairnessScore: 100, talentDutySharePct: 0 };
    }

    let lowestScore = 100;
    let totalTalentDuties = 0;
    let totalGroupDuties = 0;

    for (const group of memberGroups) {
      const cycleWeeks = group.rotationCycleWeeks || 1;
      const cycleKey = getCycleKey(new Date(), cycleWeeks);

      const dutyCounts = computeHistoricalDutyCounts(
        schedule || [],
        group.id,
        cycleKey,
        cycleWeeks
      );

      const score = computeFairnessScore(dutyCounts, group.memberTalentIds || []);
      if (typeof score === 'number' && !isNaN(score) && score < lowestScore) {
        lowestScore = score;
      }

      totalTalentDuties += dutyCounts.get(talent.id) || 0;

      dutyCounts.forEach((v) => {
        totalGroupDuties += v;
      });
    }

    const sharePct =
      totalGroupDuties > 0
        ? Math.round((totalTalentDuties / totalGroupDuties) * 100)
        : 0;

    return {
      fairnessScore: isNaN(lowestScore) ? 100 : lowestScore,
      talentDutySharePct: isNaN(sharePct) ? 0 : sharePct
    };
  }, [memberGroups, schedule, talent?.id]);

  if (!talent) return null;

  // Check if talent contract is expired
  const contractExpiry = talent.contractExpiryDate || talent.documents?.find((d) => d.type === 'Contract')?.expiryDate;
  const isContractExpired = Boolean(
    contractExpiry && new Date(contractExpiry).getTime() <= Date.now()
  );

  const handleStatusChange = (newStatus: TalentStatus) => {
    if (newStatus !== 'Active' && talent.status === 'Active' && futureShifts.length > 0) {
      setPendingTargetStatus(newStatus);
      setIsStatusImpactModalOpen(true);
      return;
    }

    updateTalent(talent.id, { status: newStatus });
    const statusLabel =
      newStatus === 'Active'
        ? (isKa ? 'აქტიური' : 'Active')
        : newStatus === 'Rest'
          ? (isKa ? 'დასვენება' : 'Rest')
          : (isKa ? 'ავად/ტრავმირებული' : 'Sick/Injured');
    toast.success(isKa ? `სტატუსი განახლდა: ${statusLabel}` : `Status updated: ${statusLabel}`);
  };

  const handleConfirmAutoReassign = () => {
    changeTalentStatusWithDutyResolution(talent.id, pendingTargetStatus, {
      mode: 'auto'
    });
    setIsStatusImpactModalOpen(false);
    toast.success(
      isKa
        ? `სტატუსი განახლდა. მორიგეობები ავტომატურად გადაუნაწილდა როტაციის შემდეგ წევრებს.`
        : `Status updated. Duties automatically reallocated to next rotation members.`
    );
  };

  const handleConfirmManualReplacements = (replacements: Record<string, string>) => {
    changeTalentStatusWithDutyResolution(talent.id, pendingTargetStatus, {
      mode: 'manual',
      replacements
    });
    setIsStatusImpactModalOpen(false);
    toast.success(
      isKa
        ? `სტატუსი განახლდა. შემცვლელები წარმატებით დაინიშნა.`
        : `Status updated. Replacements assigned successfully.`
    );
  };

  const existingDocTypes = new Set((talent.documents || []).map((d) => d.type));
  const availableDocTypes = DOCUMENT_TYPES.filter((dt) => !existingDocTypes.has(dt.value));
  const allDocTypesUploaded = availableDocTypes.length === 0;

  const currentTypeObj = DOCUMENT_TYPES.find((dt) => dt.value === newDocType) || DOCUMENT_TYPES[0];
  const currentTypeLabel = isKa ? currentTypeObj.labelKa : currentTypeObj.labelEn;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
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

    if (existingDocTypes.has(newDocType)) {
      toast.error(
        isKa
          ? `დოკუმენტი ტიპით „${currentTypeLabel}" უკვე ატვირთულია ამ თანამშრომელზე!`
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
      documents: [...(talent.documents || []), newDoc]
    });

    toast.success(
      isKa
        ? `დოკუმენტი „${fileName}" (${currentTypeLabel}) წარმატებით დაემატა`
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
        ? `დარწმუნებული ხართ, რომ გსურთ დოკუმენტის „${docName}" წაშლა?`
        : `Are you sure you want to delete the document "${docName}"?`,
      itemName: docName,
      confirmLabel: isKa ? 'წაშლა' : 'Delete',
      cancelLabel: isKa ? 'გაუქმება' : 'Cancel',
      variant: 'danger',
      icon: 'trash',
      onConfirm: () => {
        const updatedDocs = (talent.documents || []).filter((d) => d.id !== docId);
        updateTalent(talent.id, { documents: updatedDocs });
        toast.success(isKa ? `დოკუმენტი „${docName}" წაიშალა` : `Document "${docName}" removed`);
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
            ? `თანამშრომელი „${fullName}" წარმატებით წაიშალა`
            : `Performer "${fullName}" deleted successfully`
        );
        onClose();
      }
    });
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="600px">
      {/* Fixed Top Header */}
      <div className="shrink-0 bg-surface border-b border-border-subtle relative z-[5]">
        <div className="h-[84px] bg-[radial-gradient(circle_at_75%_20%,#FF6C41_0%,#004F72_55%,#082734_95%)] relative p-5">
          <div className="absolute -bottom-[42px] left-6 flex items-end gap-4">
            <img
              src={getTalentAvatar(talent)}
              alt={talent.firstName}
              className="w-[88px] h-[88px] rounded-full object-cover border-4 border-white shadow-lg bg-white"
            />
          </div>
        </div>

        {/* Profile Header Info */}
        <div className="pt-12 px-6 pb-3.5">
          <div className="flex items-start justify-between mb-3.5">
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="text-[1.35rem] font-bold text-text-primary tracking-tight m-0">
                  {talent.firstName} {talent.lastName}
                </h2>
                {talent.rehireStatus && (
                  <RehireBadge status={talent.rehireStatus} />
                )}
              </div>
              <p className="text-[0.85rem] text-text-secondary mt-0.5 m-0">
                {talent.primarySkill}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onEdit(talent)}
                className="w-8.5 h-8.5 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
                title={t('edit_performer')}
              >
                <Edit2 size={15} />
              </button>

              {/* More Actions Dropdown Menu */}
              <div ref={actionsMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsActionsMenuOpen((prev) => !prev)}
                  className={`w-8.5 h-8.5 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none ${isActionsMenuOpen ? 'border-brand-primary text-brand-primary bg-surface-tertiary shadow-xs' : ''}`}
                  title={isKa ? 'სხვა მოქმედებები' : 'More Actions'}
                  aria-expanded={isActionsMenuOpen}
                  aria-haspopup="true"
                >
                  <MoreVertical size={16} />
                </button>

                {isActionsMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1.5 z-40 w-64 p-1 rounded-lg bg-surface border border-border-subtle shadow-lg animate-in fade-in zoom-in-95 duration-150"
                    role="menu"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        handleOpenReview('Early Termination');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-amber-800 dark:text-amber-400 hover:bg-amber-500/10 transition-colors text-left cursor-pointer group"
                      role="menuitem"
                    >
                      <div className="w-6.5 h-6.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <AlertTriangle size={13} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-semibold">{isKa ? 'კონტრაქტის ვადაზე ადრე შეწყვეტა' : 'Terminate Contract Early'}</span>
                        <span className="text-[10px] text-amber-700/70 dark:text-amber-400/70 font-normal truncate">
                          {isKa ? 'ფორსმაჟორი, ტრავმა ან დისციპლინა' : 'Force majeure, injury or discipline'}
                        </span>
                      </div>
                    </button>

                    <div className="my-1 border-t border-border-subtle" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        handleDelete();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer group"
                      role="menuitem"
                    >
                      <div className="w-6.5 h-6.5 rounded bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                        <Trash2 size={13} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-semibold">{isKa ? 'ტალანტის წაშლა' : 'Delete Talent'}</span>
                        <span className="text-[10px] text-rose-500/70 font-normal truncate">
                          {isKa ? 'პროფილის სრული ამოშლა' : 'Permanent profile removal'}
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Selector Dropdown */}
          <div
            ref={statusDropdownRef}
            className={`relative flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-surface-secondary border border-border-subtle ${talent.status !== 'Active' ? 'mb-2.5' : 'mb-3.5'}`}
          >
            <span className="text-xs font-medium text-text-secondary">
              {t('availability_status')}:
            </span>

            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-medium cursor-pointer transition-all ${
                talent.status === 'Active'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                  : talent.status === 'Rest'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-700'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  talent.status === 'Active'
                    ? 'bg-emerald-600'
                    : talent.status === 'Rest'
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
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
                size={13}
                className={`transition-transform duration-150 ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute top-[calc(100%+6px)] right-3 min-w-[160px] bg-surface rounded-md border border-border-subtle shadow-modal z-[200] overflow-hidden py-1">
                {(['Active', 'Rest', 'Sick/Injured'] as TalentStatus[]).map((st) => {
                  const isSelected = talent.status === st;
                  const dotColor = st === 'Active' ? 'bg-emerald-600' : st === 'Rest' ? 'bg-amber-600' : 'bg-rose-600';
                  const textColor = st === 'Active' ? 'text-emerald-700' : st === 'Rest' ? 'text-amber-700' : 'text-rose-600';
                  const label = st === 'Active' ? t('status_active') : st === 'Rest' ? t('status_rest') : t('status_sick');

                  return (
                    <div
                      key={st}
                      onClick={() => {
                        handleStatusChange(st);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'font-semibold bg-surface-secondary text-text-primary'
                          : 'font-normal text-text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span>{label}</span>
                      </div>
                      {isSelected && <Check size={13} className={textColor} strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {talent.status !== 'Active' && (
            <div className="mb-3 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2 leading-relaxed">
              <AlertTriangle size={13} strokeWidth={2} className="shrink-0 text-amber-600" />
              <span>
                {language === 'ka'
                  ? 'ავტომატურად ამოღებულია როტაციიდან და შოუებიდან'
                  : 'Automatically excluded from rotation and show lineups'}
              </span>
            </div>
          )}

          {isContractExpired && (
            <div className="mb-3.5 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-300 leading-tight">
                  {isKa
                    ? 'კონტრაქტის ვადა ამოიწურა — საჭიროებს სეზონის შეფასებას და დახურვას'
                    : 'Contract has expired — requires season evaluation and closure'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenReview('End of Season')}
                className="shrink-0 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                {isKa ? 'შეფასება & დახურვა' : 'Review & Close'}
              </button>
            </div>
          )}

          {/* Segmented Tab Controls */}
          <div className="flex items-center bg-surface-secondary rounded-lg p-0.5 border border-border-subtle gap-0.5 h-[38px] box-border">
            {([
              { key: 'info', icon: User, labelKa: 'ინფო', labelEn: 'Info' },
              { key: 'docs', icon: FileText, labelKa: 'დოკუმენტები', labelEn: 'Docs' },
              { key: 'stats', icon: BarChart3, labelKa: 'სტატისტიკა', labelEn: 'Stats' },
              { key: 'reviews', icon: Star, labelKa: 'შეფასება', labelEn: 'Reviews' },
            ] as { key: DrawerTab; icon: React.ElementType; labelKa: string; labelEn: string }[]).map(({ key, icon: Icon, labelKa, labelEn }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTabSelect(key)}
                className={`flex-1 h-[32px] flex items-center justify-center gap-1.5 px-2 rounded-md border-none text-xs cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${
                  activeTab === key
                    ? 'font-semibold bg-surface text-text-primary shadow-xs border border-border-subtle'
                    : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={13} className="shrink-0" />
                <span className="whitespace-nowrap truncate">{isKa ? labelKa : labelEn}</span>
                {key === 'docs' && (
                  <span className={`text-[10px] font-semibold rounded px-1.5 min-w-[16px] h-[16px] flex items-center justify-center leading-none shrink-0 ${activeTab === 'docs' ? 'bg-surface-secondary text-text-primary border border-border-subtle' : 'bg-surface-secondary text-text-secondary'}`}>
                    {(talent.documents || []).length}
                  </span>
                )}
                {key === 'reviews' && talent.reviews && talent.reviews.length > 0 && (
                  <span className={`text-[10px] font-semibold rounded px-1.5 min-w-[16px] h-[16px] flex items-center justify-center leading-none shrink-0 ${activeTab === 'reviews' ? 'bg-surface-secondary text-text-primary border border-border-subtle' : 'bg-surface-secondary text-text-secondary'}`}>
                    {talent.reviews.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div
        ref={contentScrollRef}
        className="thin-scrollbar flex-1 overflow-y-auto min-h-0 px-6 pt-5 pb-7"
      >
        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === 'info' && (
          <div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between py-3 border-b border-border-subtle gap-3">
                <span className="text-sm text-text-secondary flex items-center gap-2 font-medium">
                  <Mail size={16} className="text-text-primary opacity-70" />
                  {t('email_address')}
                </span>
                <span className="text-[0.9rem] font-semibold text-text-primary break-all text-right">
                  {talent.email}
                </span>
              </div>

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

              <div className="flex items-center justify-between py-3 border-b border-border-subtle gap-3">
                <span className="text-sm text-text-secondary font-medium">{t('gender')}</span>
                <GenderBadge gender={talent.gender} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border-subtle gap-3">
                <span className="text-sm text-text-secondary flex items-center gap-2 font-medium">
                  <Ruler size={16} className="text-text-primary opacity-70" />
                  {isKa ? 'სიმაღლე' : 'Height'}
                </span>
                <span className="text-[0.9rem] font-semibold text-text-primary">
                  {talent.heightCm ? `${talent.heightCm} ${isKa ? 'სმ' : 'cm'}` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border-subtle gap-3">
                <span className="text-sm text-text-secondary flex items-center gap-2 font-medium">
                  <Scale size={16} className="text-text-primary opacity-70" />
                  {isKa ? 'წონა' : 'Weight'}
                </span>
                <span className="text-[0.9rem] font-semibold text-text-primary">
                  {talent.weightKg ? `${talent.weightKg} ${isKa ? 'კგ' : 'kg'}` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border-subtle gap-3">
                <span className="text-sm text-text-secondary flex items-center gap-2 font-medium">
                  <Layers size={16} className="text-text-primary opacity-70" />
                  {t('nav_groups')}
                </span>
                <span className="text-[0.9rem] font-semibold text-text-primary text-right">
                  {memberGroups.length > 0 ? memberGroups.map((g) => g.name).join(', ') : t('none')}
                </span>
              </div>

              {talent.notes && (
                <div className="mt-4 p-4 rounded-md bg-surface-secondary border border-border-subtle shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} strokeWidth={2} className="shrink-0" /> {t('internal_notes')}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed m-0">"{talent.notes}"</p>
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
                {t('docs_and_credentials')} ({(talent.documents || []).length})
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
                className="bg-surface-secondary p-4 rounded-sm mb-4 border border-border-subtle flex flex-col gap-3.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[0.785rem] font-semibold text-text-primary">
                      {isKa ? 'დოკუმენტის ტიპი *' : 'Document Type *'}
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DOCUMENT_TYPES.map((dt) => {
                      const isUploaded = existingDocTypes.has(dt.value);
                      const isSelected = newDocType === dt.value;
                      const DocIcon = DOCUMENT_TYPE_ICON[dt.value] || FolderOpen;
                      return (
                        <button
                          key={dt.value}
                          type="button"
                          disabled={isUploaded}
                          onClick={() => !isUploaded && handleDocTypeSelect(dt.value as TalentDocument['type'])}
                          className={`relative flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                            isUploaded
                              ? 'opacity-35 cursor-not-allowed border-border-subtle bg-surface-secondary text-text-tertiary'
                              : isSelected
                                ? `${dt.badgeClass} border-current shadow-sm cursor-pointer`
                                : 'border-border-subtle bg-surface text-text-secondary hover:border-border-medium hover:text-text-primary cursor-pointer'
                          }`}
                        >
                          <DocIcon size={16} className={isSelected ? 'text-current' : 'text-text-secondary'} />
                          <span className="leading-none text-center">{isKa ? dt.labelKa : dt.labelEn}</span>
                          {isUploaded && <span className="absolute top-1 right-1.5 text-[9px] font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[0.785rem] font-semibold text-text-primary mb-1.5 block">
                    {isKa ? 'დოკუმენტის ფაილი *' : 'Document File *'}
                  </label>
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
                      className="border-2 border-dashed border-border-medium rounded-sm p-4 text-center cursor-pointer bg-surface hover:border-brand-primary hover:bg-brand-primary-light/50 transition-all duration-150"
                    >
                      <UploadCloud size={24} className="text-brand-primary mx-auto mb-1.5" />
                      <div className="text-[0.84rem] font-semibold text-text-primary">
                        {isKa ? `დააკლიკეთ ფაილის ასარჩევად` : `Click to select file`}
                      </div>
                      <div className="text-[0.725rem] text-text-secondary mt-1">
                        PDF, DOC, DOCX, JPG, PNG
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 bg-surface border border-border-medium rounded-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${currentTypeObj.badgeClass}`}>
                          {(() => { const I = DOCUMENT_TYPE_ICON[currentTypeObj.value] || FolderOpen; return <I size={17} />; })()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[0.825rem] font-semibold text-text-primary truncate">{selectedFile.name}</div>
                          <div className="text-[0.72rem] text-text-secondary">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setNewDocName(''); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger-light transition-all cursor-pointer border-none bg-transparent"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {newDocType === 'Contract' && (
                  <div>
                    <label className="text-[0.785rem] font-semibold text-text-primary mb-1.5 block">
                      {isKa ? 'კონტრაქტის ვადა (სურვილისამებრ)' : 'Contract Expiry Date (optional)'}
                    </label>
                    {isParsingDoc ? (
                      <div className="flex items-center gap-2 text-xs text-brand-primary">
                        <Loader2 size={14} className="animate-spin" />
                        <span>{isKa ? 'ვადის ამოცნობა...' : 'Detecting expiry date...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <DatePicker
                          value={newDocExpiryDate}
                          onChange={setNewDocExpiryDate}
                          placeholder={isKa ? 'YYYY-MM-DD' : 'YYYY-MM-DD'}
                        />
                        {parseDetected === true && (
                          <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={13} /> {isKa ? 'ავტო-ამოცნობა' : 'Auto-detected'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddDoc(false)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium border border-border-subtle bg-surface text-text-secondary hover:bg-surface-secondary transition-all cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile}
                    className="px-4 py-1.5 rounded-md text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isKa ? 'დოკუმენტის დამატება' : 'Add Document'}
                  </button>
                </div>
              </form>
            )}

            {/* Documents List */}
            {(talent.documents || []).length === 0 ? (
              <div className="text-center py-10 text-text-tertiary">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{isKa ? 'დოკუმენტები არ არის' : 'No documents uploaded'}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {(talent.documents || []).map((doc) => {
                  const DocIcon = DOCUMENT_TYPE_ICON[doc.type] || FolderOpen;
                  const typeObj = DOCUMENT_TYPES.find((dt) => dt.value === doc.type);
                  const badgeClass = typeObj?.badgeClass || 'bg-surface-secondary text-text-secondary border border-border-subtle';
                  const typeLabel = isKa ? (typeObj?.labelKa || doc.type) : (typeObj?.labelEn || doc.type);
                  const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                  const isExpiringSoon = doc.expiryDate && !isExpired && (new Date(doc.expiryDate).getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000;

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface gap-3 hover:bg-surface-secondary/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${badgeClass}`}>
                          <DocIcon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-text-primary truncate">{doc.name}</div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeClass}`}>{typeLabel}</span>
                            {doc.fileSize && <span className="text-[11px] text-text-tertiary">{doc.fileSize}</span>}
                            {doc.expiryDate && (
                              <span className={`text-[11px] font-semibold flex items-center gap-1 ${isExpired ? 'text-danger' : isExpiringSoon ? 'text-amber-600' : 'text-text-secondary'}`}>
                                {isExpired && <AlertTriangle size={10} />}
                                {isExpiringSoon && <Clock size={10} />}
                                {isKa ? 'ვადა:' : 'Exp:'} {doc.expiryDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id, doc.name)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-danger-light transition-all cursor-pointer border-none bg-transparent opacity-0 group-hover:opacity-100"
                          title={isKa ? 'წაშლა' : 'Delete'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STATISTICS */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-4">
            {/* Sub-tab switcher */}
            <div className="flex items-center gap-2 bg-surface-secondary rounded-lg p-0.5 border border-border-subtle">
              <button
                type="button"
                onClick={() => setStatsSubTab('rotation')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border-none ${statsSubTab === 'rotation' ? 'bg-surface text-text-primary shadow-xs' : 'bg-transparent text-text-secondary hover:text-text-primary'}`}
              >
                {isKa ? 'როტაცია' : 'Rotation'}
              </button>
              <button
                type="button"
                onClick={() => setStatsSubTab('shows')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border-none ${statsSubTab === 'shows' ? 'bg-surface text-text-primary shadow-xs' : 'bg-transparent text-text-secondary hover:text-text-primary'}`}
              >
                {isKa ? 'შოუები' : 'Shows'}
              </button>
            </div>

            {statsSubTab === 'rotation' && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-surface border border-border-subtle flex flex-col items-center text-center gap-1">
                    <span className="text-[11px] font-medium text-text-secondary">{isKa ? 'სამართლიანობა' : 'Fairness'}</span>
                    <span className={`text-xl font-black ${fairnessScore >= 80 ? 'text-emerald-600' : fairnessScore >= 60 ? 'text-amber-600' : 'text-danger'}`}>
                      {fairnessScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-border-subtle flex flex-col items-center text-center gap-1">
                    <span className="text-[11px] font-medium text-text-secondary">{isKa ? 'სულ მორიგ.' : 'Total Shifts'}</span>
                    <span className="text-xl font-black text-text-primary">{totalDutiesServed}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-border-subtle flex flex-col items-center text-center gap-1">
                    <span className="text-[11px] font-medium text-text-secondary">{isKa ? 'წილი' : 'Duty Share'}</span>
                    <span className="text-xl font-black text-brand-primary">{talentDutySharePct}%</span>
                  </div>
                </div>

                {/* Groups */}
                {memberGroups.length === 0 ? (
                  <div className="text-center py-8 text-text-tertiary">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{isKa ? 'ჯგუფში არ არის' : 'Not in any group'}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {memberGroups.map((group) => (
                      <div key={group.id} className="p-3.5 rounded-xl border border-border-subtle bg-surface">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: group.colorAccent || '#6366f1' }}
                          />
                          <span className="text-sm font-bold text-text-primary">{group.name}</span>
                          <span className="ml-auto text-xs text-text-secondary">{group.memberTalentIds?.length || 0} {isKa ? 'წევრი' : 'members'}</span>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {(group.inventoryRequirements || []).length} {isKa ? 'მოთხოვნა' : 'requirements'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Shifts */}
                {servedShifts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                      {isKa ? 'ბოლო მორიგეობები' : 'Recent Shifts'}
                    </h4>
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                      {servedShifts.slice(0, 10).map((shift, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-surface-secondary/70 border border-border-subtle gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-text-primary truncate">{shift.eventTitle}</span>
                            <span className="text-text-secondary">•</span>
                            <span className="text-brand-primary font-medium truncate">{shift.itemName}</span>
                          </div>
                          <span className="text-[11px] text-text-secondary shrink-0 font-mono">
                            {new Date(shift.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {statsSubTab === 'shows' && (
              <div className="flex flex-col gap-2">
                {talentShows.length === 0 ? (
                  <div className="text-center py-8 text-text-tertiary">
                    <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{isKa ? 'შოუები არ არის' : 'No shows found'}</p>
                  </div>
                ) : (
                  talentShows.slice(0, 20).map((ev) => {
                    const isPast = new Date(ev.endDateTime).getTime() < Date.now();
                    return (
                      <div key={ev.id} className={`flex items-center justify-between p-3 rounded-lg border gap-3 ${isPast ? 'bg-canvas/40 border-border-subtle opacity-75' : 'bg-surface border-border-subtle'}`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isPast ? 'bg-text-tertiary' : 'bg-emerald-500'}`} />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-text-primary truncate">{ev.title}</div>
                            <div className="text-xs text-text-secondary">{formatTimeRange(ev.startDateTime, ev.endDateTime)}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isPast ? 'bg-surface-secondary text-text-tertiary' : 'bg-emerald-500/10 text-emerald-700'}`}>
                          {isPast ? (isKa ? 'დასრ.' : 'Past') : (isKa ? 'მოახლ.' : 'Upcoming')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[0.8rem] font-semibold text-text-secondary">
                {isKa ? 'შეფასებები' : 'Performance Reviews'} ({(talent.reviews || []).length})
              </span>
              <button
                type="button"
                onClick={() => handleOpenReview('End of Season')}
                className="bg-transparent border-none text-brand-primary text-[0.775rem] font-semibold cursor-pointer flex items-center gap-1 hover:text-brand-primary-hover"
              >
                <Plus size={14} /> {isKa ? 'შეფასების დამატება' : 'Add Review'}
              </button>
            </div>

            {(talent.reviews || []).length === 0 ? (
              <div className="text-center py-10 text-text-tertiary">
                <Star size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{isKa ? 'შეფასებები არ არის' : 'No reviews yet'}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(talent.reviews || []).map((review, idx) => {
                  const isTerminated = review.contractStatus === 'terminated' || review.completionStatus === 'Terminated Early';
                  return (
                    <div
                      key={review.id || idx}
                      className={`p-4 rounded-xl border ${isTerminated ? 'border-rose-300 dark:border-rose-900/50 bg-rose-500/5' : 'border-border-subtle bg-surface'}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isTerminated ? 'bg-danger-light text-danger border border-danger-border' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'}`}>
                              {review.reviewType || (isKa ? 'შეფასება' : 'Review')}
                            </span>
                            {review.rehireStatus && (
                              <RehireBadge status={review.rehireStatus} />
                            )}
                          </div>
                          <div className="text-[11px] text-text-tertiary mt-1">
                            {review.reviewDate} · {review.reviewedBy || review.reviewerName}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={13} className={s <= (review.rating || review.overallRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-text-tertiary'} />
                          ))}
                        </div>
                      </div>

                      {review.terminationReason && (
                        <div className="text-xs text-rose-700 dark:text-rose-300 font-medium mb-2">
                          {isKa ? 'შეწყვეტის მიზეზი:' : 'Termination reason:'} <strong>{review.terminationReason}</strong>
                        </div>
                      )}

                      {(review.internalNote || review.privateNote) && (
                        <p className="text-xs text-text-secondary leading-relaxed m-0 italic">
                          "{review.internalNote || review.privateNote}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <TalentReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          talent={talent}
          initialReviewType={selectedReviewType}
          onSubmit={(newReview) => {
            const isEarlyEnd =
              newReview.contractStatus === 'terminated' ||
              newReview.completionStatus === 'Terminated Early' ||
              newReview.reviewType === 'Early Termination';

            if (isEarlyEnd) {
              // ── Pre-flight Cascade Impact Check ──
              const report = analyzeContractTerminationImpact(
                talent,
                talents,
                groups,
                schedule
              );
              setPendingTerminationReview(newReview);
              setCascadeReport(report);
              setIsReviewModalOpen(false);
              setIsCascadeModalOpen(true);
              return;
            }

            // Non-termination end-of-season close
            const currentReviews = talent.reviews || [];
            updateTalent(talent.id, {
              reviews: [newReview, ...currentReviews],
              rehireStatus: newReview.rehireStatus,
              contractExpiryDate: undefined,
              status: 'Rest',
              isArchived: false,
              contractStatus: 'completed',
            });
            setIsReviewModalOpen(false);
            toast.success(isKa ? 'სეზონი წარმატებით დაიხურა და გადავიდა არქივში' : 'Season successfully closed and archived');
          }}
        />
      )}

      {/* Cascade Impact Modal */}
      {isCascadeModalOpen && cascadeReport && (
        <CascadeImpactModal
          isOpen={isCascadeModalOpen}
          onClose={() => {
            setIsCascadeModalOpen(false);
            setCascadeReport(null);
            setPendingTerminationReview(null);
          }}
          report={cascadeReport}
          onConfirm={(caseAResolutions, caseBResolutions) => {
            terminateTalentWithCascade(
              talent.id,
              { caseAResolutions, caseBResolutions },
              pendingTerminationReview ?? undefined
            );
            setIsCascadeModalOpen(false);
            setCascadeReport(null);
            setPendingTerminationReview(null);
            onClose();
            toast.success(
              isKa
                ? 'კონტრაქტი ვადაზე ადრე შეწყდა — ტალანტი გადავიდა არქივში'
                : 'Contract terminated early — performer archived'
            );
          }}
        />
      )}
      {isStatusImpactModalOpen && (
        <StatusChangeImpactModal
          isOpen={isStatusImpactModalOpen}
          onClose={() => setIsStatusImpactModalOpen(false)}
          talent={talent}
          targetStatus={pendingTargetStatus}
          affectedShifts={futureShifts}
          groups={groups}
          allTalents={talents}
          schedule={schedule}
          formatTimeRange={formatTimeRange}
          onConfirmAutoReassign={handleConfirmAutoReassign}
          onConfirmManualReplacements={handleConfirmManualReplacements}
        />
      )}
    </Drawer>
  );
};
