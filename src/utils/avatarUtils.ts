import { Gender } from '../types/talent';

const MALE_TOPS = 'shortCurly,shortFlat,shortRound,shortWaved,sides,theCaesar,theCaesarAndSidePart,dreads01,dreads02,frizzle,shaggy,shaggyMullet';
const FEMALE_TOPS = 'bigHair,bob,bun,curly,curvy,dreads,frida,fro,froBand,longButNotTooLong,miaWallace,straight01,straight02,straightAndStrand';
const FRIENDLY_MOUTHS = 'smile,default,twinkle';
const FRIENDLY_EYEBROWS = 'default,defaultNatural,raisedExcited,raisedExcitedNatural,flatNatural';
const FRIENDLY_EYES = 'default,happy,wink,surprised';

export interface TalentAvatarOptions {
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  gender?: Gender | string;
  id?: string;
}

/**
 * Returns the talent's avatarUrl if uploaded, or generates a gender-appropriate,
 * cheerful illustration using Dicebear Avataaars with matched male/female hairstyles,
 * facial features, and positive expressions.
 */
export function getTalentAvatar(options?: TalentAvatarOptions | null): string {
  if (!options) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=performer&top=${FEMALE_TOPS}&facialHairProbability=0&mouth=${FRIENDLY_MOUTHS}&eyebrows=${FRIENDLY_EYEBROWS}&eyes=${FRIENDLY_EYES}`;
  }

  // 1. If custom avatar uploaded, always return it
  if (options.avatarUrl && options.avatarUrl.trim()) {
    return options.avatarUrl.trim();
  }

  // 2. Determine gender (default to Female if not specified or female)
  const isMale = options.gender === 'Male';

  // 3. Build unique seed based on name or id
  const namePart = `${options.firstName || ''}${options.lastName || ''}`.trim();
  const seed = encodeURIComponent(namePart || options.id || (isMale ? 'male_performer' : 'female_performer'));

  if (isMale) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&top=${MALE_TOPS}&facialHairProbability=25&mouth=${FRIENDLY_MOUTHS}&eyebrows=${FRIENDLY_EYEBROWS}&eyes=${FRIENDLY_EYES}`;
  }

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&top=${FEMALE_TOPS}&facialHairProbability=0&mouth=${FRIENDLY_MOUTHS}&eyebrows=${FRIENDLY_EYEBROWS}&eyes=${FRIENDLY_EYES}`;
}
