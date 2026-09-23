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
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '620px',
  zIndex
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

  return (
    <div
      className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
      style={zIndex ? { zIndex } : undefined}
    >
      <div
        className="bg-surface rounded-lg border border-border-subtle shadow-modal w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:px-7 sm:py-5 border-b border-border-subtle flex items-start justify-between gap-4 shrink-0">
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
            onClick={onClose}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:px-7 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="p-4 sm:px-7 sm:py-5 border-t border-border-subtle flex items-center justify-end gap-3 bg-surface-secondary shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
