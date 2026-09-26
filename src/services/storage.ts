import { Talent, ContractRecord } from '../types/talent';
import { Group } from '../types/group';
import { HotelVenue } from '../types/venue';
import { ShowEvent } from '../types/schedule';
import { UserProfile } from '../types/user';

const TALENTS_KEY = 'talent_organizer_talents_v1';
const GROUPS_KEY = 'talent_organizer_groups_v1';
const VENUES_KEY = 'talent_organizer_venues_v1';
const SCHEDULE_KEY = 'talent_organizer_schedule_v1';
const USER_PROFILE_KEY = 'talent_organizer_user_profile_v1';

export function normalizeContractRecord(
  r: any,
  talentMeta: { id: string; firstName: string; lastName: string; primarySkill: string; avatarUrl?: string }
): ContractRecord {
  const rating = Number((r.rating ?? r.overallRating ?? 5.0).toFixed(1));
  const contractStatus: 'completed' | 'terminated' =
    r.contractStatus === 'terminated' || r.completionStatus === 'Terminated Early'
      ? 'terminated'
      : 'completed';

  let rehireStatus: 'eligible' | 'neutral' | 'do_not_rehire' = 'eligible';
  const rawRehire = String(r.rehireStatus || '').toLowerCase();
  if (rawRehire.includes('not') || rawRehire.includes('black')) {
    rehireStatus = 'do_not_rehire';
  } else if (rawRehire.includes('neutral') || rawRehire.includes('under')) {
    rehireStatus = 'neutral';
  } else {
    rehireStatus = 'eligible';
  }

  const reviewDate = r.reviewDate ?? (r.createdAt ? r.createdAt.split('T')[0] : '2026-01-01');
  const internalNote = r.internalNote ?? r.privateNote ?? '';
  const reviewedBy = r.reviewedBy ?? r.reviewerName ?? 'Art Director';

  const startDate = r.startDate || '2025-05-01';
  const endDate = r.endDate || reviewDate;

  const rawInit = String(r.initiator || '').toLowerCase();
  const initiator: 'mutual' | 'admin' | 'talent' =
    rawInit.includes('admin') || rawInit.includes('management')
      ? 'admin'
      : rawInit.includes('talent') || rawInit.includes('artist')
      ? 'talent'
      : 'mutual';

  return {
    id: r.id || `ctr-${Date.now()}`,
    talentId: r.talentId || talentMeta.id,
    talentName: r.talentName || `${talentMeta.firstName} ${talentMeta.lastName}`,
    talentRole: r.talentRole || talentMeta.primarySkill,
    avatarUrl: r.avatarUrl || talentMeta.avatarUrl,
    projectName: r.projectName || 'Show Season',
    location: r.location || 'Belek Arena, Turkey',
    period: r.period || '2025 – 2026',
    startDate,
    endDate,
    contractStatus,
    rating,
    rehireStatus,
    terminationReason: r.terminationReason,
    initiator,
    internalNote,
    reviewedBy,
    reviewDate,
    // backward compat aliases
    overallRating: rating,
    privateNote: internalNote,
    reviewerName: reviewedBy,
    createdAt: r.createdAt || `${reviewDate}T12:00:00Z`,
    completionStatus: contractStatus === 'terminated' ? 'Terminated Early' : 'Completed Successfully'
  };
}

