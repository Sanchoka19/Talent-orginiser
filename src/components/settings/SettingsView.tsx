import React from 'react';
import { RolesAndPermissions } from './RolesAndPermissions';
import { ProfileView } from './ProfileView';

interface SettingsViewProps {
  subTab: 'profile' | 'roles';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ subTab }) => {
  if (subTab === 'roles') {
    return <RolesAndPermissions />;
  }

  return <ProfileView />;
};
