import type { ColorwayId } from './tokens/colorways';

export type { ColorwayId };
export type LayoutId = 'L1' | 'L2' | 'L3';

export interface PhotoValue {
  src: string;
  // CSS object-position, e.g. "50% 30%". Defaults per layout focal-point guidance.
  objectPosition?: string;
}

export interface PostContent {
  layout: LayoutId;
  colorway: ColorwayId;
  headline: string; // may contain \n for line breaks
  accent?: string; // substring of headline rendered in CW_ACCENT
  body: string;
  attribution?: string; // Layout 1 only
  hashtag: string;
  boosted?: boolean;
  ctaLine?: string; // shown on boosted pills; defaults to spec value
  photo?: PhotoValue;
}
