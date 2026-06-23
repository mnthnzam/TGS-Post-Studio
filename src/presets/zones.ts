import type { PresetId } from './index';
import type { Rect } from '../model';

export interface ZoneMap {
  /**
   * Photo zone: the rect the image fills (cover crop + focal pan within this).
   * null = layout has no photo (solid BG only).
   */
  photo: Rect | null;

  /**
   * Content zone: the rect within which headline + body text flow.
   * Text wraps to contentZone.w minus internal padding.
   * The zone is a maximum boundary; a dynamic layout may shrink the panel to fit text.
   */
  content: Rect;

  /**
   * Layout direction hint for this preset on this layout.
   * 'column' = photo above content (default portrait).
   * 'side-by-side' = photo left, content right (landscape).
   */
  direction: 'column' | 'side-by-side';
}

// ─── Layout 1: Teacher Story Frame ──────────────────────────────────────────
// Portrait family: photo occupies top portion, color panel rises from bottom.
// Landscape: photo left 58%, panel right 42%.

const L1_ZONES: Record<PresetId, ZoneMap> = {
  'feed-portrait': {
    photo: { x: 54, y: 138, w: 972, h: 762 },
    content: { x: 114, y: 900, w: 852, h: 360 },
    direction: 'column',
  },
  'feed-square': {
    photo: { x: 54, y: 110, w: 972, h: 500 },
    content: { x: 114, y: 610, w: 852, h: 400 },
    direction: 'column',
  },
  'story-reel': {
    photo: { x: 54, y: 138, w: 972, h: 1100 },
    content: { x: 114, y: 1238, w: 852, h: 600 },
    direction: 'column',
  },
  'landscape': {
    photo: { x: 0, y: 0, w: 1075, h: 1080 },
    content: { x: 1130, y: 80, w: 730, h: 920 },
    direction: 'side-by-side',
  },
};

// ─── Layout 2: Curiosity Labs (full-bleed + organic blob) ───────────────────
// Photo always full-bleed behind everything. Blob + text in bottom portion.

const L2_ZONES: Record<PresetId, ZoneMap> = {
  'feed-portrait': {
    photo: { x: 0, y: 0, w: 1080, h: 1350 },
    content: { x: 54, y: 830, w: 900, h: 460 },
    direction: 'column',
  },
  'feed-square': {
    photo: { x: 0, y: 0, w: 1080, h: 1080 },
    content: { x: 54, y: 640, w: 900, h: 390 },
    direction: 'column',
  },
  'story-reel': {
    photo: { x: 0, y: 0, w: 1080, h: 1920 },
    content: { x: 54, y: 1340, w: 900, h: 520 },
    direction: 'column',
  },
  'landscape': {
    photo: { x: 0, y: 0, w: 1920, h: 1080 },
    content: { x: 54, y: 680, w: 900, h: 360 },
    direction: 'column',
  },
};

// ─── Layout 3: Beyond the Chalkboard (cutout + flower burst) ────────────────
// Solid BG color. Cutout anchored bottom-right. Headline top-left. Body mid-left.

const L3_ZONES: Record<PresetId, ZoneMap> = {
  'feed-portrait': {
    photo: { x: 260, y: 300, w: 820, h: 1050 },
    content: { x: 114, y: 200, w: 700, h: 900 },
    direction: 'column',
  },
  'feed-square': {
    photo: { x: 260, y: 100, w: 820, h: 980 },
    content: { x: 114, y: 150, w: 680, h: 720 },
    direction: 'column',
  },
  'story-reel': {
    photo: { x: 260, y: 600, w: 820, h: 1320 },
    content: { x: 114, y: 200, w: 700, h: 1100 },
    direction: 'column',
  },
  'landscape': {
    photo: { x: 1100, y: 0, w: 820, h: 1080 },
    content: { x: 80, y: 80, w: 950, h: 920 },
    direction: 'side-by-side',
  },
};

export const LAYOUT_ZONES: Record<string, Record<PresetId, ZoneMap>> = {
  L1: L1_ZONES,
  L2: L2_ZONES,
  L3: L3_ZONES,
};

export function getZone(layoutId: string, presetId: PresetId): ZoneMap {
  const zones = LAYOUT_ZONES[layoutId];
  if (!zones) throw new Error(`No zones defined for layout ${layoutId}`);
  const zone = zones[presetId];
  if (!zone) throw new Error(`No zone for layout ${layoutId} preset ${presetId}`);
  return zone;
}
