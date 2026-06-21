import { buildLayout1Svg } from '../svg/layout1';
import { wrap, measure } from '../textwrap';
import { ASSETS } from '../assets';
import { getLogoColor } from '../settings';
import { uid } from '../model';
import type { LayoutModule, PostDoc, BuildOpts } from '../model';

const MAX_W = 852;

export const layout1: LayoutModule = {
  id: 'L1',
  label: 'Teacher Story',
  photoRegion: { x: 54, y: 138, w: 972, h: 762 },

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
      createdAt: now,
      updatedAt: now,
    };
  },

  build(doc: PostDoc, opts: BuildOpts = {}): string {
    const headlineLines = wrap(doc.headline, `700 ${doc.headlineSize}px Kalam`, MAX_W);
    const bodyLines = wrap(doc.body, `400 ${doc.bodySize}px Poppins`, MAX_W);
    // include letter-spacing (0.5px between glyphs) so the pill width is exact
    const pillTextWidth = measure(doc.hashtag, '600 20px Poppins') + 0.5 * Math.max(0, doc.hashtag.length - 1);
    const ph = doc.photo;
    return buildLayout1Svg({
      headlineLines,
      bodyLines,
      hashtag: doc.hashtag,
      colorway: doc.colorway,
      photoHref: opts.photoHref ?? ph?.src ?? ASSETS.teacher.href,
      photoW: ph?.w ?? ASSETS.teacher.w,
      photoH: ph?.h ?? ASSETS.teacher.h,
      scale: ph?.scale ?? 1,
      focalX: ph?.focalX ?? 0,
      focalY: ph?.focalY ?? -346,
      headlineSize: doc.headlineSize,
      bodySize: doc.bodySize,
      headlineDY: doc.headlineDY,
      bodyDY: doc.bodyDY,
      hashtagSide: doc.hashtagSide,
      logoHref: opts.logoHref ?? getLogoColor(),
      pillTextWidth,
      fontFaceCss: opts.fontFaceCss,
    });
  },
};
