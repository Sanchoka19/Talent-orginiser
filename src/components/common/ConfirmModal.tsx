import React, { useEffect } from 'react';
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
  const [typedInput, setTypedInput] = React.useState('');

  React.useEffect(() => {
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
      return <RotateCw size={24} strokeWidth={2.2} />;
    }
    if (icon === 'alert' || variant === 'warning') {
      return <AlertTriangle size={24} strokeWidth={2.2} />;
    }
    return <Trash2 size={24} strokeWidth={2.2} />;
  };

  const getVariantStyles = () => {
    if (variant === 'warning') {
      return {
        iconBg: 'rgba(245, 158, 11, 0.12)',
        iconColor: '#D97706',
        btnBg: '#D97706',
        btnHover: '#B45309'
      };
    }
    if (variant === 'info') {
      return {
        iconBg: 'var(--brand-primary-light)',
        iconColor: 'var(--brand-primary)',
        btnBg: 'var(--brand-primary)',
        btnHover: '#003A54'
      };
    }
    // Danger default
    return {
      iconBg: 'rgba(239, 68, 68, 0.1)',
      iconColor: '#DC2626',
      btnBg: '#DC2626',
      btnHover: '#B91C1C'
    };
  };

  const vStyles = getVariantStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999, // Highest z-index to always render on top of any open modal or drawer
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'confirmOverlayFadeIn 0.15s ease-out'
      }}
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: 'auto',
          maxHeight: '90vh',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'confirmBoxScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 24px 16px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: vStyles.iconBg,
                color: vStyles.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {renderIcon()}
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--color-charcoal)',
                  margin: 0,
                  letterSpacing: '-0.015em'
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  margin: '3px 0 0 0'
                }}
              >
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
            className="btn btn-secondary btn-icon"
            style={{
              width: '32px',
              height: '32px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '0 24px 22px 24px' }}>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              margin: '0 0 14px 0'
            }}
          >
            {message}
          </p>

          {/* Item Highlight Chip (if provided) */}
          {itemName && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: vStyles.iconColor,
                  flexShrink: 0
                }}
              />
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-charcoal)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {itemName}
              </span>
            </div>
          )}

          {/* GitHub-style Match Confirmation Input */}
          {isMatchRequired && (
            <div
              style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--color-charcoal)',
                  display: 'block',
                  marginBottom: '8px',
                  lineHeight: 1.45
                }}
              >
                {matchInstruction || (
                  language === 'ka' ? (
                    <>
                      დასადასტურებლად ქვემოთ აკრიფეთ:{' '}
                      <span
                        style={{
                          display: 'inline-block',
                          fontWeight: 700,
                          color: '#DC2626',
                          background: 'rgba(220, 38, 38, 0.08)',
                          padding: '1px 8px',
                          borderRadius: '6px',
                          userSelect: 'all',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {requiredMatch}
                      </span>
                    </>
                  ) : (
                    <>
                      To confirm, type{' '}
                      <span
                        style={{
                          display: 'inline-block',
                          fontWeight: 700,
                          color: '#DC2626',
                          background: 'rgba(220, 38, 38, 0.08)',
                          padding: '1px 8px',
                          borderRadius: '6px',
                          userSelect: 'all'
                        }}
                      >
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
                className="form-input"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isMatchValid && typedInput.length > 0
                    ? '1.5px solid #16A34A'
                    : typedInput.length > 0
                    ? '1.5px solid #EF4444'
                    : '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-surface)',
                  outline: 'none',
                  boxShadow: isMatchValid && typedInput.length > 0
                    ? '0 0 0 3px rgba(22, 163, 74, 0.15)'
                    : 'none',
                  transition: 'all 0.2s ease'
                }}
              />
              {typedInput.length > 0 && !isMatchValid && (
                <div style={{ fontSize: '0.725rem', color: '#DC2626', marginTop: '6px', fontWeight: 500 }}>
                  {language === 'ka' ? 'შეყვანილი სახელი არ ემთხვევა' : 'Entered name does not match'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            background: 'var(--bg-surface-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {cancelLabel || defaultCancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: isConfirmDisabled ? 'var(--border-subtle)' : vStyles.btnBg,
              color: isConfirmDisabled ? 'var(--color-text-tertiary)' : '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isConfirmDisabled ? 'not-allowed' : 'pointer',
              opacity: isConfirmDisabled ? 0.65 : 1,
              boxShadow: isConfirmDisabled ? 'none' : 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              if (!isConfirmDisabled) e.currentTarget.style.background = vStyles.btnHover;
            }}
            onMouseLeave={(e) => {
              if (!isConfirmDisabled) e.currentTarget.style.background = vStyles.btnBg;
            }}
          >
            {variant === 'danger' && <Trash2 size={14} />}
            <span>{isSubmitting ? (language === 'ka' ? 'მიმდინარეობს...' : 'Processing...') : confirmLabel || defaultConfirmText}</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confirmOverlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confirmBoxScaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
