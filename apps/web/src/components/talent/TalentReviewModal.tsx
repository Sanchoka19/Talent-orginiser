'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Talent, ContractRecord, ReviewType, TerminationReason } from '../../types/talent';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import {
  Star,
  Plus,
  ThumbsUp,
  Minus,
  Ban
} from 'lucide-react';

// Seasons with date ranges — used to auto-detect which season the termination date falls in
const SEASONS = [
  { id: 'winter_2025', start: '2025-11-01', end: '2026-02-28', ka: 'ზამთრის სეზონი 2025–2026', en: 'Winter Season 2025–2026' },
  { id: 'spring_2026', start: '2026-03-01', end: '2026-05-31', ka: 'გაზაფხულის სეზონი 2026',  en: 'Spring Season 2026' },
  { id: 'summer_2026', start: '2026-06-01', end: '2026-08-31', ka: 'ზაფხულის სეზონი 2026',    en: 'Summer Season 2026' },
  { id: 'autumn_2026', start: '2026-09-01', end: '2026-11-30', ka: 'შემოდგომის სეზონი 2026',  en: 'Autumn Season 2026' },
  { id: 'winter_2026', start: '2026-12-01', end: '2027-02-28', ka: 'ზამთრის სეზონი 2026–2027', en: 'Winter Season 2026–2027' },
];

function detectSeason(dateStr: string): typeof SEASONS[number] | null {
  const d = new Date(dateStr);
  return SEASONS.find(s => d >= new Date(s.start) && d <= new Date(s.end)) ?? null;
}

interface TalentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  talent: Talent;
  onSubmit: (record: ContractRecord) => void;
  initialReviewType?: ReviewType;
}

