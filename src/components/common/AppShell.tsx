'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useModal } from '../../context/ModalContext';

const TalentFormModal = dynamic(
  () => import('../talent/TalentFormModal').then((mod) => mod.TalentFormModal),
  { ssr: false }
);
const GroupFormModal = dynamic(
  () => import('../groups/GroupFormModal').then((mod) => mod.GroupFormModal),
  { ssr: false }
);
const VenueFormModal = dynamic(
  () => import('../venues/VenueFormModal').then((mod) => mod.VenueFormModal),
  { ssr: false }
);
const ScheduleModal = dynamic(
  () => import('../calendar/ScheduleModal').then((mod) => mod.ScheduleModal),
  { ssr: false }
);

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    isTalentModalOpen,
    setIsTalentModalOpen,
    isGroupModalOpen,
    setIsGroupModalOpen,
    isVenueModalOpen,
    setIsVenueModalOpen,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    openTalentModal,
    openGroupModal,
    openVenueModal,
    openScheduleModal
  } = useModal();

  return (
    <div className="flex w-full min-h-screen relative bg-canvas">
      {/* Left Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenNewTalent={openTalentModal}
        onOpenNewGroup={openGroupModal}
        onOpenNewVenue={openVenueModal}
        onOpenNewSchedule={openScheduleModal}
      />

      {/* Main Workspace with Sticky TopBar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar onMenuToggle={() => setIsSidebarOpen((v) => !v)} />
        <main className="flex-1 w-full max-w-none p-6 sm:px-8 overflow-y-auto min-w-0 flex flex-col">
          {children}
        </main>
      </div>

      {/* Quick Action Modals */}
      {isTalentModalOpen && (
        <TalentFormModal
          isOpen={isTalentModalOpen}
          onClose={() => setIsTalentModalOpen(false)}
        />
      )}

      {isGroupModalOpen && (
        <GroupFormModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
        />
      )}

      {isVenueModalOpen && (
        <VenueFormModal
          isOpen={isVenueModalOpen}
          onClose={() => setIsVenueModalOpen(false)}
        />
      )}

      {isScheduleModalOpen && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}
    </div>
  );
};
