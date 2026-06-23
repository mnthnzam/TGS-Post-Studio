// Per-layout, per-preset typography scale.
//
// Typography does NOT scale with raw geometry (X by S, Y by SY). A 1920-wide banner
// needs deliberately larger type, a shorter 1:1 needs slightly smaller type, and the
// right amount differs per layout (L3's display headline behaves differently from L1's
// panel copy). So each layout gets its own hand-tunable multiplier per format.
//
// feed-portrait is locked at 1.0 — it is the authored reference and must not reflow.
// The multiplier is applied to the user's authored font size BEFORE wrapping, so text
// re-wraps correctly at the new size.

import type { PresetId } from './index';

export interface TypeScale { headline: number; body: number; }

const TYPE_SCALE: Record<string, Record<PresetId, TypeScale>> = {
  // L1 — Teacher Story: headline + body live in a bottom panel.
  L1: {
    'feed-portrait': { headline: 1.0, body: 1.0 },
    'feed-square': { headline: 0.90, body: 0.94 },
    'story-reel': { headline: 1.10, body: 1.06 },
    'landscape': { headline: 1.30, body: 1.25 },
  },
  // L2 — Curiosity Lab: copy sits over a full-bleed photo + blob.
  L2: {
    'feed-portrait': { headline: 1.0, body: 1.0 },
    'feed-square': { headline: 0.92, body: 0.95 },
    'story-reel': { headline: 1.10, body: 1.06 },
    'landscape': { headline: 1.28, body: 1.24 },
  },
  // L3 — Beyond (Cutout): big display headline, smaller body.
  L3: {
    'feed-portrait': { headline: 1.0, body: 1.0 },
    'feed-square': { headline: 0.86, body: 0.92 },
    'story-reel': { headline: 1.12, body: 1.06 },
    'landscape': { headline: 1.35, body: 1.26 },
  },
};

export function getTypeScale(layoutId: string, presetId: PresetId): TypeScale {
  return TYPE_SCALE[layoutId]?.[presetId] ?? { headline: 1, body: 1 };
}
