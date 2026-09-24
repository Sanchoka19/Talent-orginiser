'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  zIndex?: number;
  position?: 'center' | 'side';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '620px',
  zIndex,
  position = 'center'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSide = position === 'side';

  return (
    <div
      className={`fixed inset-0 bg-surface-overlay backdrop-blur-sm z-[1200] animate-in fade-in duration-200 ${
        isSide ? 'flex justify-end' : 'flex items-center justify-center p-4'
      }`}
      onClick={onClose}
      style={zIndex ? { zIndex } : undefined}
    >
      <div
        className={`bg-surface shadow-modal flex flex-col relative overflow-hidden ${
          isSide
            ? 'w-full h-screen max-h-screen border-l border-border-subtle animate-in slide-in-from-right duration-300'
            : 'w-full max-h-[90vh] rounded-xl border border-border-subtle animate-in zoom-in-95 duration-200'
        }`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:px-6 sm:py-5 border-b border-border-subtle flex items-start justify-between gap-4 shrink-0 bg-surface">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight m-0">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-text-secondary mt-1 m-0">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="p-4 sm:px-6 sm:py-4 border-t border-border-subtle flex items-center justify-end gap-3 bg-surface-secondary/80 backdrop-blur-sm shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
