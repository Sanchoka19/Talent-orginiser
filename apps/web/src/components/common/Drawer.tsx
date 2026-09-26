'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  width = '420px'
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
      className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex justify-end z-[1000] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full h-screen max-h-screen bg-surface shadow-modal border-l border-border-subtle flex flex-col relative overflow-hidden animate-in slide-in-from-right duration-300"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 rounded-full inline-flex items-center justify-center border border-border-subtle bg-surface/90 backdrop-blur-md text-text-primary hover:bg-surface-secondary hover:border-border-medium transition-all duration-150 cursor-pointer absolute top-4 right-4 z-10 shadow-sm"
        >
          <X size={16} />
        </button>

        {children}
      </div>
    </div>
  );
};
