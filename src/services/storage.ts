import { Talent } from '../types/talent';
import { Group } from '../types/group';
import { HotelVenue } from '../types/venue';
import { ShowEvent } from '../types/schedule';

const TALENTS_KEY = 'talent_organizer_talents_v1';
const GROUPS_KEY = 'talent_organizer_groups_v1';
const VENUES_KEY = 'talent_organizer_venues_v1';
const SCHEDULE_KEY = 'talent_organizer_schedule_v1';

export const INITIAL_TALENTS: Talent[] = [
  {
    id: 't-1',
    firstName: 'Amélie',
    lastName: 'Laurent',
    email: 'amelie.laurent@artistent.com',
    phone: '+33 6 12 34 56 78',
    gender: 'Female',
    heightCm: 168,
    weightKg: 54,
    status: 'Active',
    primarySkill: 'Aerialist & Silk Performer',
    secondarySkills: ['Contortion', 'Lyrical Dance'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    documents: [
      {
        id: 'doc-1',
        name: 'US P-1 Entertainment Visa',
        type: 'Visa',
        fileSize: '1.4 MB',
        expiryDate: '2027-11-30',
        uploadedAt: '2026-01-15'
      },
      {
        id: 'doc-2',
        name: 'International Passport (FR)',
        type: 'Passport',
        fileSize: '3.2 MB',
        expiryDate: '2029-05-12',
        uploadedAt: '2026-01-10'
      },
      {
        id: 'doc-3',
        name: 'Aerial Rigging Safety Clearance',
        type: 'Medical',
        fileSize: '820 KB',
        expiryDate: '2027-02-18',
        uploadedAt: '2026-02-18'
      }
    ],
    notes: 'Lead soloist for aerial silks and lyra ring acts.',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 't-2',
    firstName: 'Mateo',
    lastName: 'Silva',
    email: 'mateo.silva@artistent.com',
    phone: '+1 (702) 555-0144',
    gender: 'Male',
    heightCm: 184,
    weightKg: 82,
    status: 'Active',
    primarySkill: 'Acrobatic Base & Porter',
    secondarySkills: ['Hand-to-Hand', 'Fire Staff'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    documents: [
      {
        id: 'doc-4',
        name: 'Passport (BR)',
        type: 'Passport',
        fileSize: '2.8 MB',
        expiryDate: '2028-09-20',
        uploadedAt: '2026-01-11'
      },
      {
        id: 'doc-5',
        name: 'P-1 Performance Visa',
        type: 'Visa',
        fileSize: '1.2 MB',
        expiryDate: '2027-08-14',
        uploadedAt: '2026-01-12'
      }
    ],
    notes: 'Certified acrobatic porter capable of heavy lifts.',
    createdAt: '2026-01-11T11:00:00Z'
  },
  {
    id: 't-3',
    firstName: 'Sofia',
    lastName: 'Chen',
    email: 'sofia.chen@artistent.com',
    phone: '+1 (702) 555-0177',
    gender: 'Female',
    heightCm: 165,
    weightKg: 52,
    status: 'Active',
    primarySkill: 'Contemporary & Jazz Dancer',
    secondarySkills: ['Tap Dance', 'Backing Vocalist'],
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    documents: [
      {
        id: 'doc-6',
        name: 'US Passport',
        type: 'Passport',
        fileSize: '2.1 MB',
        expiryDate: '2031-03-25',
        uploadedAt: '2026-01-08'
      }
    ],
    notes: 'Dance captain for ensemble numbers.',
    createdAt: '2026-01-08T09:30:00Z'
  },
  {
    id: 't-4',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@artistent.com',
    phone: '+1 (702) 555-0199',
    gender: 'Male',
    heightCm: 188,
    weightKg: 80,
    status: 'Active',
    primarySkill: 'Breakdancer & Tumbler',
    secondarySkills: ['Parkour', 'Capoeira'],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    documents: [
      {
        id: 'doc-7',
        name: 'State ID Card',
        type: 'ID Card',
        fileSize: '950 KB',
        expiryDate: '2028-06-19',
        uploadedAt: '2026-01-05'
      }
    ],
    notes: 'High-energy b-boy stunts and floor work.',
    createdAt: '2026-01-05T14:00:00Z'
  },
  {
    id: 't-5',
    firstName: 'Elena',
    lastName: 'Kovaleva',
    email: 'elena.kovaleva@artistent.com',
    phone: '+1 (702) 555-0211',
    gender: 'Female',
    heightCm: 172,
    weightKg: 56,
    status: 'Rest', // On scheduled rest! Should be excluded from duty assignment!
    primarySkill: 'Rhythmic Gymnast & Hoop Artist',
    secondarySkills: ['Ballet', 'Ribbon Specialist'],
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    documents: [
      {
        id: 'doc-8',
        name: 'Passport (CZ)',
        type: 'Passport',
        fileSize: '3.0 MB',
        expiryDate: '2029-01-14',
        uploadedAt: '2026-01-12'
      }
    ],
    notes: 'Scheduled recovery week after high-intensity festival tour.',
    createdAt: '2026-01-12T15:00:00Z'
  },
  {
    id: 't-6',
    firstName: 'Darius',
    lastName: 'King',
    email: 'darius.king@artistent.com',
    phone: '+1 (702) 555-0233',
    gender: 'Male',
    heightCm: 182,
    weightKg: 78,
    status: 'Sick/Injured', // Injured! Strictly excluded from duty assignment!
    primarySkill: 'Lead Soul Vocalist',
    secondarySkills: ['Acoustic Guitar', 'Show MC'],
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    documents: [
      {
        id: 'doc-9',
        name: 'Medical Leave Certificate - Ankle Sprain',
        type: 'Medical',
        fileSize: '1.1 MB',
        expiryDate: '2026-10-05',
        uploadedAt: '2026-09-18'
      }
    ],
    notes: 'Grade 1 ankle strain during rehearsal. Expected clearance Oct 5.',
    createdAt: '2026-01-04T12:00:00Z'
  },
  {
    id: 't-7',
    firstName: 'Ksenia',
    lastName: 'Bator',
    email: 'ksenia.bator@artistent.com',
    phone: '+1 (702) 555-0255',
    gender: 'Female',
    heightCm: 170,
    weightKg: 55,
    status: 'Active',
    primarySkill: 'Commercial Jazz Dancer',
    secondarySkills: ['Heels Choreography', 'Vocal Backing'],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    documents: [
      {
        id: 'doc-10',
        name: 'Passport (PL)',
        type: 'Passport',
        fileSize: '2.4 MB',
        expiryDate: '2030-07-22',
        uploadedAt: '2026-01-14'
      }
    ],
    notes: 'Lead synchronization dancer.',
    createdAt: '2026-01-14T10:30:00Z'
  },
  {
    id: 't-8',
    firstName: 'Julian',
    lastName: 'Rossi',
    email: 'julian.rossi@artistent.com',
    phone: '+1 (702) 555-0288',
    gender: 'Male',
    heightCm: 180,
    weightKg: 76,
    status: 'Active',
    primarySkill: 'Fire Manipulator & Juggler',
    secondarySkills: ['Stilt Walker', 'LED Poi'],
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    documents: [
      {
        id: 'doc-11',
        name: 'Pyrotechnic Operator License',
        type: 'Other',
        fileSize: '1.6 MB',
        expiryDate: '2027-04-30',
        uploadedAt: '2026-02-01'
      }
    ],
    notes: 'Certified for indoor pyrotechnics and safe flame equipment handling.',
    createdAt: '2026-01-09T16:00:00Z'
  },
  {
    id: 't-9',
    firstName: 'Yulia',
    lastName: 'Polishchuk',
    email: 'yulia.p@artistent.com',
    phone: '+1 (702) 555-0299',
    gender: 'Female',
    heightCm: 167,
    weightKg: 51,
    status: 'Active',
    primarySkill: 'Contortion & Hand Balance',
    secondarySkills: ['Aerial Hoop', 'Modern Dance'],
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    documents: [
      {
        id: 'doc-12',
        name: 'Passport (UA)',
        type: 'Passport',
        fileSize: '3.1 MB',
        expiryDate: '2029-10-18',
        uploadedAt: '2026-01-18'
      }
    ],
    notes: 'Feature soloist for center stage contortion pedestal.',
    createdAt: '2026-01-18T11:00:00Z'
  },
  {
    id: 't-10',
    firstName: 'Arsen',
    lastName: 'Yatsenko',
    email: 'arsen.y@artistent.com',
    phone: '+1 (702) 555-0311',
    gender: 'Male',
    heightCm: 185,
    weightKg: 79,
    status: 'Active',
    primarySkill: 'Cyr Wheel & Acrobatic Flyer',
    secondarySkills: ['Aerial Straps', 'Trampoline'],
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    documents: [
      {
        id: 'doc-13',
        name: 'Performance Contract 2026-2027',
        type: 'Contract',
        fileSize: '4.5 MB',
        expiryDate: '2027-12-31',
        uploadedAt: '2026-01-02'
      }
    ],
    notes: 'Dynamic Cyr wheel artist and strap flyer.',
    createdAt: '2026-01-02T13:00:00Z'
  }
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'g-1',
    name: 'Solaris Cirque Troupe',
    description: 'High-altitude acrobatic, aerial silk, and contemporary dance spectacular.',
    memberTalentIds: ['t-1', 't-2', 't-3', 't-4', 't-5', 't-6', 't-7', 't-8', 't-9', 't-10'],
    inventoryRequirements: [
      {
        id: 'ir-1',
        itemName: 'Heavy Audio Rig',
        assignedGender: 'Male Only',
        requiredHeadcount: 2,
        notes: 'Main PA speakers, subwoofers, and heavy stage amplifiers'
      },
      {
        id: 'ir-2',
        itemName: 'Costume Bags & Wardrobe',
        assignedGender: 'Female Only',
        requiredHeadcount: 2,
        notes: 'Quick-change racks, headpieces, and delicate sequin garments'
      },
      {
        id: 'ir-3',
        itemName: 'Lighting Truss & Cables',
        assignedGender: 'Any',
        requiredHeadcount: 2,
        notes: 'Moving head spotlights, DMX cable snakes, and safety tethers'
      }
    ],
    rotationCycleWeeks: 1,
    colorAccent: '#FF6C41',
    createdAt: '2026-01-15T12:00:00Z'
  },
  {
    id: 'g-2',
    name: 'Vegas Rhythm Dancers',
    description: 'Dynamic commercial dance ensemble performing synchronized jazz, hip-hop, and tap.',
    memberTalentIds: ['t-3', 't-4', 't-7', 't-8', 't-9', 't-10'],
    inventoryRequirements: [
      {
        id: 'ir-4',
        itemName: 'Stage Wardrobe & Quick-Change Props',
        assignedGender: 'Any',
        requiredHeadcount: 2,
        notes: 'Quick costume changes, glitter coats, and cane props'
      },
      {
        id: 'ir-5',
        itemName: 'Floor Mats & Springboard Setup',
        assignedGender: 'Male Only',
        requiredHeadcount: 1,
        notes: 'Acrobatic landing safety cushions'
      }
    ],
    rotationCycleWeeks: 2,
    colorAccent: '#004F72',
    createdAt: '2026-02-01T10:00:00Z'
  }
];

export const INITIAL_VENUES: HotelVenue[] = [
  {
    id: 'v-1',
    name: 'The Venetian Resort & Casino',
    address: '3355 S Las Vegas Blvd',
    city: 'Las Vegas',
    country: 'United States',
    contactName: 'Victoria Sterling',
    contactPhone: '+1 (702) 555-0192',
    contactEmail: 'vsterling@venetianlv.com',
    travelTimeMinutes: 45,
    notes: 'High ceiling (24ft) suitable for aerial silks and truss rigging. Loading dock bay 4.',
    createdAt: '2026-01-05T08:00:00Z'
  },
  {
    id: 'v-2',
    name: 'Bellagio Resort & Casino',
    address: '3600 S Las Vegas Blvd',
    city: 'Las Vegas',
    country: 'United States',
    contactName: 'Marcus Hayes',
    contactPhone: '+1 (702) 555-8321',
    contactEmail: 'mhayes@bellagiomgm.com',
    travelTimeMinutes: 60,
    notes: 'Full proscenium stage with hydraulic orchestra pit and automated lighting grid.',
    createdAt: '2026-01-06T09:00:00Z'
  },
  {
    id: 'v-3',
    name: 'MGM Grand Garden Arena',
    address: '3799 S Las Vegas Blvd',
    city: 'Las Vegas',
    country: 'United States',
    contactName: 'Elena Rostova',
    contactPhone: '+1 (702) 555-4491',
    contactEmail: 'erostova@mgmgrand.com',
    travelTimeMinutes: 90,
    notes: 'Large 12,000 seat arena for grand tour openers and festival headliners.',
    createdAt: '2026-01-07T10:00:00Z'
  }
];

export const INITIAL_SCHEDULE: ShowEvent[] = [
  {
    id: 'ev-1',
    title: 'Solaris: Golden Odyssey Premiere',
    groupId: 'g-1',
    hotelId: 'v-1',
    startDateTime: '2026-09-22T19:00:00',
    endDateTime: '2026-09-22T22:30:00',
    lobbyTime: '18:15',
    status: 'Scheduled',
    dutyAssignments: [
      {
        requirementId: 'ir-1',
        itemName: 'Heavy Audio Rig',
        assignedGender: 'Male Only',
        requiredHeadcount: 2,
        assignedTalentIds: ['t-2', 't-4'], // Mateo Silva, Marcus Vance (both Active Males)
        updatedAt: '2026-09-20T10:00:00Z'
      },
      {
        requirementId: 'ir-2',
        itemName: 'Costume Bags & Wardrobe',
        assignedGender: 'Female Only',
        requiredHeadcount: 2,
        assignedTalentIds: ['t-1', 't-3'], // Amélie Laurent, Sofia Chen (both Active Females)
        updatedAt: '2026-09-20T10:00:00Z'
      },
      {
        requirementId: 'ir-3',
        itemName: 'Lighting Truss & Cables',
        assignedGender: 'Any',
        requiredHeadcount: 2,
        assignedTalentIds: ['t-8', 't-7'], // Julian Rossi, Ksenia Bator (both Active)
        updatedAt: '2026-09-20T10:00:00Z'
      }
    ],
    notes: 'VIP Gala Night with red carpet arrival and live broadcast.',
    createdAt: '2026-09-15T09:00:00Z'
  },
  {
    id: 'ev-2',
    title: 'Vegas Rhythm: Starlight Revue',
    groupId: 'g-2',
    hotelId: 'v-2',
    startDateTime: '2026-09-24T20:00:00',
    endDateTime: '2026-09-24T23:00:00',
    lobbyTime: '19:00',
    status: 'Scheduled',
    dutyAssignments: [
      {
        requirementId: 'ir-4',
        itemName: 'Stage Props & Setup',
        assignedGender: 'Any',
        requiredHeadcount: 2,
        assignedTalentIds: ['t-4', 't-8'],
        updatedAt: '2026-09-20T11:00:00Z'
      },
      {
        requirementId: 'ir-5',
        itemName: 'Costume Bags & Wardrobe',
        assignedGender: 'Female Only',
        requiredHeadcount: 1,
        assignedTalentIds: ['t-7'],
        updatedAt: '2026-09-20T11:00:00Z'
      }
    ],
    notes: 'Corporate private event for International Tourism Summit.',
    createdAt: '2026-09-16T10:00:00Z'
  },
  {
    id: 'ev-3',
    title: 'Solaris: Weekend Matinee',
    groupId: 'g-1',
    hotelId: 'v-1',
    startDateTime: '2026-09-26T14:00:00',
    endDateTime: '2026-09-26T17:00:00',
    lobbyTime: '13:15',
    status: 'Scheduled',
    dutyAssignments: [
      {
        requirementId: 'ir-1',
        itemName: 'Heavy Audio Rig',
        assignedGender: 'Male Only',
        requiredHeadcount: 2,
        assignedTalentIds: ['t-8', 't-10'], // Arsen & Julian - Fair rotation next in line!
        updatedAt: '2026-09-20T12:00:00Z'
      },
      {
        requirementId: 'ir-2',
        itemName: 'Costume Bags & Wardrobe',
        assignedGender: 'Female Only',
        requiredHeadcount: 2,
        assignedTalentIds: ['t-7', 't-9'], // Ksenia & Yulia - Fair rotation next in line!
        updatedAt: '2026-09-20T12:00:00Z'
      },
      {
        requirementId: 'ir-3',
        itemName: 'Lighting Truss & Cables',
        assignedGender: 'Any',
        requiredHeadcount: 2,
        assignedTalentIds: ['t-2', 't-3'],
        updatedAt: '2026-09-20T12:00:00Z'
      }
    ],
    notes: 'Family-friendly afternoon showcase.',
    createdAt: '2026-09-17T11:00:00Z'
  }
];

export function getStoredTalents(): Talent[] {
  if (typeof window === 'undefined') return INITIAL_TALENTS;
  const data = localStorage.getItem(TALENTS_KEY);
  if (!data) {
    localStorage.setItem(TALENTS_KEY, JSON.stringify(INITIAL_TALENTS));
    return INITIAL_TALENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_TALENTS;
  }
}

export function saveStoredTalents(talents: Talent[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TALENTS_KEY, JSON.stringify(talents));
}

export function getStoredGroups(): Group[] {
  if (typeof window === 'undefined') return INITIAL_GROUPS;
  const data = localStorage.getItem(GROUPS_KEY);
  if (!data) {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(INITIAL_GROUPS));
    return INITIAL_GROUPS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_GROUPS;
  }
}

export function saveStoredGroups(groups: Group[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function getStoredVenues(): HotelVenue[] {
  if (typeof window === 'undefined') return INITIAL_VENUES;
  const data = localStorage.getItem(VENUES_KEY);
  if (!data) {
    localStorage.setItem(VENUES_KEY, JSON.stringify(INITIAL_VENUES));
    return INITIAL_VENUES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_VENUES;
  }
}

export function saveStoredVenues(venues: HotelVenue[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VENUES_KEY, JSON.stringify(venues));
}

export function getStoredSchedule(): ShowEvent[] {
  if (typeof window === 'undefined') return INITIAL_SCHEDULE;
  const data = localStorage.getItem(SCHEDULE_KEY);
  if (!data) {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(INITIAL_SCHEDULE));
    return INITIAL_SCHEDULE;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SCHEDULE;
  }
}

export function saveStoredSchedule(schedule: ShowEvent[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
}

export function resetToDemoData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TALENTS_KEY, JSON.stringify(INITIAL_TALENTS));
  localStorage.setItem(GROUPS_KEY, JSON.stringify(INITIAL_GROUPS));
  localStorage.setItem(VENUES_KEY, JSON.stringify(INITIAL_VENUES));
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(INITIAL_SCHEDULE));
}

