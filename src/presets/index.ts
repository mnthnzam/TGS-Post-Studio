// Format presets — every layout renders at a chosen canvas size. All builder
// geometry is authored in the 1080×1350 base space and scaled to the preset.

export type PresetId = 'feed-portrait' | 'feed-square' | 'story-reel' | 'landscape';

export interface FormatPreset {
  id: PresetId;
  label: string; // display name in UI
  w: number; // canvas width px
  h: number; // canvas height px
  orientation: 'portrait' | 'landscape';
  aspectLabel: string; // e.g. "4:5", "1:1"
}

export const PRESETS: Record<PresetId, FormatPreset> = {
  'feed-portrait': { id: 'feed-portrait', label: '4:5 Feed', w: 1080, h: 1350, orientation: 'portrait', aspectLabel: '4:5' },
  'feed-square': { id: 'feed-square', label: '1:1 Square', w: 1080, h: 1080, orientation: 'portrait', aspectLabel: '1:1' },
  'story-reel': { id: 'story-reel', label: '9:16 Story', w: 1080, h: 1920, orientation: 'portrait', aspectLabel: '9:16' },
  'landscape': { id: 'landscape', label: '16:9 Banner', w: 1920, h: 1080, orientation: 'landscape', aspectLabel: '16:9' },
};

export const PRESET_LIST: FormatPreset[] = Object.values(PRESETS);
export const DEFAULT_PRESET: PresetId = 'feed-portrait';

/** Resolve a doc's preset id to a FormatPreset, defaulting safely. */
export function presetOf(id: PresetId | undefined): FormatPreset {
  return PRESETS[id ?? DEFAULT_PRESET] ?? PRESETS[DEFAULT_PRESET];
}

/** Scale factors relative to the 1080×1350 base canvas. */
export function scaleFactors(preset: FormatPreset) {
  return {
    x: preset.w / 1080,
    y: preset.h / 1350,
  };
}

/** Pixel-rounded scale of a base value by scaleX. */
export function sx(base: number, preset: FormatPreset) {
  return Math.round(base * (preset.w / 1080));
}

/** Logo rect: always top-left, proportional to canvas width. */
export function logoRect(preset: FormatPreset) {
  const s = preset.w / 1080;
  return { x: Math.round(78 * s), y: Math.round(46 * s), w: Math.round(250 * s), h: Math.round(62 * s) };
}

// Equal corner inset for the hashtag pill: the gap from the side edge and the gap
// from the bottom edge are the SAME, so the pill tucks symmetrically into the corner.
// Scaled by the width factor S (one factor on both axes), exactly like the logo.
// Tune this single value to taste.
export const PILL_CORNER_PAD = 48;

/** Hashtag pill position: ALWAYS bottom corner of canvas, never content-relative. */
export function pillAnchor(
  preset: FormatPreset,
  side: 'left' | 'right',
  pillW: number,
  pillH: number,
): { x: number; y: number } {
  const pad = Math.round(PILL_CORNER_PAD * (preset.w / 1080));
  const y = preset.h - pillH - pad;
  const x = side === 'left' ? pad : preset.w - pad - pillW;
  return { x, y };
}
