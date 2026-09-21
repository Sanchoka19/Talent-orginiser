export type Gender = 'Male' | 'Female';
export type TalentStatus = 'Active' | 'Rest' | 'Sick/Injured';

export interface TalentDocument {
  id: string;
  name: string;
  type: 'Passport' | 'Visa' | 'ID Card' | 'Contract' | 'Medical' | 'Other';
  fileSize?: string;
  url?: string;
  expiryDate?: string;
  uploadedAt: string;
}

export interface Talent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;
  heightCm: number;
  weightKg?: number;
  status: TalentStatus;
  primarySkill: string; // e.g., 'Aerialist', 'Lead Vocalist', 'Hip Hop Dancer', 'Acrobat'
  secondarySkills?: string[];
  avatarUrl?: string;
  documents: TalentDocument[];
  notes?: string;
  createdAt: string;
}
