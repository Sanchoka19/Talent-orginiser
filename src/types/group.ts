import { InventoryRequirement } from './inventory';

export interface Group {
  id: string;
  name: string;
  description: string;
  memberTalentIds: string[];
  inventoryRequirements: InventoryRequirement[];
  rotationCycleWeeks: number; // e.g. 1 week, 2 weeks
  colorAccent?: string;
  createdAt: string;
}

export interface GroupStats {
  totalMembers: number;
  maleCount: number;
  femaleCount: number;
  activeCount: number;
  restCount: number;
  sickCount: number;
}
