import { buildLayout3Svg, L3_HEAD_MAX_W, L3_BODY_MAX_W } from '../svg/layout3';
import { wrap, measure } from '../textwrap';
import { ASSETS } from '../assets';
import { getLogoColor, getLogoWhite } from '../settings';
import { uid } from '../model';
import type { LayoutModule, PostDoc, BuildOpts } from '../model';

export const layout3: LayoutModule = {
  id: 'L3',
  label: 'Beyond (Cutout)',
  photoRegion: { x: 400, y: 300, w: 680, h: 1050 },

  newDoc(): PostDoc {
    const now = Date.now();
    return {
      id: uid(),
      name: 'Untitled',
      layoutId: 'L3',
      colorway: 'A',
      headline: 'Just give it\na shot !',
      body: 'Here at Tatva, we encourage our kids to try new things and keep their curiosity alive.',
      hashtag: '#TheCuriosityLab',
      headlineSize: 84,
      bodySize: 30,
      headlineDY: 0,
      bodyDY: 0,
      hashtagSide: 'left',
      shape: { x: 0, y: 0, rotate: 0, scale: 1 },
      photo: { src: ASSETS.boy.href, w: ASSETS.boy.w, h: ASSETS.boy.h, scale: 1, focalX: 0, focalY: 0 },
      createdAt: now,
      updatedAt: now,
    };
  },

  build(doc: PostDoc, opts: BuildOpts = {}): string {
    const headlineLines = wrap(doc.headline, `700 ${doc.headlineSize}px Kalam`, L3_HEAD_MAX_W);
    const bodyLines = wrap(doc.body, `400 ${doc.bodySize}px Poppins`, L3_BODY_MAX_W);
    const pillTextWidth = measure(doc.hashtag, '600 20px Poppins') + 0.5 * Math.max(0, doc.hashtag.length - 1);
    const ph = doc.photo;
    return buildLayout3Svg({
      headlineLines,
      bodyLines,
      hashtag: doc.hashtag,
      colorway: doc.colorway,
      photoHref: opts.photoHref ?? ph?.src ?? ASSETS.boy.href,
      photoW: ph?.w ?? ASSETS.boy.w,
      photoH: ph?.h ?? ASSETS.boy.h,
      scale: ph?.scale ?? 1,
      focalX: ph?.focalX ?? 0,
      focalY: ph?.focalY ?? 0,
      headlineSize: doc.headlineSize,
      bodySize: doc.bodySize,
      headlineDY: doc.headlineDY,
      bodyDY: doc.bodyDY,
      hashtagSide: doc.hashtagSide,
      shapeX: doc.shape?.x,
      shapeY: doc.shape?.y,
      shapeRotate: doc.shape?.rotate,
      shapeScale: doc.shape?.scale,
      customShapes: doc.customShapes,
      logoHref: opts.logoHref ?? (doc.colorway === 'C' ? getLogoColor() : getLogoWhite()),
      pillTextWidth,
      fontFaceCss: opts.fontFaceCss,
    });
  },
};
