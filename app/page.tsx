'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardView } from '../src/components/dashboard/DashboardView';
import { useModal } from '../src/context/ModalContext';
import { NavTab } from '../src/components/common/Sidebar';

export default function HomePage() {
  const router = useRouter();
  const { openScheduleModal } = useModal();

  const handleNavigateTab = (tab: NavTab) => {
    const tabPaths: Record<NavTab, string> = {
      dashboard: '/',
      talents: '/talents',
      groups: '/groups',
      venues: '/venues',
      calendar: '/calendar',
      archive: '/archive',
      '/settings/profile': '/settings/profile',
      '/settings/roles': '/settings/roles'
    };
    router.push(tabPaths[tab] || '/');
  };

  return (
    <DashboardView
      onOpenNewSchedule={openScheduleModal}
      onNavigateTab={handleNavigateTab}
    />
  );
}
