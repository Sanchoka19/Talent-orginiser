import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TalentList } from './components/talent/TalentList';
import { GroupList } from './components/groups/GroupList';
import { VenueList } from './components/venues/VenueList';
import { TimelineCalendar } from './components/calendar/TimelineCalendar';
import { TopBar } from './components/common/TopBar';
import { SettingsView } from './components/settings/SettingsView';
import { TalentFormModal } from './components/talent/TalentFormModal';
import { GroupFormModal } from './components/groups/GroupFormModal';
import { VenueFormModal } from './components/venues/VenueFormModal';
import { ScheduleModal } from './components/calendar/ScheduleModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    // Restore last active tab from localStorage on mount
    const saved = localStorage.getItem('activeTab') as NavTab | null;
    const validTabs: NavTab[] = ['dashboard', 'talents', 'groups', 'venues', 'calendar', '/settings/profile', '/settings/roles'];
    return saved && validTabs.includes(saved) ? saved : 'dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Quick action modals
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Persist active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Close sidebar on tab change (mobile)
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenNewTalent={() => setIsTalentModalOpen(true)}
        onOpenNewGroup={() => setIsGroupModalOpen(true)}
        onOpenNewVenue={() => setIsVenueModalOpen(true)}
        onOpenNewSchedule={() => setIsScheduleModalOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace with Sticky TopBar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        <TopBar activeTab={activeTab} onNavigateTab={setActiveTab} onMenuToggle={() => setIsSidebarOpen((v) => !v)} />
        <main className="app-main-content">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewSchedule={() => setIsScheduleModalOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}
          {activeTab === 'talents' && <TalentList />}
          {activeTab === 'groups' && <GroupList />}
          {activeTab === 'venues' && <VenueList />}
          {activeTab === 'calendar' && <TimelineCalendar />}
          {activeTab === '/settings/profile' && <SettingsView subTab="profile" />}
          {activeTab === '/settings/roles' && <SettingsView subTab="roles" />}
        </main>
      </div>

      {/* Quick Action Modals */}
      <TalentFormModal
        isOpen={isTalentModalOpen}
        onClose={() => setIsTalentModalOpen(false)}
      />

      <GroupFormModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />

      <VenueFormModal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
};


export function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <ConfirmProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ConfirmProvider>
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
