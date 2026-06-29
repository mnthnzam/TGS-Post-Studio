import { buildLayout3Svg, L3_HEAD_MAX_W, L3_BODY_MAX_W } from '../svg/layout3';
import { wrap, measure } from '../textwrap';
import { ASSETS } from '../assets';
import { getLogoColor, getLogoWhite } from '../settings';
import { uid } from '../model';
import { getZone } from '../presets/zones';
import { getTypeScale } from '../presets/typeScale';
import type { LayoutModule, PostDoc, BuildOpts, Rect } from '../model';
import type { FormatPreset } from '../presets/index';

export const layout3: LayoutModule = {
  id: 'L3',
  label: 'Beyond (Cutout)',

  photoRegion(preset: FormatPreset): Rect {
    const z = getZone('L3', preset.id);
    return z.photo ?? { x: 0, y: 0, w: preset.w, h: preset.h };
  },

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
      preset: 'feed-portrait',
      photoFocalPoints: {},
      createdAt: now,
      updatedAt: now,
    };
  },

  build(doc: PostDoc, preset: FormatPreset, opts: BuildOpts = {}): string {
    const isLandscape = preset.orientation === 'landscape';
    const ts = getTypeScale('L3', preset.id);
    const headlineSize = Math.round(doc.headlineSize * ts.headline);
    const bodySize = Math.round(doc.bodySize * ts.body);
    const zone = getZone('L3', preset.id);
    const headMaxW = isLandscape ? zone.content.w - 60 : L3_HEAD_MAX_W;
    const bodyMaxW = isLandscape ? zone.content.w - 60 : L3_BODY_MAX_W;
    const headlineLines = wrap(doc.headline, `400 ${headlineSize}px DM Serif Display`, headMaxW);
    const bodyLines = wrap(doc.body, `400 ${bodySize}px DM Sans`, bodyMaxW);
    const pillTextWidth = measure(doc.hashtag, '700 20px DM Sans') + 0.5 * Math.max(0, doc.hashtag.length - 1);
    const ph = doc.photo;
    const fp = doc.photoFocalPoints?.[preset.id];
    const focalX = fp?.focalX ?? ph?.focalX ?? 0;
    const focalY = fp?.focalY ?? ph?.focalY ?? 0;
    return buildLayout3Svg({
      headlineLines,
      bodyLines,
      hashtag: doc.hashtag,
      colorway: doc.colorway,
      preset,
      photoHref: opts.photoHref ?? ph?.src ?? ASSETS.boy.href,
      photoW: ph?.w ?? ASSETS.boy.w,
      photoH: ph?.h ?? ASSETS.boy.h,
      scale: ph?.scale ?? 1,
      focalX,
      focalY,
      headlineSize,
      bodySize,
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
      anim: opts.anim,
    });
  },
};