const RAW_INITIAL_TALENTS: any[] = [
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
    rehireStatus: 'Eligible for Rehire',
    reviews: [
      {
        id: 'rev-a1',
        projectName: 'Summer Palace Gala 2025',
        location: 'Monte Carlo Grand Hall',
        period: 'ივნისი 2025 – სექტემბერი 2025',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 5 },
        overallRating: 5.0,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'საჰაერო აბრეშუმის ულამაზესი შესრულება. პუნქტუალური და დისციპლინირებული არტისტი.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2025-09-30T10:00:00Z',
        initiator: 'Mutual'
      },
      {
        id: 'rev-a2',
        projectName: 'Spring Cirque Spectacular 2026',
        location: 'Batumi Opera & Arena',
        period: 'მარტი 2026 – ივნისი 2026',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 4 },
        overallRating: 4.9,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'სოლო ნომრები უმაღლეს დონეზე. მაყურებლის ოვაციები და გუნდის სრული მხარდაჭერა.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2026-06-28T12:00:00Z',
        initiator: 'Mutual'
      }
    ],
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
    rehireStatus: 'Eligible for Rehire',
    reviews: [
      {
        id: 'rev-m1',
        projectName: 'Summer Season 2025 – Rixos Premium Belek',
        location: 'Belek Arena, Turkey',
        period: 'მაისი 2025 – ოქტ 2025',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 4 },
        overallRating: 4.8,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'გამორჩეული ფიზიკური მომზადება და საიმედოობა. აკრობატულ ნომრებში უსაფრთხოების ტექნიკას იცავს უმაღლეს დონეზე. გუნდში სარგებლობს დიდი ავტორიტეტით.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2025-10-25T14:30:00Z',
        initiator: 'Mutual'
      },
      {
        id: 'rev-m2',
        projectName: 'Winter Arena Tour 2024 – Istanbul Show',
        location: 'Istanbul Expo Arena',
        period: 'ნოემბერი 2024 – იანვარი 2025',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 4, teamwork: 5, gearCare: 5 },
        overallRating: 4.75,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'რთული საგასტროლო გრაფიკის მიუხედავად ყველა გამოსვლა ჩატარდა შეფერხების გარეშე. ინვენტარის მოვლასა და ტრანსპორტირებაში იჩენდა მაქსიმალურ ყურადღებას.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2025-01-20T11:00:00Z',
        initiator: 'Mutual'
      },
      {
        id: 'rev-m3',
        projectName: 'Spring Showcase 2024 – Antalya Colosseum',
        location: 'Antalya Amphitheatre',
        period: 'მარტი 2024 – აპრილი 2024',
        reviewType: 'Early Termination',
        terminationReason: 'Injury',
        completionStatus: 'Terminated Early',
        scores: { punctuality: 5, performance: 5, teamwork: 4, gearCare: 4 },
        overallRating: 4.5,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'რეპეტიციაზე მიღებული მხრის მსუბუქი ტრავმის გამო კონტრაქტი 2 კვირით ადრე შეწყდა ექიმის რეკომენდაციით. სრულად რეაბილიტირებულია, არანაირი დისციპლინური გადაცდომა.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2024-04-15T16:00:00Z',
        initiator: 'Artist',
        terminationDate: '2024-04-14'
      }
    ],
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
    rehireStatus: 'Eligible for Rehire',
    reviews: [
      {
        id: 'rev-s1',
        projectName: 'Solaris Cirque Troupe 2026',
        location: 'Solaris Grand Theatre, Dubai',
        period: 'მაისი 2026 – სექტემბერი 2026',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 5 },
        overallRating: 4.95,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'საუკეთესო ქორეოგრაფიული კაპიტანი. მთელი დასის კოორდინაციას უძღვებოდა უნაკლოდ.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2026-09-18T10:00:00Z',
        initiator: 'Mutual'
      },
      {
        id: 'rev-s2',
        projectName: 'Autumn Dance Gala 2025',
        location: 'Bellagio Grand Showroom, Las Vegas',
        period: 'ოქტომბერი 2025 – დეკემბერი 2025',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 4 },
        overallRating: 4.85,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'ძალიან საიმედო არტისტი, დროული და ენერგიული. მაღალი დონის სინქრონიზაცია.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2025-12-28T16:00:00Z',
        initiator: 'Mutual'
      }
    ],
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
    rehireStatus: 'Do Not Rehire',
    reviews: [
      {
        id: 'rev-v1',
        projectName: 'Urban Acrobatics Tour 2025',
        location: 'Berlin Arena Stage',
        period: 'ივნისი 2025 – აგვისტო 2025',
        reviewType: 'Early Termination',
        terminationReason: 'Discipline',
        completionStatus: 'Terminated Early',
        scores: { punctuality: 2, performance: 4, teamwork: 2, gearCare: 1 },
        overallRating: 2.25,
        rehireStatus: 'Do Not Rehire',
        privateNote: 'არ გამოცხადდა გენერალურ რეპეტიციაზე გაფრთხილების გარეშე, დააზიანა სასცენო აპარატურა და გამოიჩინა უპატივცემულობა პერსონალის მიმართ. კონტრაქტი გაუქმდა მენეჯმენტის გადაწყვეტილებით.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2025-08-12T14:00:00Z',
        initiator: 'Management',
        terminationDate: '2025-08-12'
      }
    ],
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
    status: 'Rest',
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
    rehireStatus: 'Eligible for Rehire',
    reviews: [
      {
        id: 'rev-e1',
        projectName: 'Royal Rhythmic Spectacular 2025',
        location: 'Prague Congress Centre',
        period: 'აპრილი 2025 – სექტემბერი 2025',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 4 },
        overallRating: 4.8,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'უნაკლო რიტმული გიმნასტიკა, მაღალი დონის არტისტიზმი. ინვენტარს უფრთხილდება სათუთად.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2025-09-25T11:00:00Z',
        initiator: 'Mutual'
      }
    ],
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
    status: 'Sick/Injured',
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
    rehireStatus: 'Do Not Rehire',
    reviews: [
      {
        id: 'rev-d1',
        projectName: 'Mediterranean Summer Nights 2025',
        location: 'Cyprus Royal Resort',
        period: 'ივნისი 2025 – ივლისი 2025',
        reviewType: 'Early Termination',
        terminationReason: 'Conflict',
        completionStatus: 'Terminated Early',
        scores: { punctuality: 2, performance: 3, teamwork: 1, gearCare: 3 },
        overallRating: 2.25,
        rehireStatus: 'Do Not Rehire',
        privateNote: 'სისტემატური კონფლიქტი ხმის რეჟისორთან და კოლეგებთან. უარი განაცხადა შოუს დასკვნით ნომერში გასვლაზე. კონტრაქტი გაუქმდა დისციპლინური საბჭოს გადაწყვეტილებით.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2025-07-20T17:00:00Z',
        initiator: 'Management',
        terminationDate: '2025-07-20'
      }
    ],
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
    rehireStatus: 'Eligible for Rehire',
    reviews: [
      {
        id: 'rev-k1',
        projectName: 'Moulin Cabaret Spectacular 2025',
        location: 'Warsaw Palace Stage',
        period: 'მაისი 2025 – ნოემბერი 2025',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 4 },
        overallRating: 4.85,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'საუკეთესო სინქრონიზაცია და სცენური ენერგია. ყველა მორიგეობა შესრულებულია პირნათლად.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2025-11-20T15:00:00Z',
        initiator: 'Mutual'
      },
      {
        id: 'rev-k2',
        projectName: 'Summer Festival 2024',
        location: 'Krakow Arena Stage',
        period: 'ივნისი 2024 – აგვისტო 2024',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 4, teamwork: 5, gearCare: 5 },
        overallRating: 4.7,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'ძალიან შრომისმოყვარე არტისტი. რეკომენდებულია მომავალ სეზონებზეც.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2024-08-30T10:00:00Z',
        initiator: 'Mutual'
      }
    ],
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
    rehireStatus: 'Eligible for Rehire',
    reviews: [
      {
        id: 'rev-j1',
        projectName: 'Inferno Fire & Illusion 2025',
        location: 'Milan Summer Arena',
        period: 'ივლისი 2025 – სექტემბერი 2025',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 5 },
        overallRating: 4.95,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'ცეცხლის ნომრების ოსტატური შესრულება, უსაფრთხოების სტანდარტების სრული დაცვა.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2025-09-22T19:00:00Z',
        initiator: 'Mutual'
      },
      {
        id: 'rev-j2',
        projectName: 'Pyro Carnival Gala 2024',
        location: 'Rome Olympic Village',
        period: 'ოქტომბერი 2024 – დეკემბერი 2024',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 4, gearCare: 5 },
        overallRating: 4.8,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'ინვენტარის მოვლა უმაღლეს დონეზე. მაღალი პასუხისმგებლობის გრძნობა.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2024-12-24T18:00:00Z',
        initiator: 'Mutual'
      }
    ],
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
    rehireStatus: 'Eligible for Rehire',
    reviews: [
      {
        id: 'rev-y1',
        projectName: 'Cirque Mystique 2026',
        location: 'Kyiv National Stage',
        period: 'იანვარი 2026 – მაისი 2026',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 5 },
        overallRating: 5.0,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'ფენომენალური მოქნილობა და კონტორცია. პუნქტუალურობის ეტალონი.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2026-05-15T12:00:00Z',
        initiator: 'Mutual'
      },
      {
        id: 'rev-y2',
        projectName: 'Silk Road Tour 2025',
        location: 'Tashkent Palace of Arts',
        period: 'მარტი 2025 – ივლისი 2025',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 5 },
        overallRating: 4.95,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'უმაღლესი დონის დისციპლინა და ეთიკა. გუნდის საიმედო საყრდენი.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2025-07-28T14:00:00Z',
        initiator: 'Mutual'
      }
    ],
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
    rehireStatus: 'Eligible for Rehire',
    reviews: [
      {
        id: 'rev-ar1',
        projectName: 'Solaris Cirque Troupe 2026',
        location: 'Rixos Grand Stage, Belek',
        period: 'მაისი 2026 – სექტემბერი 2026',
        reviewType: 'End of Season',
        completionStatus: 'Completed Successfully',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 4 },
        overallRating: 4.85,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'Cyr wheel-ის დინამიკური და უსაფრთხო შესრულება. ინვენტარის ტექნიკურ მდგომარეობას უვლის პროფესიონალურად.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2026-09-12T16:00:00Z',
        initiator: 'Mutual'
      },
      {
        id: 'rev-ar2',
        projectName: 'Autumn Ring Series 2024',
        location: 'Batumi Colosseum',
        period: 'სექტემბერი 2024 – ოქტომბერი 2024',
        reviewType: 'Early Termination',
        terminationReason: 'Injury',
        completionStatus: 'Terminated Early',
        scores: { punctuality: 5, performance: 5, teamwork: 5, gearCare: 4 },
        overallRating: 4.75,
        rehireStatus: 'Eligible for Rehire',
        privateNote: 'მაჯის დაჭიმულობის გამო ექიმის მითითებით 10 დღით ადრე დაასრულა გამოსვლები. უმაღლესი დონის შემსრულებელი, სრული რეკომენდაცია.',
        reviewerName: 'Sandro Chokoraia',
        createdAt: '2024-10-18T12:00:00Z',
        initiator: 'Mutual',
        terminationDate: '2024-10-18'
      }
    ],
    createdAt: '2026-01-02T13:00:00Z'
  }
];

