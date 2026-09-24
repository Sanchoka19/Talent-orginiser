import { InventoryRequirement, SpecialDutyTask } from './inventory';

export type RotationCycleType = 'every_show' | 'weekly' | 'monthly';

export interface Group {
  id: string;
  name: string;
  description: string;
  memberTalentIds: string[];
  inventoryRequirements: InventoryRequirement[];
  specialDutyTasks?: SpecialDutyTask[];
  rotationCycleWeeks: number; // e.g. 1 week, 2 weeks
  rotationCycleType?: RotationCycleType;
  fairnessPoolEnabled?: boolean;
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
