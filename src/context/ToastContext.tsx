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
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '28px',
          zIndex: 100000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none'
        }}
      >
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

          const badgeBg = isSuccess
            ? 'rgba(22, 163, 74, 0.12)'
            : isError
            ? 'rgba(239, 68, 68, 0.12)'
            : isWarning
            ? 'rgba(245, 158, 11, 0.14)'
            : 'rgba(2, 132, 199, 0.12)';

          const badgeColor = isSuccess
            ? '#16A34A'
            : isError
            ? '#DC2626'
            : isWarning
            ? '#D97706'
            : '#0284C7';

          const borderColor = isSuccess
            ? 'rgba(22, 163, 74, 0.25)'
            : isError
            ? 'rgba(239, 68, 68, 0.25)'
            : isWarning
            ? 'rgba(245, 158, 11, 0.28)'
            : 'rgba(2, 132, 199, 0.25)';

          return (
            <div
              key={item.id}
              style={{
                pointerEvents: 'auto',
                minWidth: '320px',
                maxWidth: '440px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${borderColor}`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                animation: 'toastPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: badgeBg,
                    color: badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {icon}
                </div>

                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-charcoal)',
                    lineHeight: 1.4,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {item.message}
                </span>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.12s, color 0.12s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.color = 'var(--color-charcoal)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
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
