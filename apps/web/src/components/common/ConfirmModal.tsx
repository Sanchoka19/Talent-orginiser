'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, AlertTriangle, RotateCw, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: 'trash' | 'alert' | 'info' | 'refresh';
  requiredMatch?: string;
  matchInstruction?: string;
  isSubmitting?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  icon,
  requiredMatch,
  matchInstruction,
  isSubmitting = false
}) => {
  const { language } = useLanguage();
  const [typedInput, setTypedInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedInput('');
    }
  }, [isOpen]);

  const isMatchRequired = Boolean(requiredMatch && requiredMatch.trim().length > 0);
  const isMatchValid = !isMatchRequired || typedInput.trim() === requiredMatch?.trim();
  const isConfirmDisabled = isSubmitting || !isMatchValid;

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

  if (!isOpen) return null;

  const defaultConfirmText =
    variant === 'danger'
      ? language === 'ka'
        ? 'წაშლა'
        : 'Delete'
      : language === 'ka'
      ? 'დადასტურება'
      : 'Confirm';

  const defaultCancelText = language === 'ka' ? 'გაუქმება' : 'Cancel';

  // Icon selection
  const renderIcon = () => {
    if (icon === 'refresh' || variant === 'info') {
      return <RotateCw size={22} strokeWidth={2.2} />;
    }
    if (icon === 'alert' || variant === 'warning') {
      return <AlertTriangle size={22} strokeWidth={2.2} />;
    }
    return <Trash2 size={22} strokeWidth={2.2} />;
  };

  const getVariantClasses = () => {
    if (variant === 'warning') {
      return {
        iconBox: 'bg-amber-500/10 text-amber-600',
        dot: 'bg-amber-500',
        btnBg: 'bg-amber-600 hover:bg-amber-700 text-white'
      };
    }
    if (variant === 'info') {
      return {
        iconBox: 'bg-brand-primary/10 text-brand-primary',
        dot: 'bg-brand-primary',
        btnBg: 'bg-brand-primary hover:bg-brand-primary-hover text-white'
      };
    }
    // Danger default
    return {
      iconBox: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      dot: 'bg-rose-500',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm'
    };
  };

  const vClasses = getVariantClasses();

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-[460px] h-auto max-h-[90vh] rounded-2xl overflow-hidden shadow-modal bg-surface border border-border-subtle flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 pb-3.5 flex items-start justify-between gap-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${vClasses.iconBox}`}>
              {renderIcon()}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary m-0 tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5 m-0">
                {variant === 'danger'
                  ? language === 'ka'
                    ? 'ეს მოქმედება შეუქცევადია'
                    : 'This action cannot be undone'
                  : language === 'ka'
                  ? 'გთხოვთ დაადასტუროთ'
                  : 'Please confirm to proceed'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all shrink-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-5 overflow-y-auto">
          <p className="text-sm text-text-secondary leading-relaxed m-0 mb-3.5">
            {message}
          </p>

          {/* Item Highlight Chip (if provided) */}
          {itemName && (
            <div className="p-2.5 px-3.5 rounded-sm bg-surface-secondary border border-border-subtle flex items-center gap-2.5 mb-3.5">
              <div className={`w-2 h-2 rounded-full shrink-0 ${vClasses.dot}`} />
              <span className="text-sm font-semibold text-text-primary truncate">
                {itemName}
              </span>
            </div>
          )}

          {/* GitHub-style Match Confirmation Input */}
          {isMatchRequired && (
            <div className="mt-4 p-3.5 rounded-md bg-surface-secondary border border-border-subtle">
              <label className="text-xs font-semibold text-text-primary block mb-2 leading-relaxed">
                {matchInstruction || (
                  language === 'ka' ? (
                    <>
                      დასადასტურებლად ქვემოთ აკრიფეთ:{' '}
                      <span className="inline-block font-bold text-danger bg-danger/10 px-2 py-0.5 rounded select-all tracking-wide">
                        {requiredMatch}
                      </span>
                    </>
                  ) : (
                    <>
                      To confirm, type{' '}
                      <span className="inline-block font-bold text-danger bg-danger/10 px-2 py-0.5 rounded select-all tracking-wide">
                        {requiredMatch}
                      </span>{' '}
                      below:
                    </>
                  )
                )}
              </label>
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isConfirmDisabled) {
                    e.preventDefault();
                    onConfirm();
                  }
                }}
                placeholder={requiredMatch}
                autoFocus
                className={`w-full px-3 py-2 text-sm rounded-md bg-surface outline-none transition-all placeholder:text-text-tertiary border ${
                  isMatchValid && typedInput.length > 0
                    ? 'border-emerald-600 ring-1 ring-emerald-500/20'
                    : typedInput.length > 0
                    ? 'border-rose-400 ring-1 ring-rose-500/20'
                    : 'border-border-subtle focus:border-brand-primary'
                }`}
              />
              {typedInput.length > 0 && !isMatchValid && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{language === 'ka' ? 'შეყვანილი სახელი არ ემთხვევა' : 'Entered name does not match'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-surface-secondary border-t border-border-subtle flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary transition-all cursor-pointer"
          >
            {cancelLabel || defaultCancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm ${
              isConfirmDisabled
                ? 'bg-border-subtle text-text-tertiary cursor-not-allowed opacity-65 shadow-none'
                : `${vClasses.btnBg} cursor-pointer`
            }`}
          >
            {variant === 'danger' && <Trash2 size={14} />}
            <span>
              {isSubmitting
                ? (language === 'ka' ? 'მიმდინარეობს...' : 'Processing...')
                : confirmLabel || defaultConfirmText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
