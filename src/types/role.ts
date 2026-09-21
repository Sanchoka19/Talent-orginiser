export type RoleCategory = 'Operations' | 'Management' | 'Custom';

export interface RoleDefinition {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  desc: string;
  permissions: string[];
}

export interface PermissionItem {
  id: string;
  label: string;
  labelKa?: string;
  labelEn?: string;
}

export interface PermissionModuleData {
  id: string;
  title: string;
  titleKa?: string;
  titleEn?: string;
  iconType: 'talents' | 'schedule' | 'groups' | 'duty';
  permissions: PermissionItem[];
}

export const PERMISSION_MODULES: PermissionModuleData[] = [
  {
    id: 'talents',
    title: 'ტალანტები',
    titleKa: 'ტალანტები',
    titleEn: 'Talents',
    iconType: 'talents',
    permissions: [
      { id: 'talents:view', label: 'სიის ნახვა', labelKa: 'სიის ნახვა', labelEn: 'View List' },
      { id: 'talents:edit', label: 'რედაქტირება', labelKa: 'რედაქტირება', labelEn: 'Edit' },
      { id: 'talents:delete', label: 'წაშლა', labelKa: 'წაშლა', labelEn: 'Delete' }
    ]
  },
  {
    id: 'schedule',
    title: 'შოუები და განრიგი',
    titleKa: 'შოუები და განრიგი',
    titleEn: 'Shows & Schedule',
    iconType: 'schedule',
    permissions: [
      { id: 'schedule:view', label: 'ნახვა', labelKa: 'ნახვა', labelEn: 'View' },
      { id: 'schedule:book', label: 'დაჯავშნა', labelKa: 'დაჯავშნა', labelEn: 'Book' },
      { id: 'schedule:cancel', label: 'გაუქმება', labelKa: 'გაუქმება', labelEn: 'Cancel' }
    ]
  },
  {
    id: 'groups',
    title: 'ჯგუფები',
    titleKa: 'ჯგუფები',
    titleEn: 'Groups & Casts',
    iconType: 'groups',
    permissions: [
      { id: 'groups:manage', label: 'ფორმირება და მართვა', labelKa: 'ფორმირება და მართვა', labelEn: 'Manage Casts' }
    ]
  },
  {
    id: 'duty',
    title: 'ინვენტარი და მორიგეობა',
    titleKa: 'ინვენტარი და მორიგეობა',
    titleEn: 'Inventory & Duty',
    iconType: 'duty',
    permissions: [
      { id: 'duty:view', label: 'ნახვა', labelKa: 'ნახვა', labelEn: 'View Shifts' },
      { id: 'duty:override', label: 'ხელით გადაცვლა', labelKa: 'ხელით გადაცვლა', labelEn: 'Manual Override' },
      { id: 'attendance:mark', label: 'დასწრების აღრიცხვა', labelKa: 'დასწრების აღრიცხვა', labelEn: 'Mark Attendance' }
    ]
  }
];

export const PERMISSION_LABELS_KA: Record<string, string> = {
  'talents:view': 'ტალანტები: სიის ნახვა',
  'talents:edit': 'ტალანტები: რედაქტირება',
  'talents:delete': 'ტალანტები: წაშლა',
  'schedule:view': 'განრიგი: ნახვა',
  'schedule:book': 'განრიგი: დაჯავშნა',
  'schedule:cancel': 'განრიგი: გაუქმება',
  'groups:manage': 'ჯგუფები: მართვა',
  'duty:view': 'მორიგეობა: ნახვა',
  'duty:override': 'მორიგეობა: ხელით გადაცვლა',
  'attendance:mark': 'დასწრების აღრიცხვა'
};

export const PERMISSION_LABELS_EN: Record<string, string> = {
  'talents:view': 'Talents: View Roster',
  'talents:edit': 'Talents: Edit',
  'talents:delete': 'Talents: Delete',
  'schedule:view': 'Schedule: View',
  'schedule:book': 'Schedule: Book',
  'schedule:cancel': 'Schedule: Cancel',
  'groups:manage': 'Groups: Manage',
  'duty:view': 'Duty: View',
  'duty:override': 'Duty: Override',
  'attendance:mark': 'Attendance: Mark Check'
};

export const PERMISSION_LABELS = PERMISSION_LABELS_KA;

export const ROLE_TEMPLATES: Record<string, string[]> = {
  Operations: ['schedule:view', 'duty:view', 'talents:view', 'attendance:mark'],
  Management: ['schedule:view', 'schedule:book', 'talents:view', 'talents:edit', 'groups:manage', 'duty:override'],
  Custom: [],
  operations: ['schedule:view', 'duty:view', 'talents:view', 'attendance:mark'],
  management: ['schedule:view', 'schedule:book', 'talents:view', 'talents:edit', 'groups:manage', 'duty:override'],
  custom: []
};
