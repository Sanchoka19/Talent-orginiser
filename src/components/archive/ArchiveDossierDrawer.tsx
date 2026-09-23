'use client';

import React, { useState } from 'react';
import { ArchiveRecord, RehireStatus, TerminationReason } from '../../types/talent';
import { Drawer } from '../common/Drawer';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Lock,
  Star,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Clock,
  Building,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Flame,
  FileCheck
} from 'lucide-react';
import Link from 'next/link';

interface ArchiveDossierDrawerProps {
  record: ArchiveRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRehireStatus: (talentId: string, reviewId: string, newStatus: RehireStatus) => void;
}

export const ArchiveDossierDrawer: React.FC<ArchiveDossierDrawerProps> = ({
  record,
  isOpen,
  onClose,
  onUpdateRehireStatus
}) => {
  const { language } = useLanguage();
  const toast = useToast();
  const isKa = language === 'ka';

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!record) return null;

  const isCompleted = record.completionStatus === 'Completed Successfully';
  const isBlacklist = record.rehireStatus === 'Do Not Rehire';
  const isEligible = record.rehireStatus === 'Eligible for Rehire';

  const handleStatusChange = (newStatus: RehireStatus) => {
    setIsUpdatingStatus(true);
    onUpdateRehireStatus(record.talentId, record.id, newStatus);
    toast.success(
      isKa
        ? `სტატუსი განახლდა: ${newStatus === 'Eligible for Rehire' ? 'Rehire OK' : newStatus === 'Do Not Rehire' ? 'შავ სიაში (Do Not Rehire)' : newStatus}`
        : `Rehire status updated to: ${newStatus}`
    );
    setTimeout(() => setIsUpdatingStatus(false), 200);
  };

  const getTerminationReasonText = (reason?: TerminationReason) => {
    if (!reason) return isKa ? 'სხვა მიზეზი' : 'Other';
    switch (reason) {
      case 'Discipline':
        return isKa ? 'დისციპლინური გადაცდომა' : 'Disciplinary Violation';
      case 'Conflict':
        return isKa ? 'კონფლიქტი კოლეგებთან / მენეჯმენტთან' : 'Interpersonal Conflict';
      case 'Injury':
        return isKa ? 'ტრავმა / სამედიცინო ჩვენება' : 'Physical Injury / Medical';
      default:
        return isKa ? 'სხვა მიზეზი' : 'Other Reason';
    }
  };

  const getInitiatorLabel = (initiator?: 'Management' | 'Artist' | 'Mutual') => {
    switch (initiator) {
      case 'Management':
        return isKa ? 'მენეჯმენტი (ადმინისტრაცია)' : 'Management';
      case 'Artist':
        return isKa ? 'არტისტი (პირადი განცხადება)' : 'Performer / Artist';
      case 'Mutual':
      default:
        return isKa ? 'ორმხრივი შეთანხმება' : 'Mutual Agreement';
    }
  };

  const renderScoreItem = (label: string, score: number = 5) => {
    const percentage = Math.min(100, Math.max(0, (score / 5) * 100));
    const isHigh = score >= 4.5;
    const isMedium = score >= 3.5 && score < 4.5;

    return (
      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-secondary/50 border border-border-subtle">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-primary">{label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-text-primary">{score.toFixed(1)}</span>
            <div className="flex items-center text-amber-500">
              <Star size={13} fill="currentColor" />
            </div>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-border-subtle overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="560px">
      <div className="flex flex-col h-full overflow-hidden bg-surface text-text-primary">
        {/* Top Sticky Header */}
        <div className="p-6 pb-4 border-b border-border-subtle bg-surface sticky top-0 z-10 flex flex-col gap-3 pr-14">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {isKa ? 'საარქივო დოსიე' : 'Archive Dossier'}
              </span>
              <span className="text-xs text-text-tertiary">•</span>
              <span className="text-xs font-medium text-text-tertiary">
                ID: {record.id.slice(0, 10)}
              </span>
            </div>

            {/* Completion Status Badge */}
            <div>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={13} />
                  <span>{isKa ? '✓ დასრულდა' : 'Completed'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <AlertTriangle size={13} />
                  <span>{isKa ? '⚠ ვადაზე ადრე შეწყდა' : 'Terminated Early'}</span>
                </span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight leading-snug">
              {record.projectName}
            </h2>
            <p className="text-xs text-text-secondary mt-1 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <Building size={13} className="text-text-tertiary shrink-0" />
                <span>{record.location}</span>
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-text-tertiary shrink-0" />
                <span>{record.period}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Performer Summary Card */}
          <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border-subtle flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                {isKa ? 'ტალანტის პროფილი' : 'Performer Profile'}
              </span>
              <Link
                href="/talents"
                onClick={onClose}
                className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1 group"
              >
                <span>{isKa ? 'სრული პროფილი' : 'View Profile'}</span>
                <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {record.talentAvatar ? (
                <img
                  src={record.talentAvatar}
                  alt={record.talentName}
                  className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-full object-cover border-2 border-border-subtle shadow-xs shrink-0"
                />
              ) : (
                <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-lg border border-brand-primary/20 shrink-0">
                  {record.talentName.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-primary truncate">
                    {record.talentName}
                  </h3>
                  {isBlacklist && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 shrink-0">
                      Blacklist
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-text-secondary truncate mt-0.5">
                  {record.talentRole}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1 truncate">
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate">{record.talentEmail}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Phone size={12} className="shrink-0" />
                    <span>{record.talentPhone}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Protocol Details (გაწყვეტის / დასრულების ოქმი) */}
          <div className="p-4.5 rounded-2xl bg-surface border border-border-subtle shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-border-subtle/80 pb-2.5">
              <div className="flex items-center gap-2">
                <FileCheck size={16} className="text-brand-primary" />
                <h4 className="text-sm font-bold text-text-primary">
                  {isKa ? 'გაწყვეტის / დასრულების ოქმი' : 'Contract Resolution Protocol'}
                </h4>
              </div>
              <span className="text-xs text-text-tertiary">
                {record.terminationDate || record.createdAt.split('T')[0]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-secondary/40 border border-border-subtle">
                <span className="text-[11px] text-text-tertiary block mb-1">
                  {isKa ? 'ინიციატორი' : 'Initiator'}
                </span>
                <span className="font-semibold text-text-primary">
                  {getInitiatorLabel(record.initiator)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-secondary/40 border border-border-subtle">
                <span className="text-[11px] text-text-tertiary block mb-1">
                  {isKa ? 'კონტრაქტის ტიპი' : 'Review Type'}
                </span>
                <span className="font-semibold text-text-primary">
                  {record.reviewType === 'End of Season'
                    ? (isKa ? 'სეზონის დასასრული' : 'End of Season')
                    : record.reviewType === 'Early Termination'
                    ? (isKa ? 'ვადაზე ადრე შეწყვეტა' : 'Early Termination')
                    : (isKa ? 'შუალედური შეფასება' : 'Mid-Season Review')}
                </span>
              </div>
            </div>

            {/* If early terminated, show reason banner */}
            {!isCompleted && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-700 dark:text-rose-300 block">
                    {isKa ? 'შეწყვეტის მიზეზი:' : 'Reason for Termination:'}
                  </span>
                  <p className="text-rose-600 dark:text-rose-400 mt-0.5">
                    {getTerminationReasonText(record.terminationReason)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4-Criterion Score Breakdown */}
          <div className="p-4.5 rounded-2xl bg-surface border border-border-subtle shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-border-subtle/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-500" fill="currentColor" />
                <h4 className="text-sm font-bold text-text-primary">
                  {isKa ? 'დეტალური ქულების დაშლა' : 'Performance Score Breakdown'}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/20">
                <span>★ {record.overallRating.toFixed(1)}</span>
                <span className="text-[10px] text-text-tertiary">/ 5.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {renderScoreItem(isKa ? 'პუნქტუალურობა' : 'Punctuality', record.scores.punctuality)}
              {renderScoreItem(isKa ? 'შესრულება & ოსტატობა' : 'Performance', record.scores.performance)}
              {renderScoreItem(isKa ? 'გუნდურობა & ეთიკა' : 'Teamwork', record.scores.teamwork)}
              {renderScoreItem(isKa ? 'ინვენტარის მოვლა' : 'Gear & Safety Care', record.scores.gearCare || 5)}
            </div>
          </div>

          {/* Confidential Internal Admin Comment */}
          <div className="p-4.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/15 border border-amber-500/25 space-y-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Lock size={15} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isKa ? 'ადმინისტრაციის კონფიდენციალური კომენტარი' : 'Confidential Admin Dossier Note'}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                {isKa ? 'შიდა დოკუმენტი' : 'Internal Only'}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-text-primary font-medium italic pl-1 border-l-2 border-amber-500/40">
              "{record.privateNote || (isKa ? 'დამატებითი კომენტარი არ არის მითითებული.' : 'No private notes recorded.')}"
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 text-[11px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <User size={12} className="text-text-tertiary" />
                <span className="font-medium text-text-secondary">{record.reviewerName}</span>
              </span>
              <span>
                {new Date(record.createdAt).toLocaleDateString(isKa ? 'ka-GE' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Rehire / Blacklist Decision Action */}
          <div className="p-4.5 rounded-2xl bg-surface-secondary/60 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  {isKa ? 'სამომავლო თანამშრომლობა (Rehire Decision)' : 'Future Rehire Decision'}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isBlacklist
                    ? 'bg-rose-500 text-white shadow-xs'
                    : isEligible
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-zinc-500 text-white'
                }`}
              >
                {isBlacklist
                  ? (isKa ? 'Do Not Rehire (Blacklist)' : 'Do Not Rehire')
                  : isEligible
                  ? (isKa ? 'Rehire OK (Recommended)' : 'Rehire OK')
                  : record.rehireStatus}
              </span>
            </div>

            <p className="text-xs text-text-secondary">
              {isKa
                ? 'შეცვალეთ არტისტის სამომავლო სტატუსი. ცვლილება ავტომატურად აისახება ტალანტების მთავარ ბაზაშიც.'
                : 'Update the performer rehire decision. This status automatically syncs across the platform.'}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleStatusChange('Eligible for Rehire')}
                disabled={isUpdatingStatus}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isEligible
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-xs'
                    : 'bg-surface hover:bg-emerald-500/10 text-text-secondary hover:text-emerald-600 border border-border-subtle'
                }`}
              >
                <UserCheck size={14} />
                <span>{isKa ? 'Rehire OK' : 'Eligible for Rehire'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('Do Not Rehire')}
                disabled={isUpdatingStatus}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isBlacklist
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 shadow-xs'
                    : 'bg-surface hover:bg-rose-500/10 text-text-secondary hover:text-rose-600 border border-border-subtle'
                }`}
              >
                <UserX size={14} />
                <span>{isKa ? 'Do Not Rehire' : 'Do Not Rehire'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="p-2 px-4 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer border border-border-subtle"
          >
            {isKa ? 'დახურვა' : 'Close'}
          </button>

          <Link
            href="/talents"
            onClick={onClose}
            className="flex items-center gap-1.5 p-2 px-4 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary/90 transition-all shadow-sm cursor-pointer"
          >
            <span>{isKa ? 'ტალანტის სრული ბაზა' : 'Open Talent Roster'}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </Drawer>
  );
};
