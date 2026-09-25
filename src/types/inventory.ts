export type DutyGenderRequirement = 'Male Only' | 'Female Only' | 'Any';
export type DutyCategory = 'inventory' | 'special_task';
export type TaskRotationCycle = 'every_show' | 'weekly' | 'monthly' | 'fixed';

export interface DutySlot {
  id: string;
  position: string; // e.g. "მარცხნივ" / "Stage Left"
  assignedGender: DutyGenderRequirement;
  headcount: number;
  rotationCycle?: TaskRotationCycle;
}

export interface SpecialDutyTask {
  id: string;
  name: string;
  rotationCycle: TaskRotationCycle;
  slots: DutySlot[]; // Multi-slot stage positions array
  assignedTalentIds?: string[];
  assignedTalentId?: string;
}

export interface InventoryRequirement {
  id: string;
  itemName: string;
  category?: DutyCategory;
  assignedGender: DutyGenderRequirement;
  requiredHeadcount: number;
  notes?: string;
  position?: string;
  rotationCycle?: TaskRotationCycle;
  assignedTalentId?: string;
  assignedTalentIds?: string[];
  parentTaskId?: string;
}

export const COMMON_INVENTORY_ITEMS: string[] = [
  'Heavy Audio Rig',
  'Costume Bags & Wardrobe',
  'Stage Props & Setup',
  'Lighting Truss & Cables',
  'Acrobatic Rigging & Mats',
  'Pyrotechnics & Effects Case',
  'Instruments Flight Cases',
  'Makeup & Dressing Vanity'
];

export const COMMON_SPECIAL_TASKS: string[] = [
  'ფარდის გაწევა',
  'სცენის განათების მართვა',
  'არტისტების კოორდინაცია (Green Room)',
  'ხმის ინჟინრის ასისტირება',
  'რეკვიზიტის სწრაფი შეცვლა',
  'Stage Curtain Cue',
  'Spotlight Control',
  'Backstage Queue Manager'
];

export const COMMON_STAGE_POSITIONS: string[] = [
  'სცენის მარცხენა (Stage Left)',
  'სცენის მარჯვენა (Stage Right)',
  'სცენის ცენტრი (Center Stage)',
  'კულისები (Backstage)',
  'ხმის პულტი (FOH / Audio Control)',
  'განათების მართვა (Spotlight Booth)',
  'საგრიმიორო (Green Room Queue)'
];
