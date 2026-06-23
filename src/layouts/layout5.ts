// Layout 5 — "Gradient Panel" (gradient top zone + light text panel bottom).
//
// Top 55% of canvas is a radial gradient zone (photo optional behind it).
// Bottom 45% is a clean light/white panel where headline and body live.
// hashtagSide defaults to 'right' (BOTTOM-RIGHT pill) — the designed position.
// headlineSize defaults to 60, bodySize defaults to 27.
//
// Colorway → gradient:
//   A  →  G04  Teal-Indigo Radial     (white panel, navy headline)
//   B  →  G07  Amber-Green Radial     (warm cream panel, green headline)
//   C  →  G13  Teal-TatvaGreen Radial (light green-tinted panel, navy headline)

import { buildLayout5Svg, L5_HEAD_MAX_W, L5_BODY_MAX_W } from '../svg/layout5';
import { wrap, measure } from '../textwrap';
import { ASSETS } from '../assets';
import { getLogoWhite } from '../settings';
import { uid } from '../model';
import { getZone } from '../presets/zones';
import { getTypeScale } from '../presets/typeScale';
import type { LayoutModule, PostDoc, BuildOpts, Rect } from '../model';
import type { FormatPreset } from '../presets/index';

export const layout5: LayoutModule = {
  id: 'L5',
  label: 'Gradient Panel',

  photoRegion(preset: FormatPreset): Rect {
    // Photo fills the gradient zone (top portion of canvas).
    const z = getZone('L5', preset.id);
    return z.photo ?? { x: 0, y: 0, w: preset.w, h: preset.h };
  },

  newDoc(): PostDoc {
    const now = Date.now();
    return {
      id: uid(),
      name: 'Untitled',
      layoutId: 'L5',
      colorway: 'A',
      headline: 'Small moments.\nBig confidence.',
      body: "Every raised hand, every shared idea — that's a child discovering what they're capable of.",
      hashtag: '#TheCuriosityLab',
      headlineSize: 60,
      bodySize: 27,
      headlineDY: 0,
      bodyDY: 0,
      hashtagSide: 'right',  // ← L5 designed position: BOTTOM-RIGHT
      photo: { src: ASSETS.lab.href, w: ASSETS.lab.w, h: ASSETS.lab.h, scale: 1, focalX: 0, focalY: 0 },
      preset: 'feed-portrait',
      photoFocalPoints: {},
      createdAt: now,
      updatedAt: now,
    };
  },

  build(doc: PostDoc, preset: FormatPreset, opts: BuildOpts = {}): string {
    const ts = getTypeScale('L5', preset.id);
    const headlineSize = Math.round(doc.headlineSize * ts.headline);
    const bodySize = Math.round(doc.bodySize * ts.body);
    const zone = getZone('L5', preset.id);
    const isLandscape = preset.orientation === 'landscape';
    const headMaxW = isLandscape ? zone.content.w - 60 : L5_HEAD_MAX_W;
    const bodyMaxW = isLandscape ? zone.content.w - 60 : L5_BODY_MAX_W;
    const headlineLines = wrap(doc.headline, `700 ${headlineSize}px Kalam`, headMaxW);
    const bodyLines = wrap(doc.body, `400 ${bodySize}px Poppins`, bodyMaxW);
    const pillTextWidth = measure(doc.hashtag, '600 19px Poppins') + 0.5 * Math.max(0, doc.hashtag.length - 1);
    const ph = doc.photo;
    const fp = doc.photoFocalPoints?.[preset.id];
    const focalX = fp?.focalX ?? ph?.focalX ?? 0;
    const focalY = fp?.focalY ?? ph?.focalY ?? 0;

    return buildLayout5Svg({
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
      // Logo always white — sits inside the dark/colourful gradient zone
      logoHref: opts.logoHref ?? getLogoWhite(),
      pillTextWidth,
      fontFaceCss: opts.fontFaceCss,
      anim: opts.anim,
    });
  },
};