export const TalentReviewModal: React.FC<TalentReviewModalProps> = ({
  isOpen,
  onClose,
  talent,
  onSubmit,
  initialReviewType = 'End of Season'
}) => {
  const { currentUser, groups, schedule } = useApp();
  const { language } = useLanguage();
  const isKa = language === 'ka';

  const [projectName, setProjectName] = useState('');
  const [period, setPeriod] = useState('');
  const [reviewType, setReviewType] = useState<ReviewType>(
    initialReviewType === 'Early Termination' ? 'Early Termination' : 'End of Season'
  );
  const [terminationReason, setTerminationReason] = useState<TerminationReason>('Discipline');

  // Single overall 1-5 star rating
  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Rehire decision status conforming to 'eligible' | 'neutral' | 'do_not_rehire'
  const [rehireStatus, setRehireStatus] = useState<'eligible' | 'neutral' | 'do_not_rehire'>('eligible');
  const [privateNote, setPrivateNote] = useState('');

  // Find which group this talent belongs to
  const activeGroup = useMemo(() =>
    groups.find(g => g.memberTalentIds.includes(talent.id)) ?? null
  , [groups, talent.id]);

  // Collect project options: upcoming/active shows for this group + group name fallback
  const projectOptions = useMemo(() => {
    const now = new Date();
    const opts: string[] = [];
    if (activeGroup) {
      const groupShows = schedule
        .filter(e => e.groupId === activeGroup.id && e.status !== 'Cancelled')
        .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
      // Upcoming first, then past — deduplicate by title
      const seen = new Set<string>();
      // Upcoming shows
      groupShows.filter(e => new Date(e.startDateTime) >= now).forEach(e => {
        if (!seen.has(e.title)) { seen.add(e.title); opts.push(e.title); }
      });
      // Past shows (in case no upcoming)
      groupShows.filter(e => new Date(e.startDateTime) < now).reverse().forEach(e => {
        if (!seen.has(e.title)) { seen.add(e.title); opts.push(e.title); }
      });
      // Group name as last-resort option
      if (!seen.has(activeGroup.name)) opts.push(activeGroup.name);
    }
    return opts;
  }, [activeGroup, schedule]);

  // Auto-detect season from termination date — use contractExpiryDate if set,
  // otherwise fall back to today (computed client-side in useEffect to avoid SSR mismatch)
  const autoSeason = useMemo(() => {
    if (talent.contractExpiryDate) {
      return detectSeason(talent.contractExpiryDate);
    }
    return null; // today fallback handled inside useEffect
  }, [talent.contractExpiryDate]);

  // Sync initial type and sensible defaults when opening
  useEffect(() => {
    if (isOpen) {
      const type = initialReviewType === 'Early Termination' ? 'Early Termination' : 'End of Season';
      setReviewType(type);
      if (type === 'Early Termination') {
        setRehireStatus('do_not_rehire');
      } else {
        setRehireStatus('eligible');
      }
      // Pre-fill project: first upcoming show of active group, else group name
      if (projectOptions.length > 0) {
        setProjectName(projectOptions[0]);
      }
      // Pre-fill period: use autoSeason (from contractExpiryDate) or detect from today (client-side only)
      const season = autoSeason ?? detectSeason(new Date().toISOString().split('T')[0]);
      if (season) {
        setPeriod(isKa ? season.ka : season.en);
      }
    }
  }, [isOpen, initialReviewType, autoSeason, isKa, projectOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const contractStatus: 'completed' | 'terminated' =
      reviewType === 'Early Termination' ? 'terminated' : 'completed';

    const todayStr = new Date().toISOString().split('T')[0];

    const newRecord: ContractRecord = {
      id: `ctr-${Date.now()}`,
      talentId: talent.id,
      talentName: `${talent.firstName} ${talent.lastName}`,
      talentRole: talent.primarySkill,
      avatarUrl: talent.avatarUrl,
      projectName: projectName.trim(),
      location: (talent as any).location || (isKa ? 'თბილისი' : 'Tbilisi'),
      period: period.trim() || (isKa ? 'მიმდინარე სეზონი 2026' : 'Current Season 2026'),
      startDate: (talent as any).contractStart || '2026-05-01',
      endDate: talent.contractExpiryDate || todayStr,
      contractStatus,
      rating: overallRating,
      rehireStatus,
      terminationReason: reviewType === 'Early Termination' ? terminationReason : undefined,
      initiator: reviewType === 'Early Termination' ? 'admin' : 'mutual',
      internalNote: privateNote.trim(),
      reviewedBy: currentUser?.fullName || (isKa ? 'ადმინისტრატორი' : 'Administrator'),
      reviewDate: todayStr,

      // Compatibility fields
      overallRating,
      privateNote: privateNote.trim(),
      reviewerName: currentUser?.fullName || (isKa ? 'ადმინისტრატორი' : 'Administrator'),
      createdAt: new Date().toISOString(),
      completionStatus: reviewType === 'Early Termination' ? 'Terminated Early' : 'Completed Successfully',
      reviewType
    };

    onSubmit(newRecord);
    onClose();
  };

  const modalTitle =
    reviewType === 'Early Termination'
      ? (isKa ? 'კონტრაქტის ვადაზე ადრე შეწყვეტა' : 'Early Contract Termination')
      : (isKa ? 'კონტრაქტის დასრულება & შეფასება' : 'Complete Contract & Review');

  const modalSubtitle = `${talent.firstName} ${talent.lastName} · ${talent.primarySkill}`;

  const currentActiveRating = hoverRating || overallRating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      maxWidth="480px"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-md text-xs font-medium border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary transition-all cursor-pointer"
          >
            {isKa ? 'გაუქმება' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!projectName.trim()}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer ${
              reviewType === 'Early Termination'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-brand-primary hover:bg-brand-primary-hover'
            }`}
          >
            <Plus size={14} />
            <span>
              {reviewType === 'Early Termination'
                ? isKa
                  ? 'შეწყვეტა & არქივი'
                  : 'Terminate & Archive'
                : isKa
                ? 'შენახვა & არქივში დამატება'
                : 'Save & Archive'}
            </span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
        {/* 1. Project & Period (grid-cols-2 compact) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
              {isKa ? 'პროექტი / შოუ *' : 'Project / Show *'}
            </label>
            {projectOptions.length > 0 ? (
              <select
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md bg-surface border border-border-subtle text-text-primary focus:outline-hidden focus:border-brand-primary cursor-pointer"
              >
                {projectOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={isKa ? 'მაგ. Summer Season 2026' : 'e.g. Summer Season 2026'}
                className="w-full px-3 py-2 text-xs rounded-md bg-surface border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-hidden focus:border-brand-primary"
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
              {isKa ? 'პერიოდი' : 'Period'}
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md bg-surface border border-border-subtle text-text-primary focus:outline-hidden focus:border-brand-primary cursor-pointer"
            >
              {SEASONS.map((s) => (
                <option key={s.id} value={isKa ? s.ka : s.en}>
                  {isKa ? s.ka : s.en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional Early Termination Reason (Neutral border with minimalist dot indicator) */}
        {reviewType === 'Early Termination' && (
          <div className="p-3 rounded-lg bg-surface-secondary/70 border border-border-subtle flex flex-col gap-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <label className="block text-[11px] font-semibold text-text-primary uppercase tracking-wider">
                  {isKa ? 'გაწყვეტის მიზეზი' : 'Termination Reason'}
                </label>
              </div>
              <span className="text-[10px] text-text-tertiary">
                {isKa ? 'სინქრონიზდება სტატუსთან' : 'Syncs with status'}
              </span>
            </div>
            <select
              value={terminationReason}
              onChange={(e) => {
                const reason = e.target.value as TerminationReason;
                setTerminationReason(reason);
                if (reason === 'Discipline' || reason === 'Conflict') {
                  setRehireStatus('do_not_rehire');
                } else if (reason === 'Injury' || reason === 'Other') {
                  setRehireStatus('eligible');
                }
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-md bg-surface border border-border-subtle text-text-primary focus:outline-hidden focus:border-brand-primary cursor-pointer"
            >
              <option value="Discipline">
                {isKa ? 'დისციპლინური გადაცდომა (Discipline)' : 'Disciplinary Violation (Discipline)'}
              </option>
              <option value="Conflict">
                {isKa ? 'გუნდური კონფლიქტი (Conflict)' : 'Team Conflict (Conflict)'}
              </option>
              <option value="Injury">
                {isKa ? 'ტრავმა / სამედიცინო მიზეზი (Injury)' : 'Injury / Medical (Injury)'}
              </option>
              <option value="Other">
                {isKa ? 'სხვა გარემოება / ფორსმაჟორი (Other)' : 'Other Circumstances (Other)'}
              </option>
            </select>
          </div>
        )}

        {/* 3. Overall Star Rating (Clean, compact 17px stars without loud drop shadows) */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary/50 border border-border-subtle">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-primary">
              {isKa ? 'საერთო შეფასება' : 'Overall Rating'}
            </span>
            <span className="text-[10px] text-text-tertiary">
              {isKa ? '1-დან 5 ვარსკვლავამდე' : 'Rate 1 to 5 stars'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= currentActiveRating;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setOverallRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-hidden"
                  >
                    <Star
                      size={17}
                      className={
                        isFilled
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-border-medium hover:text-amber-400'
                      }
                    />
                  </button>
                );
              })}
            </div>

            <div className="min-w-[46px] text-right font-semibold text-xs text-text-primary">
              {currentActiveRating}.0 <span className="text-text-tertiary font-normal text-[11px]">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* 4. Rehire Status Decision */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
            {isKa ? 'სამომავლო სტატუსი' : 'Rehire Status'}
          </label>
          <div className="grid grid-cols-3 gap-2 w-full mt-1.5">
            {[
              {
                id: 'eligible' as const,
                label: isKa ? 'რეკომენდებული' : 'Recommended',
                icon: ThumbsUp,
                activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              },
              {
                id: 'neutral' as const,
                label: isKa ? 'ნეიტრალური' : 'Neutral',
                icon: Minus,
                activeClass: 'bg-slate-800 text-white border-slate-800 shadow-sm'
              },
              {
                id: 'do_not_rehire' as const,
                label: isKa ? 'შავი სია' : 'Blacklist',
                icon: Ban,
                activeClass: 'bg-rose-600 text-white border-rose-600 shadow-sm'
              }
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = rehireStatus === option.id;

              return (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setRehireStatus(option.id)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1 text-center whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? option.activeClass
                      : 'bg-surface text-text-primary border-border-subtle hover:bg-surface-secondary'
                  }`}
                >
                  <Icon size={13} strokeWidth={2.5} className="shrink-0" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Internal Private Note (Clean Textarea) */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
            {isKa ? 'შიდა კომენტარი' : 'Internal Note'}
          </label>
          <textarea
            rows={2}
            value={privateNote}
            onChange={(e) => setPrivateNote(e.target.value)}
            placeholder={
              isKa
                ? 'დამატებითი შენიშვნა არტისტის შესახებ...'
                : 'Additional notes regarding the talent...'
            }
            className="w-full px-3 py-2 text-xs rounded-md bg-surface border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-hidden focus:border-brand-primary resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
