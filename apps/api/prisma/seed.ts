import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting ArtistePulse / Talent Organizer Database Seed...');

  // 1. Create or Find Default Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'artistepulse-global' },
    update: {},
    create: {
      name: 'ArtistePulse Global / Solaris Productions',
      slug: 'artistepulse-global',
      logoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
    },
  });
  console.log(`✅ Organization created/verified: ${org.name} (${org.id})`);

  // 2. Create Roles
  const managementRole = await prisma.role.upsert({
    where: {
      organizationId_key: {
        organizationId: org.id,
        key: 'management',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      key: 'management',
      title: 'Management',
      badge: 'მენეჯმენტი',
      badgeColor: '#0891B2',
      description: 'Show planning, talent management and duty rotation controls',
      permissions: [
        'talents:view',
        'talents:edit',
        'talents:delete',
        'schedule:view',
        'schedule:book',
        'schedule:cancel',
        'groups:manage',
        'duty:view',
        'duty:override',
        'attendance:mark',
      ],
      isSystem: true,
    },
  });

  const operationsRole = await prisma.role.upsert({
    where: {
      organizationId_key: {
        organizationId: org.id,
        key: 'operations',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      key: 'operations',
      title: 'Operations',
      badge: 'საოპერაციო მართვა',
      badgeColor: '#F59E0B',
      description: 'Field operations, duty shift views, and attendance verification',
      permissions: [
        'talents:view',
        'schedule:view',
        'duty:view',
        'attendance:mark',
      ],
      isSystem: true,
    },
  });
  console.log('✅ Roles created/verified: Management, Operations');

  // 3. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: org.id,
        email: 'admin@artistent.com',
      },
    },
    update: {
      roleId: managementRole.id,
    },
    create: {
      organizationId: org.id,
      email: 'admin@artistent.com',
      fullName: 'Sandro Chokoraia',
      phone: '+995 599 12 34 56',
      roleId: managementRole.id,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Admin user created/verified: ${adminUser.fullName}`);

  // 4. Seed Venues
  const venuesData = [
    {
      name: 'The Venetian Resort & Casino',
      address: '3355 S Las Vegas Blvd',
      city: 'Las Vegas',
      country: 'United States',
      contactName: 'Victoria Sterling',
      contactPhone: '+1 (702) 555-0192',
      contactEmail: 'vsterling@venetianlv.com',
      roomOrBallroom: 'Palazzo Grand Stage',
      travelTimeMinutes: 45,
      photoUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
      notes: 'High ceiling (24ft) suitable for aerial silks and truss rigging. Loading dock bay 4.',
    },
    {
      name: 'Bellagio Resort & Casino',
      address: '3600 S Las Vegas Blvd',
      city: 'Las Vegas',
      country: 'United States',
      contactName: 'Marcus Hayes',
      contactPhone: '+1 (702) 555-8321',
      contactEmail: 'mhayes@bellagiomgm.com',
      roomOrBallroom: 'Fontana Proscenium Theatre',
      travelTimeMinutes: 60,
      photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
      notes: 'Full proscenium stage with hydraulic orchestra pit and automated lighting grid.',
    },
    {
      name: 'MGM Grand Garden Arena',
      address: '3799 S Las Vegas Blvd',
      city: 'Las Vegas',
      country: 'United States',
      contactName: 'Elena Rostova',
      contactPhone: '+1 (702) 555-4491',
      contactEmail: 'erostova@mgmgrand.com',
      roomOrBallroom: 'Grand Arena Floor',
      travelTimeMinutes: 90,
      photoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
      notes: 'Large 12,000 seat arena for grand tour openers and festival headliners.',
    },
  ];

  const createdVenues = [];
  for (const v of venuesData) {
    const venue = await prisma.hotelVenue.create({
      data: {
        organizationId: org.id,
        ...v,
      },
    });
    createdVenues.push(venue);
  }
  console.log(`✅ Created ${createdVenues.length} hotel/arena venues`);

  // 5. Seed Talents
  const talentsData = [
    {
      firstName: 'Amélie',
      lastName: 'Laurent',
      email: 'amelie.laurent@artistent.com',
      phone: '+33 6 12 34 56 78',
      gender: 'FEMALE' as const,
      heightCm: 168,
      weightKg: 54,
      status: 'ACTIVE' as const,
      primarySkill: 'Aerialist & Silk Performer',
      secondarySkills: ['Contortion', 'Lyrical Dance'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      notes: 'Lead soloist for aerial silks and lyra ring acts.',
      rehireStatus: 'ELIGIBLE' as const,
      documents: [
        {
          name: 'US P-1 Entertainment Visa',
          type: 'VISA' as const,
          fileSize: '1.4 MB',
          expiryDate: new Date('2027-11-30'),
          url: 'https://storage.artistent.com/docs/amelie_visa.pdf',
        },
        {
          name: 'International Passport (FR)',
          type: 'PASSPORT' as const,
          fileSize: '3.2 MB',
          expiryDate: new Date('2029-05-12'),
          url: 'https://storage.artistent.com/docs/amelie_passport.pdf',
        },
      ],
      contracts: [
        {
          projectName: 'Summer Palace Gala 2025',
          location: 'Monte Carlo Grand Hall',
          period: 'June 2025 – September 2025',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-09-30'),
          contractStatus: 'COMPLETED' as const,
          rating: 5.0,
          rehireStatus: 'ELIGIBLE' as const,
          internalNote: 'Flawless aerial silks performance. Highly disciplined and punctual artist.',
          reviewType: 'END_OF_SEASON' as const,
          scorePunctuality: 5,
          scorePerformance: 5,
          scoreTeamwork: 5,
          scoreGearCare: 5,
        },
      ],
    },
    {
      firstName: 'Mateo',
      lastName: 'Silva',
      email: 'mateo.silva@artistent.com',
      phone: '+1 (702) 555-0144',
      gender: 'MALE' as const,
      heightCm: 184,
      weightKg: 82,
      status: 'ACTIVE' as const,
      primarySkill: 'Acrobatic Base & Porter',
      secondarySkills: ['Hand-to-Hand', 'Fire Staff'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      notes: 'Certified acrobatic porter capable of heavy lifts.',
      rehireStatus: 'ELIGIBLE' as const,
      documents: [
        {
          name: 'Passport (BR)',
          type: 'PASSPORT' as const,
          fileSize: '2.8 MB',
          expiryDate: new Date('2028-09-20'),
          url: 'https://storage.artistent.com/docs/mateo_passport.pdf',
        },
      ],
      contracts: [
        {
          projectName: 'Summer Season 2025 – Rixos Premium Belek',
          location: 'Belek Arena, Turkey',
          period: 'May 2025 – October 2025',
          startDate: new Date('2025-05-01'),
          endDate: new Date('2025-10-31'),
          contractStatus: 'COMPLETED' as const,
          rating: 4.8,
          rehireStatus: 'ELIGIBLE' as const,
          internalNote: 'Exceptional physical conditioning and reliability on stage lifts.',
          reviewType: 'END_OF_SEASON' as const,
          scorePunctuality: 5,
          scorePerformance: 5,
          scoreTeamwork: 5,
          scoreGearCare: 4,
        },
      ],
    },
    {
      firstName: 'Sofia',
      lastName: 'Chen',
      email: 'sofia.chen@artistent.com',
      phone: '+1 (702) 555-0177',
      gender: 'FEMALE' as const,
      heightCm: 165,
      weightKg: 52,
      status: 'ACTIVE' as const,
      primarySkill: 'Contemporary & Jazz Dancer',
      secondarySkills: ['Tap Dance', 'Backing Vocalist'],
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      notes: 'Solo dancer with aerial lyra ring training.',
      rehireStatus: 'ELIGIBLE' as const,
      documents: [],
      contracts: [],
    },
    {
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@artistent.com',
      phone: '+1 (702) 555-0188',
      gender: 'MALE' as const,
      heightCm: 180,
      weightKg: 78,
      status: 'ACTIVE' as const,
      primarySkill: 'Breakdancer & Acrobat',
      secondarySkills: ['Parkour', 'Cyr Wheel'],
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      notes: 'Dynamic power-mover and stage technician.',
      rehireStatus: 'ELIGIBLE' as const,
      documents: [],
      contracts: [],
    },
    {
      firstName: 'Elena',
      lastName: 'Morales',
      email: 'elena.morales@artistent.com',
      phone: '+34 6 12 34 56 78',
      gender: 'FEMALE' as const,
      heightCm: 172,
      weightKg: 57,
      status: 'ACTIVE' as const,
      primarySkill: 'Flamenco & Fusion Dancer',
      secondarySkills: ['Castanets', 'Choreography'],
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      notes: 'Lead choreographer assistant and dancer.',
      rehireStatus: 'ELIGIBLE' as const,
      documents: [],
      contracts: [],
    },
    {
      firstName: 'Dmitri',
      lastName: 'Volkov',
      email: 'dmitri.volkov@artistent.com',
      phone: '+1 (702) 555-0166',
      gender: 'MALE' as const,
      heightCm: 188,
      weightKg: 86,
      status: 'ACTIVE' as const,
      primarySkill: 'Hand Balancer & Gymnast',
      secondarySkills: ['Straps', 'Chinese Pole'],
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      notes: 'Master hand-balancing on canes.',
      rehireStatus: 'ELIGIBLE' as const,
      documents: [],
      contracts: [],
    },
  ];

  const createdTalents = [];
  for (const t of talentsData) {
    const { documents, contracts, ...talentFields } = t;
    const talent = await prisma.talent.create({
      data: {
        organizationId: org.id,
        ...talentFields,
        documents: {
          create: documents,
        },
        contracts: {
          create: contracts.map((c) => ({
            ...c,
            reviewedById: adminUser.id,
          })),
        },
      },
    });
    createdTalents.push(talent);
  }
  console.log(`✅ Created ${createdTalents.length} talent profiles with documents and contract reviews`);

  // 6. Seed Groups
  const solTroupe = await prisma.group.create({
    data: {
      organizationId: org.id,
      name: 'Solaris Cirque Troupe',
      description: 'High-altitude acrobatic, aerial silk, and contemporary dance spectacular.',
      colorAccent: '#FF6C41',
      rotationCycleWeeks: 1,
      rotationCycleType: 'WEEKLY',
      fairnessPoolEnabled: true,
      members: {
        create: createdTalents.map((t) => ({
          talentId: t.id,
        })),
      },
      requirements: {
        create: [
          {
            organizationId: org.id,
            itemName: 'Heavy Audio Rig',
            category: 'INVENTORY',
            assignedGender: 'MALE_ONLY',
            requiredHeadcount: 2,
            notes: 'Main PA speakers, subwoofers, and heavy stage amplifiers',
            rotationCycle: 'EVERY_SHOW',
          },
          {
            organizationId: org.id,
            itemName: 'Costume Bags & Wardrobe',
            category: 'INVENTORY',
            assignedGender: 'FEMALE_ONLY',
            requiredHeadcount: 2,
            notes: 'Quick-change racks, headpieces, and delicate sequin garments',
            rotationCycle: 'EVERY_SHOW',
          },
          {
            organizationId: org.id,
            itemName: 'Lighting Truss & Cables',
            category: 'INVENTORY',
            assignedGender: 'ANY',
            requiredHeadcount: 2,
            notes: 'Moving head spotlights, DMX cable snakes, and safety tethers',
            rotationCycle: 'EVERY_SHOW',
          },
        ],
      },
    },
    include: {
      requirements: true,
    },
  });
  console.log(`✅ Created Troupe: ${solTroupe.name} with ${createdTalents.length} members and 3 requirements`);

  // 7. Seed Initial Show Event
  const showDate = new Date();
  showDate.setDate(showDate.getDate() + 3);
  showDate.setHours(19, 0, 0, 0);

  const showEndDate = new Date(showDate);
  showEndDate.setHours(22, 30, 0, 0);

  const show = await prisma.showEvent.create({
    data: {
      organizationId: org.id,
      groupId: solTroupe.id,
      hotelId: createdVenues[0].id,
      title: 'Solaris: Golden Odyssey Premiere',
      startDateTime: showDate,
      endDateTime: showEndDate,
      lobbyTime: '18:15',
      status: 'SCHEDULED',
      notes: 'Grand Season Opening at The Venetian Resort',
    },
  });

  // Attach sample duties to this premiere
  for (const req of solTroupe.requirements) {
    const assignedTalents =
      req.assignedGender === 'MALE_ONLY'
        ? createdTalents.filter((t) => t.gender === 'MALE').slice(0, req.requiredHeadcount)
        : req.assignedGender === 'FEMALE_ONLY'
        ? createdTalents.filter((t) => t.gender === 'FEMALE').slice(0, req.requiredHeadcount)
        : createdTalents.slice(0, req.requiredHeadcount);

    await prisma.dutyAssignment.create({
      data: {
        showEventId: show.id,
        requirementId: req.id,
        itemName: req.itemName,
        category: req.category,
        assignedGender: req.assignedGender,
        requiredHeadcount: req.requiredHeadcount,
        assignedTalents: {
          create: assignedTalents.map((t) => ({
            talentId: t.id,
            attendance: 'PRESENT',
          })),
        },
      },
    });

    await prisma.dutyShiftLedger.createMany({
      data: assignedTalents.map((t) => ({
        organizationId: org.id,
        showEventId: show.id,
        groupId: solTroupe.id,
        talentId: t.id,
        requirementId: req.id,
        cyclePeriodKey: `${showDate.getFullYear()}-C38_W1`,
        isManualOverride: false,
        attendance: 'PRESENT',
      })),
    });
  }

  console.log(`✅ Scheduled Premiere Show: ${show.title} with duty assignments and ledger entries`);
  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
