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

export type ReviewType = 'End of Season' | 'Mid-Season Review' | 'Early Termination';
export type TerminationReason = 'Discipline' | 'Conflict' | 'Injury' | 'Other';
export type RehireStatus = 'Eligible for Rehire' | 'Neutral' | 'Do Not Rehire' | 'Under Review';
export type CompletionStatus = 'Completed Successfully' | 'Terminated Early';

export interface ReviewScores {
  punctuality: number; // 1 to 5
  performance: number; // 1 to 5
  teamwork: number; // 1 to 5
  gearCare?: number; // 1 to 5
}

export interface TalentReview {
  id: string;
  projectName: string;
  period: string; // e.g., 'May 2025 – Oct 2025'
  reviewType: ReviewType;
  terminationReason?: TerminationReason;
  completionStatus: CompletionStatus;
  scores: ReviewScores;
  overallRating: number; // e.g. 4.8
  rehireStatus: RehireStatus;
  privateNote: string;
  reviewerName: string;
  createdAt: string;
  location?: string;
  initiator?: 'Management' | 'Artist' | 'Mutual';
  terminationDate?: string;
}

export interface ArchiveRecord {
  id: string;
  talentId: string;
  talentName: string;
  talentAvatar?: string;
  talentRole: string;
  talentEmail: string;
  talentPhone: string;
  projectName: string;
  location: string;
  period: string;
  year: number;
  reviewType: ReviewType;
  completionStatus: CompletionStatus;
  terminationReason?: TerminationReason;
  terminationDate?: string;
  initiator: 'Management' | 'Artist' | 'Mutual';
  scores: ReviewScores;
  overallRating: number;
  rehireStatus: RehireStatus;
  privateNote: string;
  reviewerName: string;
  createdAt: string;
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
  reviews?: TalentReview[];
  rehireStatus?: RehireStatus;
  createdAt: string;
}

