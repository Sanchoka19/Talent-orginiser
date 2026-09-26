export type UserStatus = 'active' | 'invited';
export type UserRoleId = 'admin' | 'director' | 'stage_manager' | string;

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRoleId;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
}

