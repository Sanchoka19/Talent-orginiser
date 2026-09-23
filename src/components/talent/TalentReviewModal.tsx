'use client';

import React, { useState } from 'react';
import { Talent, TalentReview, ReviewType, TerminationReason, RehireStatus } from '../../types/talent';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import {
  Star,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  Lock,
  Plus
} from 'lucide-react';

interface TalentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  talent: Talent;
  onSubmit: (review: TalentReview) => void;
}

export const TalentReviewModal: React.FC<TalentReviewModalProps> = ({
  isOpen,
  onClose,
  talent,
  onSubmit
}) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';

  const [projectName, setProjectName] = useState('');
  const [period, setPeriod] = useState('');
  const [reviewType, setReviewType] = useState<ReviewType>('End of Season');
  const [terminationReason, setTerminationReason] = useState<TerminationReason>('Discipline');

  // Star ratings 1-5
  const [punctuality, setPunctuality] = useState<number>(5);
  const [performance, setPerformance] = useState<number>(5);
  const [teamwork, setTeamwork] = useState<number>(5);
  const [gearCare, setGearCare] = useState<number>(5);

  const [rehireStatus, setRehireStatus] = useState<RehireStatus>('Eligible for Rehire');
  const [privateNote, setPrivateNote] = useState('');
  const [reviewerName, setReviewerName] = useState('Sandro Chokoraia');

  const [hoverRating, setHoverRating] = useState<{ field: string; val: number } | null>(null);

  // Compute average score
  const computedRating = Number(
    ((punctuality + performance + teamwork + gearCare) / 4).toFixed(1)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const newReview: TalentReview = {
      id: `rev-${Date.now()}`,
      projectName: projectName.trim(),
      period: period.trim() || (isKa ? 'მიმდინარე სეზონი' : 'Current Season'),
      reviewType,
      terminationReason: reviewType === 'Early Termination' ? terminationReason : undefined,
      completionStatus:
        reviewType === 'Early Termination'
          ? 'Terminated Early'
          : 'Completed Successfully',
      scores: {
        punctuality,
        performance,
        teamwork,
        gearCare
      },
      overallRating: computedRating,
      rehireStatus,
      privateNote: privateNote.trim(),
      reviewerName: reviewerName.trim() || 'Administrator',
      createdAt: new Date().toISOString()
    };

    onSubmit(newReview);
    onClose();
  };

  const renderStarPicker = (
    field: string,
    currentVal: number,
    setter: (v: number) => void,
    label: string
  ) => {
    const activeHover = hoverRating?.field === field ? hoverRating.val : 0;
    const displayVal = activeHover || currentVal;

    return (
      <div className="flex items-center justify-between p-2.5 px-3 rounded-lg bg-surface-secondary/70 border border-border-subtle">
        <span className="text-xs font-semibold text-text-primary">{label}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setter(star)}
                onMouseEnter={() => setHoverRating({ field, val: star })}
                onMouseLeave={() => setHoverRating(null)}
                className="p-0.5 cursor-pointer transition-transform hover:scale-115 focus:outline-hidden"
              >
                <Star
                  size={17}
                  className={
                    star <= displayVal
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-border-medium hover:text-amber-300'
                  }
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-text-primary min-w-[24px] text-right">
            {displayVal}.0
          </span>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isKa ? 'შეფასების დამატება' : 'Add Evaluation Review'}
      subtitle={`${talent.firstName} ${talent.lastName} · ${talent.primarySkill}`}
      maxWidth="580px"
      zIndex={210}
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-pill text-xs font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary transition-all cursor-pointer"
          >
            {isKa ? 'გაუქმება' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!projectName.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-pill text-xs font-semibold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>{isKa ? 'შენახვა & არქივში დამატება' : 'Save & Archive'}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
        {/* Project & Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
              {isKa ? 'პროექტი / შოუს დასახელება *' : 'Project / Tour Name *'}
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={isKa ? 'მაგ. Summer Season 2026 – Rixos' : 'e.g. Summer Season 2026'}
              className="w-full px-3 py-2 text-xs rounded-lg bg-surface-secondary/70 border border-border-subtle text-text-primary placeholder:text-text-secondary/60 focus:outline-hidden focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
              {isKa ? 'პერიოდი (თარიღები)' : 'Contract Period'}
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder={isKa ? 'მაგ. მაისი 2026 – ოქტ 2026' : 'e.g. May 2026 – Oct 2026'}
              className="w-full px-3 py-2 text-xs rounded-lg bg-surface-secondary/70 border border-border-subtle text-text-primary placeholder:text-text-secondary/60 focus:outline-hidden focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Review Type Segmented Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {isKa ? 'შეფასების ტიპი' : 'Evaluation Type'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'End of Season' as ReviewType, label: isKa ? 'სეზონის ბოლოს' : 'End of Season' },
              { id: 'Mid-Season Review' as ReviewType, label: isKa ? 'შუალედური' : 'Mid-Season' },
              { id: 'Early Termination' as ReviewType, label: isKa ? 'ვადაზე ადრე გაწყვეტა' : 'Early Termination' }
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setReviewType(item.id)}
                className={`py-2 px-2 rounded-lg text-center font-semibold text-xs border transition-all cursor-pointer ${
                  reviewType === item.id
                    ? item.id === 'Early Termination'
                      ? 'bg-danger/10 border-danger text-danger'
                      : 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                    : 'bg-surface-secondary/50 border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Early Termination Reason */}
        {reviewType === 'Early Termination' && (
          <div className="p-3 rounded-lg bg-danger/5 border border-danger/25 flex flex-col gap-1.5 animate-in fade-in duration-150">
            <label className="block text-[11px] font-bold text-danger uppercase tracking-wider">
              {isKa ? 'ვადაზე ადრე გაწყვეტის მიზეზი *' : 'Early Termination Reason *'}
            </label>
            <select
              value={terminationReason}
              onChange={(e) => setTerminationReason(e.target.value as TerminationReason)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-danger/30 text-danger focus:outline-hidden focus:border-danger cursor-pointer"
            >
              <option value="Discipline">{isKa ? 'დისციპლინური გადაცდომა (Discipline)' : 'Discipline'}</option>
              <option value="Conflict">{isKa ? 'გუნდური კონფლიქტი (Conflict)' : 'Conflict'}</option>
              <option value="Injury">{isKa ? 'ტრავმა / სამედიცინო მიზეზი (Injury)' : 'Injury'}</option>
              <option value="Other">{isKa ? 'სხვა გარემოება (Other)' : 'Other'}</option>
            </select>
          </div>
        )}

        {/* 1-5 Star Ratings Grid */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              {isKa ? 'კრიტერიუმების შეფასება (1-5 ქულა)' : 'Performance Scores (1-5 Stars)'}
            </label>
            <span className="text-xs font-bold text-brand-primary flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>{isKa ? 'საშუალო:' : 'Average:'} {computedRating} / 5.0</span>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {renderStarPicker(
              'punctuality',
              punctuality,
              setPunctuality,
              isKa ? 'პუნქტუალურობა (Punctuality)' : 'Punctuality'
            )}
            {renderStarPicker(
              'performance',
              performance,
              setPerformance,
              isKa ? 'შესრულების ხარისხი (Performance)' : 'Performance'
            )}
            {renderStarPicker(
              'teamwork',
              teamwork,
              setTeamwork,
              isKa ? 'გუნდურობა & კომუნიკაცია (Teamwork)' : 'Teamwork'
            )}
            {renderStarPicker(
              'gearCare',
              gearCare,
              setGearCare,
              isKa ? 'ინვენტარის მოვლა & უსაფრთხოება (Gear Care)' : 'Gear & Prop Care'
            )}
          </div>
        </div>

        {/* Rehire Status Decision */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {isKa ? 'სამომავლო გადაწყვეტილება (Rehire Status)' : 'Rehire Eligibility Decision'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'Eligible for Rehire' as RehireStatus,
                label: isKa ? 'რეკომენდებული' : 'Eligible for Rehire',
                sub: isKa ? 'ხელახალი აყვანა დასაშვებია' : 'Recommended',
                color: 'text-emerald-600',
                border: 'border-emerald-500',
                bg: 'bg-emerald-500/10',
                icon: UserCheck
              },
              {
                id: 'Neutral' as RehireStatus,
                label: isKa ? 'ნეიტრალური' : 'Neutral / Review',
                sub: isKa ? 'საჭიროებს განხილვას' : 'Under Review',
                color: 'text-amber-600',
                border: 'border-amber-500',
                bg: 'bg-amber-500/10',
                icon: Clock
              },
              {
                id: 'Do Not Rehire' as RehireStatus,
                label: isKa ? 'შავ სიაში' : 'Do Not Rehire',
                sub: isKa ? 'Do Not Rehire' : 'Blacklist / Prohibited',
                color: 'text-danger',
                border: 'border-danger',
                bg: 'bg-danger/10',
                icon: UserX
              }
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = rehireStatus === option.id;

              return (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setRehireStatus(option.id)}
                  className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? `${option.bg} ${option.border} shadow-xs`
                      : 'bg-surface-secondary/50 border-border-subtle hover:bg-surface-secondary'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} className={isSelected ? option.color : 'text-text-secondary'} />
                    <span className={`font-bold text-xs ${isSelected ? option.color : 'text-text-primary'}`}>
                      {option.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-secondary truncate">
                    {option.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Private Confidential Note */}
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            <Lock size={12} className="text-amber-500" />
            <span>{isKa ? 'ადმინის შიდა, კონფიდენციალური კომენტარი' : 'Confidential Admin Note'}</span>
          </div>
          <textarea
            rows={3}
            value={privateNote}
            onChange={(e) => setPrivateNote(e.target.value)}
            placeholder={
              isKa
                ? 'ჩაწერეთ შიდა შენიშვნა არტისტის ქცევაზე, საიმედოობაზე, ინვენტარის მოპყრობასა და რეპეტიციების დისციპლინაზე...'
                : 'Enter private evaluation notes regarding conduct, reliability, and duty performance...'
            }
            className="w-full px-3 py-2 text-xs rounded-lg bg-surface-secondary/70 border border-border-subtle text-text-primary placeholder:text-text-secondary/60 focus:outline-hidden focus:border-brand-primary resize-none"
          />
        </div>

        {/* Reviewer Name */}
        <div className="flex items-center justify-between p-2 px-3 rounded-lg bg-surface-secondary/40 border border-border-subtle">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <ShieldCheck size={14} className="text-brand-primary" />
            <span className="text-[11px] font-semibold">{isKa ? 'შემფასებელი ადმინისტრატორი:' : 'Evaluating Admin:'}</span>
          </div>
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="text-xs font-bold text-text-primary bg-transparent text-right border-b border-border-subtle focus:outline-hidden focus:border-brand-primary py-0.5"
          />
        </div>
      </form>
    </Modal>
  );
};
