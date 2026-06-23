import { buildLayout1Svg } from '../svg/layout1';
import { wrap, measure } from '../textwrap';
import { ASSETS } from '../assets';
import { getLogoColor } from '../settings';
import { uid } from '../model';
import { getZone } from '../presets/zones';
import { getTypeScale } from '../presets/typeScale';
import type { LayoutModule, PostDoc, BuildOpts, Rect } from '../model';
import type { FormatPreset } from '../presets/index';

const MAX_W = 852; // portrait-family text column (canvas width is always 1080)

export const layout1: LayoutModule = {
  id: 'L1',
  label: 'Teacher Story',

  photoRegion(preset: FormatPreset): Rect {
    const z = getZone('L1', preset.id);
    return z.photo ?? { x: 0, y: 0, w: preset.w, h: preset.h };
  },

  newDoc(): PostDoc {
    const now = Date.now();
    return {
      id: uid(),
      name: 'Untitled',
      layoutId: 'L1',
      colorway: 'A',
      headline: 'Great futures begin with\ngreat guidance.',
      body: 'Our teachers light the path to excellence.\nOne lesson, one conversation,\none breakthrough at a time.',
      hashtag: '#TheCuriosityLab',
      headlineSize: 66,
      bodySize: 27,
      headlineDY: 0,
      bodyDY: 0,
      hashtagSide: 'left',
      photo: { src: ASSETS.teacher.href, w: ASSETS.teacher.w, h: ASSETS.teacher.h, scale: 1, focalX: 0, focalY: -346 },
      preset: 'feed-portrait',
      photoFocalPoints: {},
      createdAt: now,
      updatedAt: now,
    };
  },

  build(doc: PostDoc, preset: FormatPreset, opts: BuildOpts = {}): string {
    // Portrait family shares width 1080 → keep original wrap width (no reflow of
    // existing posts). Landscape has a different content width → derive from zone.
    // type scales per layout/preset (feed-portrait = 1.0); applied before wrapping
    const ts = getTypeScale('L1', preset.id);
    const headlineSize = Math.round(doc.headlineSize * ts.headline);
    const bodySize = Math.round(doc.bodySize * ts.body);
    const zone = getZone('L1', preset.id);
    const maxW = preset.orientation === 'landscape' ? zone.content.w - 60 : MAX_W;
    const headlineLines = wrap(doc.headline, `700 ${headlineSize}px Kalam`, maxW);
    const bodyLines = wrap(doc.body, `400 ${bodySize}px Poppins`, maxW);
    // include letter-spacing (0.5px between glyphs) so the pill width is exact
    const pillTextWidth = measure(doc.hashtag, '600 20px Poppins') + 0.5 * Math.max(0, doc.hashtag.length - 1);
    const ph = doc.photo;
    // per-preset focal point falls back to the photo's own focal, then the layout default
    const fp = doc.photoFocalPoints?.[preset.id];
    const focalX = fp?.focalX ?? ph?.focalX ?? 0;
    const focalY = fp?.focalY ?? ph?.focalY ?? -346;
    return buildLayout1Svg({
      headlineLines,
      bodyLines,
      hashtag: doc.hashtag,
      colorway: doc.colorway,
      preset,
      photoHref: opts.photoHref ?? ph?.src ?? ASSETS.teacher.href,
      photoW: ph?.w ?? ASSETS.teacher.w,
      photoH: ph?.h ?? ASSETS.teacher.h,
      scale: ph?.scale ?? 1,
      focalX,
      focalY,
      headlineSize,
      bodySize,
      headlineDY: doc.headlineDY,
      bodyDY: doc.bodyDY,
      hashtagSide: doc.hashtagSide,
      logoHref: opts.logoHref ?? getLogoColor(),
      pillTextWidth,
      fontFaceCss: opts.fontFaceCss,
      anim: opts.anim,
    });
  },
};
