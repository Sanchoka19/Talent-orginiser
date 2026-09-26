'use client';

import React from 'react';
import { ContractRecord, ArchiveRecord, RehireStatus, TerminationReason } from '../../types/talent';
import { Drawer } from '../common/Drawer';
import { RehireBadge } from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileText,
  Lock,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ExternalLink,
  Flame,
  FileCheck
} from 'lucide-react';
import Link from 'next/link';

interface ArchiveDossierDrawerProps {
  record: ContractRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRehireStatus?: (talentId: string, reviewId: string, newStatus: 'eligible' | 'neutral' | 'do_not_rehire') => void;
  onRestoreTalent?: (talentId: string) => void;
}

export const ArchiveDossierDrawer: React.FC<ArchiveDossierDrawerProps> = ({
  record,
  isOpen,
  onClose,
  onRestoreTalent
}) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';

  if (!record) return null;

  const isCompleted = record.contractStatus === 'completed' || record.completionStatus === 'Completed Successfully';

  const getTerminationReasonText = (reason?: string) => {
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

  const getInitiatorLabel = (initiator?: 'mutual' | 'admin' | 'talent' | 'Management' | 'Artist' | 'Mutual') => {
    switch (initiator) {
      case 'admin':
      case 'Management':
        return isKa ? 'მენეჯმენტი (ადმინისტრაცია)' : 'Management';
      case 'talent':
      case 'Artist':
        return isKa ? 'არტისტი (პირადი განცხადება)' : 'Performer / Artist';
      case 'mutual':
      case 'Mutual':
      default:
        return isKa ? 'ორმხრივი შეთანხმება' : 'Mutual Agreement';
    }
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
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={12} />
                  <span>{isKa ? 'დასრულდა' : 'Completed'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                  <AlertTriangle size={12} />
                  <span>{isKa ? 'ვადაზე ადრე შეწყდა' : 'Terminated Early'}</span>
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
          <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle flex flex-col gap-3.5">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-text-primary truncate">
                    {record.talentName}
                  </h3>
                  {record.rehireStatus && (
                    <RehireBadge status={record.rehireStatus} />
                  )}
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold text-xs border border-amber-500/20">
                    <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                    <span>{(record.rating ?? record.overallRating ?? 5.0).toFixed(1)}</span>
                  </div>
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
          <div className="p-4.5 rounded-xl bg-surface border border-border-subtle shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-border-subtle/80 pb-2.5">
              <div className="flex items-center gap-2">
                <FileCheck size={16} className="text-brand-primary" />
                <h4 className="text-sm font-bold text-text-primary">
                  {isKa ? 'გაწყვეტის / დასრულების ოქმი' : 'Contract Resolution Protocol'}
                </h4>
              </div>
              <span className="text-xs text-text-tertiary">
                {record.reviewDate || record.terminationDate || (record.createdAt ? record.createdAt.split('T')[0] : '')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-secondary/40 border border-border-subtle">
                <span className="text-[11px] text-text-tertiary block mb-1">
                  {isKa ? 'ინიციატორი' : 'Initiator'}
                </span>
                <span className="font-semibold text-text-primary">
                  {getInitiatorLabel(record.initiator)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-secondary/40 border border-border-subtle">
                <span className="text-[11px] text-text-tertiary block mb-1">
                  {isKa ? 'კონტრაქტის ტიპი' : 'Review Type'}
                </span>
                <span className="font-semibold text-text-primary">
                  {record.contractStatus === 'terminated' || record.reviewType === 'Early Termination'
                    ? (isKa ? 'ვადაზე ადრე შეწყვეტა' : 'Early Termination')
                    : (isKa ? 'სეზონის დასასრული' : 'End of Season')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-secondary/40 border border-border-subtle">
                <span className="text-[11px] text-text-tertiary block mb-1">
                  {isKa ? 'საერთო შეფასება' : 'Overall Rating'}
                </span>
                <div className="flex items-center gap-1.5 font-bold text-text-primary">
                  <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                  <span>{(record.rating ?? record.overallRating ?? 5.0).toFixed(1)}</span>
                  <span className="text-text-tertiary font-normal text-[11px]">/ 5.0</span>
                </div>
              </div>
            </div>

            {/* If early terminated, show reason banner */}
            {!isCompleted && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs flex items-start gap-2.5">
                <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
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

          {/* Internal Private Note (Clean Enterprise Card) */}
          <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Lock size={13} className="text-text-tertiary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {isKa ? 'შიდა კომენტარი' : 'Internal Note'}
                </span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-secondary text-text-secondary border border-border-subtle">
                {isKa ? 'კონფიდენციალური' : 'Confidential'}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-text-primary italic m-0 pl-2.5 border-l-2 border-border-subtle">
              "{record.internalNote || record.privateNote || (isKa ? 'დამატებითი კომენტარი არ არის მითითებული.' : 'No private notes recorded.')}"
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-border-subtle/60 text-[11px] text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <User size={12} className="text-text-tertiary" />
                <span className="font-medium text-text-secondary">{record.reviewedBy || record.reviewerName}</span>
              </span>
              <span>
                {new Date(record.reviewDate || record.createdAt || '').toLocaleDateString(isKa ? 'ka-GE' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Read-only Future Rehire Status Info Card */}
          <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-text-tertiary" />
              <span className="text-xs font-semibold text-text-secondary">
                {isKa ? 'სამომავლო სტატუსი' : 'Future Rehire Status'}
              </span>
            </div>
            <RehireBadge status={record.rehireStatus} />
          </div>
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface flex items-center justify-between gap-3">
          {onRestoreTalent && (record.contractStatus === 'terminated' || record.completionStatus === 'Terminated Early') ? (
            <button
              type="button"
              onClick={() => onRestoreTalent(record.talentId)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-colors cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>{isKa ? 'კონტრაქტის აღდგენა (აქტიურ სიაში დაბრუნება)' : 'Restore to Active Roster'}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 px-5 rounded-md text-xs font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer border border-border-subtle"
          >
            {isKa ? 'დახურვა' : 'Close'}
          </button>
        </div>
      </div>
    </Drawer>
  );
};
