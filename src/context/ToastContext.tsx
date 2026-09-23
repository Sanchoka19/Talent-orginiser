'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration: number = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newToast: ToastItem = { id, type, message, duration };

    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep maximum 5 at a time

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toastMethods = {
    success: useCallback((message: string, duration?: number) => addToast('success', message, duration), [addToast]),
    error: useCallback((message: string, duration?: number) => addToast('error', message, duration), [addToast]),
    warning: useCallback((message: string, duration?: number) => addToast('warning', message, duration), [addToast]),
    info: useCallback((message: string, duration?: number) => addToast('info', message, duration), [addToast])
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}

      {/* Top-Right Floating Toast Stack */}
      <div className="fixed top-6 right-7 z-[100000] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((item) => {
          const isSuccess = item.type === 'success';
          const isError = item.type === 'error';
          const isWarning = item.type === 'warning';

          const icon = isSuccess ? (
            <CheckCircle2 size={18} strokeWidth={2.2} />
          ) : isError ? (
            <AlertCircle size={18} strokeWidth={2.2} />
          ) : isWarning ? (
            <AlertTriangle size={18} strokeWidth={2.2} />
          ) : (
            <Info size={18} strokeWidth={2.2} />
          );

          const badgeStyles = isSuccess
            ? 'bg-status-active-bg text-status-active-text'
            : isError
            ? 'bg-danger-light text-danger'
            : isWarning
            ? 'bg-status-rest-bg text-status-rest-text'
            : 'bg-brand-primary-light text-brand-primary';

          const borderStyles = isSuccess
            ? 'border-emerald-500/30'
            : isError
            ? 'border-danger/30'
            : isWarning
            ? 'border-amber-500/30'
            : 'border-brand-primary/30';

          return (
            <div
              key={item.id}
              className={`pointer-events-auto min-w-[320px] max-w-[440px] rounded-md bg-white/95 backdrop-blur-md border ${borderStyles} shadow-lg px-4 py-3 flex items-center justify-between gap-3 transition-all duration-200 animate-[toastPopIn_0.25s_cubic-bezier(0.16,1,0.3,1)]`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-sm ${badgeStyles} flex items-center justify-center shrink-0`}
                >
                  {icon}
                </div>

                <span className="text-sm font-semibold text-text-primary leading-snug tracking-tight">
                  {item.message}
                </span>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="p-1 rounded-xs text-text-secondary hover:text-text-primary hover:bg-black/5 flex items-center justify-center shrink-0 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastPopIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
