import { buildLayout2Svg, L2_HEAD_MAX_W, L2_BODY_MAX_W } from '../svg/layout2';
import { wrap, measure } from '../textwrap';
import { ASSETS } from '../assets';
import { getLogoWhite } from '../settings';
import { uid } from '../model';
import type { LayoutModule, PostDoc, BuildOpts } from '../model';

export const layout2: LayoutModule = {
  id: 'L2',
  label: 'Curiosity Lab',
  photoRegion: { x: 0, y: 0, w: 1080, h: 1350 },

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
      createdAt: now,
      updatedAt: now,
    };
  },

  build(doc: PostDoc, opts: BuildOpts = {}): string {
    const headlineLines = wrap(doc.headline, `700 ${doc.headlineSize}px Kalam`, L2_HEAD_MAX_W);
    const bodyLines = wrap(doc.body, `400 ${doc.bodySize}px Poppins`, L2_BODY_MAX_W);
    const pillTextWidth = measure(doc.hashtag, '600 19px Poppins') + 0.5 * Math.max(0, doc.hashtag.length - 1);
    const ph = doc.photo;
    return buildLayout2Svg({
      headlineLines,
      bodyLines,
      hashtag: doc.hashtag,
      colorway: doc.colorway,
      photoHref: opts.photoHref ?? ph?.src ?? ASSETS.lab.href,
      photoW: ph?.w ?? ASSETS.lab.w,
      photoH: ph?.h ?? ASSETS.lab.h,
      scale: ph?.scale ?? 1,
      focalX: ph?.focalX ?? 0,
      focalY: ph?.focalY ?? 0,
      headlineSize: doc.headlineSize,
      bodySize: doc.bodySize,
      headlineDY: doc.headlineDY,
      bodyDY: doc.bodyDY,
      hashtagSide: doc.hashtagSide,
      logoHref: opts.logoHref ?? getLogoWhite(), // white logo on the dark photo
      pillTextWidth,
      fontFaceCss: opts.fontFaceCss,
    });
  },
};
