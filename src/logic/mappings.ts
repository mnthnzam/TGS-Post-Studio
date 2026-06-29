// Content-bucket → layout / colorway / hashtag mappings.
// Source of truth: TGS_Design_System_v1.md §11 (mapping) and §12 (hashtags).
import type { LayoutId, ColorwayId } from '../types';

export type Bucket =
  | 'Tatva Pulse'
  | "Director's Desk"
  | 'Teacher Craft'
  | 'Stakeholder Voices'
  | 'Curiosity Lab'
  | 'Activities & Experiential'
  | 'Beyond the Chalkboard'
  | 'Four Cs in Action'
  | 'Values-Based'
  | 'Farm → Future'
  | 'Sports & Wellbeing'
  | 'Culture Code'
  | 'Alumni Echo'
  | 'Micro-Wins';

interface BucketRule {
  layout: LayoutId;
  colorway: ColorwayId;
  hashtag: string;
}

// §11 default layout + preferred colorway, §12 hashtag.
// Where §11 lists two layouts, the first is used as default.
export const BUCKET_RULES: Record<Bucket, BucketRule> = {
  'Tatva Pulse': { layout: 'L1', colorway: 'A', hashtag: '#TatvaPulse' },
  "Director's Desk": { layout: 'L1', colorway: 'A', hashtag: '#DirectorsDesk' },
  'Teacher Craft': { layout: 'L1', colorway: 'B', hashtag: '#TatvaPulse' },
  'Stakeholder Voices': { layout: 'L1', colorway: 'A', hashtag: '#TatvaPulse' },
  'Curiosity Lab': { layout: 'L2', colorway: 'A', hashtag: '#TheCuriosityLab' },
  'Activities & Experiential': { layout: 'L2', colorway: 'B', hashtag: '#TheCuriosityLab' },
  'Beyond the Chalkboard': { layout: 'L2', colorway: 'C', hashtag: '#BeyondTheChalkboard' },
  'Four Cs in Action': { layout: 'L2', colorway: 'A', hashtag: '#TheCuriosityLab' },
  'Values-Based': { layout: 'L3', colorway: 'B', hashtag: '#RootedInValues' },
  'Farm → Future': { layout: 'L3', colorway: 'B', hashtag: '#FarmToFuture' },
  'Sports & Wellbeing': { layout: 'L3', colorway: 'C', hashtag: '#TatvaAthletes' },
  'Culture Code': { layout: 'L3', colorway: 'A', hashtag: '#CultureCode' },
  'Alumni Echo': { layout: 'L1', colorway: 'A', hashtag: '#AlumniEcho' },
  'Micro-Wins': { layout: 'L2', colorway: 'C', hashtag: '#TatvaMicroWins' },
};

export const BUCKETS = Object.keys(BUCKET_RULES) as Bucket[];

export const defaultLayout = (b: Bucket): LayoutId => BUCKET_RULES[b].layout;
export const preferredColorway = (b: Bucket): ColorwayId => BUCKET_RULES[b].colorway;
export const hashtagFor = (b: Bucket): string => BUCKET_RULES[b].hashtag;
