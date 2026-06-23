import { buildLayout2Svg, L2_HEAD_MAX_W, L2_BODY_MAX_W } from '../svg/layout2';
import { wrap, measure } from '../textwrap';
import { ASSETS } from '../assets';
import { getLogoWhite } from '../settings';
import { uid } from '../model';
import { getZone } from '../presets/zones';
import { getTypeScale } from '../presets/typeScale';
import type { LayoutModule, PostDoc, BuildOpts, Rect } from '../model';
import type { FormatPreset } from '../presets/index';

export const layout2: LayoutModule = {
  id: 'L2',
  label: 'Curiosity Lab',

  photoRegion(preset: FormatPreset): Rect {
    const z = getZone('L2', preset.id);
    return z.photo ?? { x: 0, y: 0, w: preset.w, h: preset.h };
  },

  newDoc(): PostDoc {
    const now = Date.now();
    return {
      id: uid(),
      name: 'Untitled',
      layoutId: 'L2',
      colorway: 'A',
      headline: 'Small experiments.\nBig learning.',
      body: 'Exploring ideas, testing theories, and discovering more. Bringing science to life through hands-on experiences.',
      hashtag: '#TheCuriosityLab',
      headlineSize: 64,
      bodySize: 28,
      headlineDY: 0,
      bodyDY: 0,
      hashtagSide: 'right',
      photo: { src: ASSETS.lab.href, w: ASSETS.lab.w, h: ASSETS.lab.h, scale: 1, focalX: 0, focalY: 0 },
      preset: 'feed-portrait',
      photoFocalPoints: {},
      createdAt: now,
      updatedAt: now,
    };
  },

  build(doc: PostDoc, preset: FormatPreset, opts: BuildOpts = {}): string {
    const isLandscape = preset.orientation === 'landscape';
    const ts = getTypeScale('L2', preset.id);
    const headlineSize = Math.round(doc.headlineSize * ts.headline);
    const bodySize = Math.round(doc.bodySize * ts.body);
    const zone = getZone('L2', preset.id);
    const headMaxW = isLandscape ? zone.content.w - 60 : L2_HEAD_MAX_W;
    const bodyMaxW = isLandscape ? zone.content.w - 60 : L2_BODY_MAX_W;
    const headlineLines = wrap(doc.headline, `700 ${headlineSize}px Kalam`, headMaxW);
    const bodyLines = wrap(doc.body, `400 ${bodySize}px Poppins`, bodyMaxW);
    const pillTextWidth = measure(doc.hashtag, '600 19px Poppins') + 0.5 * Math.max(0, doc.hashtag.length - 1);
    const ph = doc.photo;
    const fp = doc.photoFocalPoints?.[preset.id];
    const focalX = fp?.focalX ?? ph?.focalX ?? 0;
    const focalY = fp?.focalY ?? ph?.focalY ?? 0;
    return buildLayout2Svg({
      headlineLines,
      bodyLines,
      hashtag: doc.hashtag,
      colorway: doc.colorway,
      preset,
      photoHref: opts.photoHref ?? ph?.src ?? ASSETS.lab.href,
      photoW: ph?.w ?? ASSETS.lab.w,
      photoH: ph?.h ?? ASSETS.lab.h,
      scale: ph?.scale ?? 1,
      focalX,
      focalY,
      headlineSize,
      bodySize,
      headlineDY: doc.headlineDY,
      bodyDY: doc.bodyDY,
      hashtagSide: doc.hashtagSide,
      logoHref: opts.logoHref ?? getLogoWhite(), // white logo on the dark photo
      pillTextWidth,
      fontFaceCss: opts.fontFaceCss,
      anim: opts.anim,
    });
  },
};
