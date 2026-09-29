'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CascadeImpactReport } from '../../services/cascadeImpactEngine';
import { useLanguage } from '../../context/LanguageContext';
import { getTalentAvatar } from '../../utils/avatarUtils';
import {
    AlertTriangle,
    Users,
    Calendar,
    ClipboardList,
    CheckCircle2,
    Sliders,
    PauseCircle,
    HelpCircle,
    Clock,
    ArrowRight,
    ShieldAlert
} from 'lucide-react';

interface CascadeImpactModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: CascadeImpactReport;
    onConfirm: (
        caseAResolutions: Record<string, 'relax_rule' | 'pause_task'>,
        caseBResolutions: Record<string, 'reduce_headcount' | 'keep_vacant'>
    ) => void;
    isGroupRemovalOnly?: boolean;
}

export const CascadeImpactModal: React.FC<CascadeImpactModalProps> = ({
    isOpen,
    onClose,
    report,
    onConfirm,
    isGroupRemovalOnly = false
}) => {
    const { language } = useLanguage();
    const isKa = language === 'ka';

    const {
        talent,
        caseAConflicts,
        caseBConflicts,
        futureShowsCount,
        futureDutyAssignments,
        pinnedRequirements,
        hasNormalRotationMembers
    } = report;

    // Track resolution choices
    const [caseAChoices, setCaseAChoices] = useState<Record<string, 'relax_rule' | 'pause_task'>>(() => {
        const initial: Record<string, 'relax_rule' | 'pause_task'> = {};
        caseAConflicts.forEach((c) => {
            initial[c.requirementId] = 'relax_rule';
        });
        return initial;
    });

    const [caseBChoices, setCaseBChoices] = useState<Record<string, 'reduce_headcount' | 'keep_vacant'>>(() => {
        const initial: Record<string, 'reduce_headcount' | 'keep_vacant'> = {};
        caseBConflicts.forEach((c) => {
            initial[c.requirementId] = 'reduce_headcount';
        });
        return initial;
    });

    const [showFutureAssignments, setShowFutureAssignments] = useState(false);

    const handleConfirm = () => {
        onConfirm(caseAChoices, caseBChoices);
    };

    const talentFullName = `${talent.firstName} ${talent.lastName}`;
    const totalIssuesCount = caseAConflicts.length + caseBConflicts.length;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                isKa
                    ? isGroupRemovalOnly
                        ? 'კასკადური ზემოქმედების ანალიზი'
                        : 'კონტრაქტის შეწყვეტა: კასკადური ანალიზი'
                    : isGroupRemovalOnly
                        ? 'Cascade Impact Analysis'
                        : 'Early Termination: Cascade Impact Analysis'
            }
            subtitle={
                isKa
                    ? 'წინასწარი შემოწმება (Pre-flight Check) და დავალებების წესების მართვა'
                    : 'Pre-flight check & duty rotation impact resolution'
            }
            maxWidth="720px"
            zIndex={1400}
            footer={
                <div className="flex items-center justify-between w-full flex-wrap gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary transition-all cursor-pointer outline-none"
                    >
                        {isKa ? 'გაუქმება' : 'Cancel'}
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill text-sm font-bold bg-danger text-white shadow-md hover:bg-danger-hover hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer outline-none"
                    >
                        <ShieldAlert size={16} />
                        <span>
                            {isKa
                                ? isGroupRemovalOnly
                                    ? 'ამოშლის დადასტურება და წესების განახლება'
                                    : 'შეწყვეტის დადასტურება და წესების განახლება'
                                : isGroupRemovalOnly
                                    ? 'Confirm Removal & Apply Rules'
                                    : 'Confirm Termination & Apply Rules'}
                        </span>
                    </button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                {/* Talent Header Card */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-3 min-w-0">
                        <img
                            src={getTalentAvatar(talent)}
                            alt={talentFullName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-border-subtle shrink-0 shadow-xs"
                        />
                        <div className="min-w-0">
                            <h4 className="text-base font-bold text-text-primary truncate m-0">
                                {talentFullName}
                            </h4>
                            <p className="text-xs text-brand-primary font-medium m-0 truncate">
                                {talent.primarySkill} • {talent.gender === 'Female' ? (isKa ? 'ქალი' : 'Female') : (isKa ? 'კაცი' : 'Male')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-pill bg-danger-light text-danger border border-danger-border">
                            {isKa ? 'კონტრაქტის შეწყვეტა' : 'Early Termination'}
                        </span>
                    </div>
                </div>

                {/* Impact KPI Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div
                        className="p-3 rounded-xl bg-surface border border-border-subtle flex flex-col items-center justify-between text-center transition-all hover:border-border-hover shadow-2xs min-h-[92px]"
                        title={isKa ? 'იქმნება თუ არა კრიტიკული ვაკანსია/შეზღუდვა' : 'Checks if critical vacancy or constraint is created'}
                    >
                        <span className="text-xs font-semibold text-text-secondary leading-snug">
                            {isKa ? 'კონფლიქტები' : 'Conflicts'}
                        </span>
                        <span className={`text-xl font-black my-0.5 ${totalIssuesCount > 0 ? 'text-danger' : 'text-emerald-600'}`}>
                            {totalIssuesCount}
                        </span>
                        <span className="text-[10px] text-text-tertiary leading-tight">
                            {isKa ? 'იქმნება თუ არა კრიტიკული ვაკანსია/შეზღუდვა' : 'Critical vacancy/constraint check'}
                        </span>
                    </div>

                    <div
                        className="p-3 rounded-xl bg-surface border border-border-subtle flex flex-col items-center justify-between text-center transition-all hover:border-border-hover shadow-2xs min-h-[92px]"
                        title={isKa ? 'რამდენ დაგეგმილ შოუში იღებს მონაწილეობას' : 'How many scheduled shows the talent participates in'}
                    >
                        <span className="text-xs font-semibold text-text-secondary leading-snug">
                            {isKa ? 'მომავალი შოუები' : 'Upcoming Shows'}
                        </span>
                        <span className="text-xl font-black my-0.5 text-text-primary">
                            {futureShowsCount}
                        </span>
                        <span className="text-[10px] text-text-tertiary leading-tight">
                            {isKa ? 'რამდენ დაგეგმილ შოუში იღებს მონაწილეობას' : 'Participation in scheduled shows'}
                        </span>
                    </div>

                    <div
                        className="p-3 rounded-xl bg-surface border border-border-subtle flex flex-col items-center justify-between text-center transition-all hover:border-border-hover shadow-2xs min-h-[92px]"
                        title={isKa ? 'რამდენ დავალებაზეა განაწილებული როტაციით' : 'How many tasks assigned via rotation'}
                    >
                        <span className="text-xs font-semibold text-text-secondary leading-snug">
                            {isKa ? 'აქტიური მორიგეობები' : 'Active Duties'}
                        </span>
                        <span className="text-xl font-black my-0.5 text-amber-600 dark:text-amber-400">
                            {futureDutyAssignments.length}
                        </span>
                        <span className="text-[10px] text-text-tertiary leading-tight">
                            {isKa ? 'რამდენ დავალებაზეა განაწილებული როტაციით' : 'Tasks assigned through rotation'}
                        </span>
                    </div>

                    <div
                        className="p-3 rounded-xl bg-surface border border-border-subtle flex flex-col items-center justify-between text-center transition-all hover:border-border-hover shadow-2xs min-h-[92px]"
                        title={isKa ? 'რამდენ საქმეზეა მიბმული უცვლელად (როტაციის გარეშე)' : 'Tasks assigned permanently without rotation'}
                    >
                        <span className="text-xs font-semibold text-text-secondary leading-snug">
                            {isKa ? 'მუდმივი როლები' : 'Permanent Roles'}
                        </span>
                        <span className="text-xl font-black my-0.5 text-purple-600 dark:text-purple-400">
                            {pinnedRequirements.length}
                        </span>
                        <span className="text-[10px] text-text-tertiary leading-tight">
                            {isKa ? 'რამდენ საქმეზეა მიბმული უცვლელად (როტაციის გარეშე)' : 'Bound permanently (no rotation)'}
                        </span>
                    </div>
                </div>

                {/* ── CASE A: Gender Rule Violation ── */}
                {caseAConflicts.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                            <AlertTriangle size={14} className="shrink-0" />
                            <span>{isKa ? 'სქესის წესის კრიტიკული დარღვევა' : 'Case A: Gender Constraint Violation'}</span>
                        </div>

                        {caseAConflicts.map((conflict) => {
                            const currentChoice = caseAChoices[conflict.requirementId] || 'relax_rule';
                            return (
                                <div
                                    key={conflict.requirementId}
                                    className="p-4 rounded-xl border border-rose-300 dark:border-rose-900/50 bg-rose-500/5 flex flex-col gap-3 shadow-2xs"
                                >
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200 leading-snug m-0">
                                                ⚠️ {conflict.message}
                                            </p>
                                            <span className="inline-block mt-1 text-[11px] font-medium text-rose-700/80 dark:text-rose-400/80">
                                                {isKa ? 'ჯგუფი' : 'Group'}: <strong>{conflict.groupName}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-xs font-bold text-text-secondary mt-1">
                                        {isKa ? 'აირჩიეთ სისტემის მოქმედება:' : 'Choose Resolution Action:'}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {/* Option 1: Relax Rule */}
                                        <div
                                            onClick={() =>
                                                setCaseAChoices((prev) => ({
                                                    ...prev,
                                                    [conflict.requirementId]: 'relax_rule'
                                                }))
                                            }
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${currentChoice === 'relax_rule'
                                                    ? 'border-brand-primary bg-brand-primary/10 shadow-xs'
                                                    : 'border-border-subtle bg-surface hover:bg-surface-secondary'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Sliders size={14} className="text-brand-primary shrink-0" />
                                                    <span className="font-bold text-xs text-text-primary">
                                                        {isKa ? 'წესის შემსუბუქება (Any)' : 'Relax Rule (Any Gender)'}
                                                    </span>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={`caseA_${conflict.requirementId}`}
                                                    checked={currentChoice === 'relax_rule'}
                                                    onChange={() => { }}
                                                    className="text-brand-primary focus:ring-brand-primary cursor-pointer"
                                                />
                                            </div>
                                            <p className="text-[11px] text-text-secondary m-0">
                                                {isKa
                                                    ? 'მოთხოვნის შეცვლა Any-ზე (ნებისმიერი სქესი), რათა მოვალეობა ბიჭებზე გადანაწილდეს.'
                                                    : 'Change requirement to Any gender so remaining male performers can take shifts.'}
                                            </p>
                                        </div>

                                        {/* Option 2: Pause Task */}
                                        <div
                                            onClick={() =>
                                                setCaseAChoices((prev) => ({
                                                    ...prev,
                                                    [conflict.requirementId]: 'pause_task'
                                                }))
                                            }
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${currentChoice === 'pause_task'
                                                    ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                                                    : 'border-border-subtle bg-surface hover:bg-surface-secondary'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <PauseCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                                    <span className="font-bold text-xs text-text-primary">
                                                        {isKa ? 'დავალების შეჩერება' : 'Pause Task'}
                                                    </span>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={`caseA_${conflict.requirementId}`}
                                                    checked={currentChoice === 'pause_task'}
                                                    onChange={() => { }}
                                                    className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                />
                                            </div>
                                            <p className="text-[11px] text-text-secondary m-0">
                                                {isKa
                                                    ? 'დავალება გადავიდეს «Needs Attention / შეჩერებულია»-ზე, სანამ ახალი წევრი არ დაემატება.'
                                                    : 'Task status marked Needs Attention / Paused until a new qualified performer is added.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── CASE B: Headcount Shortage ── */}
                {caseBConflicts.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                            <AlertTriangle size={14} className="shrink-0" />
                            <span>{isKa ? 'არასაკმარისი რაოდენობა (Understaffed)' : 'Case B: Headcount Shortage'}</span>
                        </div>

                        {caseBConflicts.map((conflict) => {
                            const currentChoice = caseBChoices[conflict.requirementId] || 'reduce_headcount';
                            return (
                                <div
                                    key={conflict.requirementId}
                                    className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/50 bg-amber-500/5 flex flex-col gap-3 shadow-2xs"
                                >
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-200 leading-snug m-0">
                                                {conflict.message}
                                            </p>
                                            <span className="inline-block mt-1 text-[11px] font-medium text-amber-800/80 dark:text-amber-300/80">
                                                {isKa ? 'ჯგუფი' : 'Group'}: <strong>{conflict.groupName}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-xs font-bold text-text-secondary mt-1">
                                        {isKa ? 'აირჩიეთ სისტემის მოქმედება:' : 'Choose Resolution Action:'}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {/* Option 1: Reduce Headcount */}
                                        <div
                                            onClick={() =>
                                                setCaseBChoices((prev) => ({
                                                    ...prev,
                                                    [conflict.requirementId]: 'reduce_headcount'
                                                }))
                                            }
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${currentChoice === 'reduce_headcount'
                                                    ? 'border-brand-primary bg-brand-primary/10 shadow-xs'
                                                    : 'border-border-subtle bg-surface hover:bg-surface-secondary'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 size={14} className="text-brand-primary shrink-0" />
                                                    <span className="font-bold text-xs text-text-primary">
                                                        {isKa
                                                            ? `დიახ, შემცირდეს ${conflict.remainingEligibleCount}-მდე`
                                                            : `Reduce to ${conflict.remainingEligibleCount}`}
                                                    </span>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={`caseB_${conflict.requirementId}`}
                                                    checked={currentChoice === 'reduce_headcount'}
                                                    onChange={() => { }}
                                                    className="text-brand-primary focus:ring-brand-primary cursor-pointer"
                                                />
                                            </div>
                                            <p className="text-[11px] text-text-secondary m-0">
                                                {isKa
                                                    ? `მოთხოვნილი რაოდენობა შემცირდება ${conflict.remainingEligibleCount} შემსრულებლამდე და სრულად დაკომპლექტდება.`
                                                    : `Adjust required headcount to ${conflict.remainingEligibleCount} so no vacant slots remain.`}
                                            </p>
                                        </div>

                                        {/* Option 2: Keep Vacant */}
                                        <div
                                            onClick={() =>
                                                setCaseBChoices((prev) => ({
                                                    ...prev,
                                                    [conflict.requirementId]: 'keep_vacant'
                                                }))
                                            }
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${currentChoice === 'keep_vacant'
                                                    ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                                                    : 'border-border-subtle bg-surface hover:bg-surface-secondary'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                                    <span className="font-bold text-xs text-text-primary">
                                                        {isKa ? 'დარჩეს ვაკანტური' : 'Leave Vacant'}
                                                    </span>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={`caseB_${conflict.requirementId}`}
                                                    checked={currentChoice === 'keep_vacant'}
                                                    onChange={() => { }}
                                                    className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                />
                                            </div>
                                            <p className="text-[11px] text-text-secondary m-0">
                                                {isKa
                                                    ? 'დარჩენილი სლოტი გახდება „ვაკანტური" და კალენდარზე გამოჩნდება ყვითელი გაფრთხილების სამკუთხედი.'
                                                    : 'Slot becomes Unassigned/Understaffed and shows a warning triangle indicator on calendar cards.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── CASE C: Normal Rotation (Informational) ── */}
                <div className="p-3.5 rounded-xl border border-blue-500/25 bg-blue-500/5 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>{isKa ? 'როტაციის ავტომატური გადათვლა' : 'Case C: Automated Fair Rotation Resync'}</span>
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>
                                {isKa
                                    ? 'წარსული შოუები რჩება უცვლელი (ისტორია არ იშლება).'
                                    : 'Past shows remain untouched (history strictly preserved).'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span>
                                {isKa
                                    ? 'მომავალი შოუებიდან ეს არტისტი ავტომატურად ამოიშლება.'
                                    : 'Performer will be automatically removed from all upcoming shows.'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span>
                                {isKa
                                    ? 'სისტემა მომავალ შოუებზე როტაციას თავიდან გადათვლის დარჩენილ წევრებს შორის.'
                                    : 'System will recalculate automated rotation among remaining group members.'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Collapsible Future Show Assignments */}
                {futureDutyAssignments.length > 0 && (
                    <div className="border border-border-subtle rounded-xl p-3 bg-surface">
                        <button
                            type="button"
                            onClick={() => setShowFutureAssignments(!showFutureAssignments)}
                            className="w-full flex items-center justify-between text-xs font-bold text-text-primary cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar size={13} className="text-text-tertiary" />
                                <span>
                                    {isKa
                                        ? `დანიშნული მომავალი მორიგეობები (${futureDutyAssignments.length})`
                                        : `Assigned Future Shifts (${futureDutyAssignments.length})`}
                                </span>
                            </div>
                            <span className="text-[11px] text-brand-primary font-semibold">
                                {showFutureAssignments ? (isKa ? 'დახურვა' : 'Hide') : (isKa ? 'ჩვენება' : 'Show')}
                            </span>
                        </button>

                        {showFutureAssignments && (
                            <div className="mt-2.5 flex flex-col gap-1.5 max-h-48 overflow-y-auto pt-1 border-t border-border-subtle">
                                {futureDutyAssignments.map((duty, idx) => (
                                    <div
                                        key={`${duty.eventId}_${duty.dutyItemName}_${idx}`}
                                        className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-surface-secondary/70 border border-border-subtle gap-2"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="font-bold text-text-primary truncate">{duty.eventTitle}</span>
                                            <span className="text-text-secondary">•</span>
                                            <span className="text-brand-primary font-medium truncate">{duty.dutyItemName}</span>
                                        </div>
                                        <span className="text-[11px] text-text-secondary shrink-0 font-mono">
                                            {new Date(duty.startDateTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