export const INITIAL_TALENTS: Talent[] = RAW_INITIAL_TALENTS.map((t) => {
  const meta = {
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    primarySkill: t.primarySkill,
    avatarUrl: t.avatarUrl
  };
  const contractRecords: ContractRecord[] = (t.reviews || []).map((r: any) => normalizeContractRecord(r, meta));
  let rehireStatus: 'eligible' | 'neutral' | 'do_not_rehire' = 'eligible';
  const rawRehire = String(t.rehireStatus || '').toLowerCase();
  if (rawRehire.includes('not') || rawRehire.includes('black')) {
    rehireStatus = 'do_not_rehire';
  } else if (rawRehire.includes('neutral') || rawRehire.includes('under')) {
    rehireStatus = 'neutral';
  } else {
    rehireStatus = 'eligible';
  }

  return {
    ...t,
    rehireStatus,
    reviews: contractRecords
  };
});

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
    startDateTime: '2026-09-28T14:00:00',
    endDateTime: '2026-09-28T17:00:00',
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
  },
  {
    id: 'ev-4',
    title: 'Solaris: Autumn Gala',
    groupId: 'g-1',
    hotelId: 'v-1',
    startDateTime: '2026-10-04T19:30:00',
    endDateTime: '2026-10-04T22:30:00',
    lobbyTime: '18:45',
    status: 'Scheduled',
    dutyAssignments: [
      {
        requirementId: 'ir-1',
        itemName: 'Heavy Audio Rig',
        assignedGender: 'Male Only',
        requiredHeadcount: 2,
        assignedTalentIds: ['t-2', 't-4'],
        updatedAt: '2026-09-24T12:00:00Z'
      },
      {
        requirementId: 'ir-2',
        itemName: 'Costume Bags & Wardrobe',
        assignedGender: 'Female Only',
        requiredHeadcount: 2,
        assignedTalentIds: ['t-1', 't-3'],
        updatedAt: '2026-09-24T12:00:00Z'
      }
    ],
    notes: 'Autumn premier gala performance.',
    createdAt: '2026-09-20T10:00:00Z'
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
    const parsed = JSON.parse(data) as Talent[];
    const initialMap = new Map(INITIAL_TALENTS.map((t) => [t.id, t]));
    const normalized = parsed.map((t) => {
      const talentMeta = {
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        primarySkill: t.primarySkill,
        avatarUrl: t.avatarUrl
      };
      const init = initialMap.get(t.id);
      const rawReviews = (t.reviews && t.reviews.length >= (init?.reviews?.length || 0))
        ? t.reviews
        : (init?.reviews || t.reviews || []);

      const contractRecords = rawReviews.map((r: any) => normalizeContractRecord(r, talentMeta));
      return {
        ...t,
        reviews: contractRecords,
        contractExpiryDate: t.contractExpiryDate || init?.contractExpiryDate,
        rehireStatus: t.rehireStatus || (contractRecords.length > 0 ? contractRecords[0].rehireStatus : 'eligible')
      };
    });
    localStorage.setItem(TALENTS_KEY, JSON.stringify(normalized));
    return normalized;
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
    const events = JSON.parse(data) as ShowEvent[];
    let changed = false;
    let result = events.map((ev) => {
      if (ev.id === 'ev-3' && ev.startDateTime === '2026-09-26T14:00:00') {
        changed = true;
        return {
          ...ev,
          startDateTime: '2026-09-28T14:00:00',
          endDateTime: '2026-09-28T17:00:00'
        };
      }
      return ev;
    });

    if (!result.some((ev) => ev.id === 'ev-4')) {
      const ev4 = INITIAL_SCHEDULE.find((ev) => ev.id === 'ev-4');
      if (ev4) {
        result.push(ev4);
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(SCHEDULE_KEY, JSON.stringify(result));
    }
    return result;
  } catch {
    return INITIAL_SCHEDULE;
  }
}

