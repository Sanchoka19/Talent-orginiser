'use client';

import React, { useEffect } from 'react';
import { Talent } from '../../types/talent';
import { Group } from '../../types/group';
import { useLanguage } from '../../context/LanguageContext';
import { getTalentAvatar } from '../../utils/avatarUtils';
import { AlertTriangle, X, Check, Info } from 'lucide-react';

export interface ConflictedMemberInfo {
  talent: Talent;
  existingGroups: Group[];
}

export interface MemberGroupConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetGroupName?: string;
  conflictedMembers: ConflictedMemberInfo[];
  isSubmitting?: boolean;
}

export const MemberGroupConflictModal: React.FC<MemberGroupConflictModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetGroupName,
  conflictedMembers,
  isSubmitting = false,
}) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || conflictedMembers.length === 0) return null;

  const isSingle = conflictedMembers.length === 1;
  const singleTalent = conflictedMembers[0]?.talent;

  const modalTitle = isKa
    ? isSingle
      ? `„${singleTalent.firstName} ${singleTalent.lastName}“ უკვე ირიცხება სხვა ჯგუფში`
      : 'არჩეული შემსრულებლები უკვე ირიცხებიან სხვა ჯგუფში'
    : isSingle
    ? `"${singleTalent.firstName} ${singleTalent.lastName}" is already in another group`
    : 'Selected performers are already in other groups';

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl overflow-hidden shadow-modal bg-surface border border-border-subtle flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3.5 flex items-start justify-between gap-3 shrink-0 border-b border-border-subtle/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
              <AlertTriangle size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary tracking-tight m-0">
                {modalTitle}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5 m-0">
                {isKa
                  ? 'გთხოვთ დაადასტუროთ შემსრულებლის სხვა ჯგუფში დამატება'
                  : 'Please confirm adding this performer to another group'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all shrink-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-3.5 max-h-[60vh] overflow-y-auto">
          {/* Question / Explanation banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-text-primary flex items-start gap-3">
            <Info size={17} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-amber-800 dark:text-amber-300">
                {isKa ? 'დარწმუნებული ხართ, რომ გსურთ დამატება?' : 'Are you sure you want to proceed?'}
              </span>
              <span className="text-xs text-text-secondary leading-relaxed">
                {isKa
                  ? isSingle
                    ? `შემსრულებელი უკვე დამატებულია სხვა ჯგუფში. თუ დაადასტურებთ, ის დაემატება${targetGroupName ? ` ჯგუფს „${targetGroupName}“` : ' ახალ ჯგუფსაც'} და პარალელურად დარჩება წინა ჯგუფშიც.`
                    : `ეს შემსრულებლები უკვე დამატებულნი არიან სხვა ჯგუფებში. თუ დაადასტურებთ, ისინი დაემატებიან${targetGroupName ? ` ჯგუფს „${targetGroupName}“` : ' ახალ ჯგუფსაც'} და პარალელურად დარჩებიან წინა ჯგუფებშიც.`
                  : isSingle
                  ? `This performer is already assigned to another group. If confirmed, they will be added${targetGroupName ? ` to "${targetGroupName}"` : ' to the new group'} while remaining active in their current group.`
                  : `These performers are already assigned to other groups. If confirmed, they will be added${targetGroupName ? ` to "${targetGroupName}"` : ' to the new group'} while remaining active in their current groups.`}
              </span>
            </div>
          </div>

          {/* Conflicted performers list */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-text-tertiary">
              {isKa ? 'შემსრულებელთა სია და მიმდინარე ჯგუფები' : 'Performers & current group memberships'}
            </span>

            <div className="flex flex-col gap-2">
              {conflictedMembers.map(({ talent, existingGroups }) => (
                <div
                  key={talent.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={getTalentAvatar(talent)}
                      alt={talent.firstName}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-border-subtle"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">
                        {talent.firstName} {talent.lastName}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {talent.primarySkill}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                    <span className="text-[10px] text-text-muted font-medium">
                      {isKa ? 'ირიცხება ჯგუფში:' : 'Member of:'}
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {existingGroups.map((grp) => (
                        <span
                          key={grp.id}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border shadow-2xs"
                          style={{
                            backgroundColor: `${grp.colorAccent || '#6366f1'}15`,
                            borderColor: `${grp.colorAccent || '#6366f1'}35`,
                            color: grp.colorAccent || '#6366f1',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: grp.colorAccent || '#6366f1' }}
                          />
                          <span>{grp.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-5 bg-surface-secondary/60 border-t border-border-subtle flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer"
          >
            {isKa ? 'გაუქმება' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <Check size={14} strokeWidth={2.5} />
            <span>
              {isSubmitting
                ? isKa
                  ? 'მიმდინარეობს...'
                  : 'Processing...'
                : isKa
                ? 'დიახ, დამატება'
                : 'Yes, Add'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
