// Layout 4 — "Aurora" (gradient wash card).
//
// Gradient fills the entire canvas. No photo required.
// hashtagSide defaults to 'left' (BOTTOM-LEFT pill) — the designed position for this template.
// headlineSize defaults to 68, bodySize defaults to 27.
//
// Colorway → gradient:
//   A  →  G03  Teal-Indigo Linear
//   B  →  G06  Orange-Amber Linear
//   C  →  G14  Tatva Blue-Amber Linear

import { buildLayout4Svg, L4_HEAD_MAX_W, L4_BODY_MAX_W } from '../svg/layout4';
import { wrap, measure } from '../textwrap';
import { ASSETS } from '../assets';
import { getLogoWhite, getLogoColor } from '../settings';
import { uid } from '../model';
import { getZone } from '../presets/zones';
import { getTypeScale } from '../presets/typeScale';
import type { LayoutModule, PostDoc, BuildOpts, Rect } from '../model';
import type { FormatPreset } from '../presets/index';

export const layout4: LayoutModule = {
  id: 'L4',
  label: 'Aurora (Gradient)',

  photoRegion(preset: FormatPreset): Rect {
    // Photo appears on the right half of the canvas (optional). Return full canvas
    // so the pan/zoom overlay covers the whole image if one is added.
    const z = getZone('L4', preset.id);
    return z.photo ?? { x: 0, y: 0, w: preset.w, h: preset.h };
  },

  newDoc(): PostDoc {
    const now = Date.now();
    return {
      id: uid(),
      name: 'Untitled',
      layoutId: 'L4',
      colorway: 'A',
      headline: 'Where character\nshapes the future.',
      body: 'At Tatva, every value we teach becomes a building block for the leaders of tomorrow.',
      hashtag: '#TatvaValues',
      headlineSize: 68,
      bodySize: 27,
      headlineDY: 0,
      bodyDY: 0,
      hashtagSide: 'left',   // ← L4 designed position: BOTTOM-LEFT
      photo: { src: ASSETS.teacher.href, w: ASSETS.teacher.w, h: ASSETS.teacher.h, scale: 1, focalX: 0, focalY: 0 },
      preset: 'feed-portrait',
      photoFocalPoints: {},
      createdAt: now,
      updatedAt: now,
    };
  },

  build(doc: PostDoc, preset: FormatPreset, opts: BuildOpts = {}): string {
    const ts = getTypeScale('L4', preset.id);
    const headlineSize = Math.round(doc.headlineSize * ts.headline);
    const bodySize = Math.round(doc.bodySize * ts.body);
    const zone = getZone('L4', preset.id);
    const isLandscape = preset.orientation === 'landscape';
    const headMaxW = isLandscape ? zone.content.w - 60 : L4_HEAD_MAX_W;
    const bodyMaxW = isLandscape ? zone.content.w - 60 : L4_BODY_MAX_W;
    const headlineLines = wrap(doc.headline, `400 ${headlineSize}px DM Serif Display`, headMaxW);
    const bodyLines = wrap(doc.body, `400 ${bodySize}px DM Sans`, bodyMaxW);
    const pillTextWidth = measure(doc.hashtag, '700 19px DM Sans') + 0.5 * Math.max(0, doc.hashtag.length - 1);
    const ph = doc.photo;
    const fp = doc.photoFocalPoints?.[preset.id];
    const focalX = fp?.focalX ?? ph?.focalX ?? 0;
    const focalY = fp?.focalY ?? ph?.focalY ?? 0;

    // Logo: colorway B has a dark gradient (amber/orange on warm) → use dark logo.
    // All other colorways are dark backgrounds → white logo.
    const logoHref = opts.logoHref ?? (doc.colorway === 'B' ? getLogoColor() : getLogoWhite());

    return buildLayout4Svg({
      headlineLines,
      bodyLines,
      hashtag: doc.hashtag,
      colorway: doc.colorway,
      preset,
      photoHref: ph ? (opts.photoHref ?? ph.src) : undefined,
      photoW: ph?.w,
      photoH: ph?.h,
      scale: ph?.scale ?? 1,
      focalX,
      focalY,
      headlineSize,
      bodySize,
      headlineDY: doc.headlineDY,
      bodyDY: doc.bodyDY,
      hashtagSide: doc.hashtagSide,
      logoHref,
      pillTextWidth,
      fontFaceCss: opts.fontFaceCss,
      anim: opts.anim,
    });
  },
};
