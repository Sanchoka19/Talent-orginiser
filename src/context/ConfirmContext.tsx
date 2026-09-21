import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmModal } from '../components/common/ConfirmModal';

export interface ConfirmRequest {
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: 'trash' | 'alert' | 'info' | 'refresh';
  requiredMatch?: string;
  matchInstruction?: string;
  onConfirm: () => void | Promise<void>;
}

interface ConfirmContextType {
  confirm: (request: ConfirmRequest) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRequest, setCurrentRequest] = useState<ConfirmRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirm = useCallback((request: ConfirmRequest) => {
    setCurrentRequest(request);
    setIsOpen(true);
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setIsOpen(false);
    setCurrentRequest(null);
  }, [isSubmitting]);

  const handleConfirm = useCallback(async () => {
    if (!currentRequest) return;
    try {
      setIsSubmitting(true);
      await currentRequest.onConfirm();
      setIsOpen(false);
      setCurrentRequest(null);
    } catch (err) {
      console.error('Error during confirm action:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentRequest]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {currentRequest && (
        <ConfirmModal
          isOpen={isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={currentRequest.title}
          message={currentRequest.message}
          itemName={currentRequest.itemName}
          confirmLabel={currentRequest.confirmLabel}
          cancelLabel={currentRequest.cancelLabel}
          variant={currentRequest.variant}
          icon={currentRequest.icon}
          requiredMatch={currentRequest.requiredMatch}
          matchInstruction={currentRequest.matchInstruction}
          isSubmitting={isSubmitting}
        />
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
