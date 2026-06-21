// Brand settings (localStorage): optional custom logos + per-bucket default hashtags.
// Fonts are intentionally NOT configurable (locked: Kalam + Poppins).
import { ASSETS } from './assets';
import { BUCKET_RULES } from './logic/mappings';
import type { Bucket } from './logic/mappings';

const KEY = 'tgs.settings.v1';

export interface Settings {
  logoColor?: string; // data URL override
  logoWhite?: string;
  bucketHashtags: Record<string, string>;
}

let cache: Settings | null = null;

export function getSettings(): Settings {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Settings) : { bucketHashtags: {} };
  } catch {
    cache = { bucketHashtags: {} };
  }
  if (!cache.bucketHashtags) cache.bucketHashtags = {};
  return cache;
}

export function saveSettings(s: Settings): void {
  cache = s;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const getLogoColor = (): string => getSettings().logoColor || ASSETS.logoColor;
export const getLogoWhite = (): string => getSettings().logoWhite || ASSETS.logoWhite;
export const getBucketHashtag = (b: Bucket): string => getSettings().bucketHashtags[b] || BUCKET_RULES[b].hashtag;
