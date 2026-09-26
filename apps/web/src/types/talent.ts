export type Gender = 'Male' | 'Female';
export type TalentStatus = 'Active' | 'Rest' | 'Sick/Injured' | 'Terminated';

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
export type RehireStatus = 'eligible' | 'neutral' | 'do_not_rehire' | 'Eligible for Rehire' | 'Neutral' | 'Do Not Rehire' | 'Under Review';
export type CompletionStatus = 'Completed Successfully' | 'Terminated Early';

export interface ReviewScores {
  punctuality: number; // 1 to 5
  performance: number; // 1 to 5
  teamwork: number; // 1 to 5
  gearCare?: number; // 1 to 5
}

export interface ContractRecord {
  id: string;
  talentId: string;
  talentName: string;
  talentRole: string;
  avatarUrl?: string;
  projectName: string;
  location: string;
  period: string; // e.g. "მაისი 2026 – სექტემბერი 2026"
  startDate: string;
  endDate: string;
  contractStatus: 'completed' | 'terminated';
  rating: number; // 1.0 - 5.0
  rehireStatus: 'eligible' | 'neutral' | 'do_not_rehire';
  terminationReason?: string; // მხოლოდ terminated-ის შემთხვევაში
  initiator?: 'mutual' | 'admin' | 'talent';
  internalNote?: string;
  reviewedBy: string;
  reviewDate: string;

  // Backward-compatibility aliases
  overallRating?: number;
  privateNote?: string;
  reviewerName?: string;
  createdAt?: string;
  completionStatus?: CompletionStatus;
  reviewType?: ReviewType;
  scores?: ReviewScores;
  terminationDate?: string;
  talentAvatar?: string;
  talentEmail?: string;
  talentPhone?: string;
  year?: number;
}

export type TalentReview = ContractRecord;
export type ArchiveRecord = ContractRecord;

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
  reviews?: ContractRecord[];
  rehireStatus?: RehireStatus;
  contractExpiryDate?: string; // ISO date string e.g. '2026-09-20'
  createdAt: string;
  isArchived?: boolean;
  contractStatus?: 'active' | 'terminated' | 'completed';
  terminationReason?: string;
  terminationDate?: string;
}

