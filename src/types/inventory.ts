export type DutyGenderRequirement = 'Male Only' | 'Female Only' | 'Any';

export interface InventoryRequirement {
  id: string;
  itemName: string;
  assignedGender: DutyGenderRequirement;
  requiredHeadcount: number;
  notes?: string;
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
