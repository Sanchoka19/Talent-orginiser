'use client';

import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  isTalentModalOpen: boolean;
  setIsTalentModalOpen: (open: boolean) => void;
  isGroupModalOpen: boolean;
  setIsGroupModalOpen: (open: boolean) => void;
  isVenueModalOpen: boolean;
  setIsVenueModalOpen: (open: boolean) => void;
  isScheduleModalOpen: boolean;
  setIsScheduleModalOpen: (open: boolean) => void;
  openTalentModal: () => void;
  openGroupModal: () => void;
  openVenueModal: () => void;
  openScheduleModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        isTalentModalOpen,
        setIsTalentModalOpen,
        isGroupModalOpen,
        setIsGroupModalOpen,
        isVenueModalOpen,
        setIsVenueModalOpen,
        isScheduleModalOpen,
        setIsScheduleModalOpen,
        openTalentModal: () => setIsTalentModalOpen(true),
        openGroupModal: () => setIsGroupModalOpen(true),
        openVenueModal: () => setIsVenueModalOpen(true),
        openScheduleModal: () => setIsScheduleModalOpen(true),
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
