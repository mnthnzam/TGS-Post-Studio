// Organic vs boosted post-type flags.
// Source of truth: TGS_Design_System_v1.md §13 and §6.2.
import type { Bucket } from './mappings';

export type PostType = 'organic' | 'boosted';

// Spec §6.2 CTA line (TGS domain — corrects the prototype's "tatva.kids").
export const BOOST_CTA_LINE = 'Enroll Now · tatvaglobalschool.com';

// Buckets that typically get paid boosting (§13).
export const TYPICALLY_BOOSTED: Bucket[] = [
  'Tatva Pulse',
  "Director's Desk",
  'Beyond the Chalkboard',
];

export const isTypicallyBoosted = (b: Bucket): boolean => TYPICALLY_BOOSTED.includes(b);