export function saveStoredSchedule(schedule: ShowEvent[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
}

export const INITIAL_USER_PROFILE: UserProfile = {
  fullName: 'სანდრო ჩოკორაია',
  email: 'admin@artistent.com',
  phone: '+995 599 12 34 56',
  role: 'Administrator',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
};

export function getStoredUserProfile(): UserProfile {
  if (typeof window === 'undefined') return INITIAL_USER_PROFILE;
  const data = localStorage.getItem(USER_PROFILE_KEY);
  if (!data) {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(INITIAL_USER_PROFILE));
    return INITIAL_USER_PROFILE;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_USER_PROFILE;
  }
}

export function saveStoredUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

export function resetToDemoData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TALENTS_KEY, JSON.stringify(INITIAL_TALENTS));
  localStorage.setItem(GROUPS_KEY, JSON.stringify(INITIAL_GROUPS));
  localStorage.setItem(VENUES_KEY, JSON.stringify(INITIAL_VENUES));
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(INITIAL_SCHEDULE));
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(INITIAL_USER_PROFILE));
}

const TIME_FORMAT_KEY = 'talent_organizer_time_format_v1';
export type TimeFormat = '24h' | '12h';

export function getStoredTimeFormat(): TimeFormat {
  if (typeof window === 'undefined') return '24h';
  const val = localStorage.getItem(TIME_FORMAT_KEY);
  if (val === '12h' || val === '24h') return val;
  return '24h';
}

export function saveStoredTimeFormat(format: TimeFormat): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIME_FORMAT_KEY, format);
}

