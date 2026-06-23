// Shared SVG builder for Layout 2 (Curiosity Labs — full-bleed + organic blob).
// Geometry from Figma node 2562:198 family. Preview == export.
//
// Authored in 1080×1350 base space, scaled to the active preset (X/W by S=w/1080,
// Y/H by SY=h/1350). feed-portrait (S=SY=1) is byte-identical to the original.

import type { FormatPreset } from '../presets/index';
import { pillAnchor } from '../presets/index';
import { gWrap } from '../anim/svgGroup';
import type { AnimMap } from '../anim/types';

export type ColorwayId = 'A' | 'B' | 'C';

export interface Layout2Params {
  headlineLines: string[];
  bodyLines: string[];
  hashtag: string;
  colorway: ColorwayId;
  preset: FormatPreset;
  photoHref: string;
  photoW: number;
  photoH: number;
  scale: number;
  focalX: number;
  focalY: number;
  headlineSize: number;
  bodySize: number;
  headlineDY?: number;
  bodyDY?: number;
  hashtagSide?: 'left' | 'right';
  logoHref: string;
  pillTextWidth?: number;
  fontFaceCss?: string;
  anim?: AnimMap;
}

interface CW { blob: string; headline: string; body: string; pillBg: string; pillText: string; }
const STYLES: Record<ColorwayId, CW> = {
  A: { blob: '#2A2A86', headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF' },
  B: { blob: '#0B7A53', headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF' },
  C: { blob: '#FFC352', headline: '#1E3A8A', body: '#1F2937', pillBg: '#1E3A8A', pillText: '#FFFFFF' },
};

// Exact organic blob (Figma node 2562:200). Path is bottom-anchored: translate y
// so its bottom edge (path y=1044) lands on the canvas bottom.
const BLOB_D = 'M-191 1044H1147.5C1147.5 1044 1062 791 773.5 817C773.5 817 793.889 709.133 734 566.5C674.111 423.867 471.311 332.948 29.8612 519.859C29.8612 519.859 347.838 83.5354 -191 0V1044Z';
const BLOB_H = 1044;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = (n: number) => Math.round(n * 100) / 100;

const HEAD_TOP = 889; // Figma headline top (base space)
const BODY_GAP = 40; // headline block → body
const HEAD_MAX_W = 640;
const BODY_MAX_W = 600;

export function photoPlacement2(p: Layout2Params) {
  const cover = Math.max(p.preset.w / p.photoW, p.preset.h / p.photoH);
  const s = cover * p.scale;
  const dw = p.photoW * s;
  const dh = p.photoH * s;
  return { dx: r2((p.preset.w - dw) / 2 + p.focalX), dy: r2((p.preset.h - dh) / 2 + p.focalY), dw: r2(dw), dh: r2(dh) };
}

export function buildLayout2Svg(p: Layout2Params): string {
  const c = STYLES[p.colorway];
  const S = p.preset.w / 1080;
  const SY = p.preset.h / 1350;
  const TEXT_X = 54 * S;
  const headLineH = p.headlineSize * 1.2;
  const bodyLineH = p.bodySize * 1.45;

  const headlineDY = p.headlineDY ?? 0;
  const bodyDY = p.bodyDY ?? 0;
  const headTop = HEAD_TOP * SY + headlineDY;
  let cursor = headTop;
  const headTspans = p.headlineLines.map((line) => {
    const baseline = cursor + p.headlineSize * 0.86;
    cursor += headLineH;
    return `<text x="${r2(TEXT_X)}" y="${r2(baseline)}" font-family="Kalam" font-weight="700" font-size="${p.headlineSize}" fill="${c.headline}">${esc(line)}</text>`;
  }).join('\n  ');
  const bodyTop = HEAD_TOP * SY + headlineDY + p.headlineLines.length * headLineH + BODY_GAP * SY + bodyDY;
  let bcur = bodyTop;
  const bodyTspans = p.bodyLines.map((line) => {
    const baseline = bcur + p.bodySize * 0.82;
    bcur += bodyLineH;
    return `<text x="${r2(TEXT_X)}" y="${r2(baseline)}" font-family="Poppins" font-weight="400" font-size="${p.bodySize}" fill="${c.body}">${esc(line)}</text>`;
  }).join('\n  ');

  // pill: side switchable (default right). Bottom-anchored with equal corner padding.
  // Brand-element scale ES = width factor S (one factor, like the logo).
  const ES = S;
  const pillH = Math.round(42 * ES); const pillPadX = 22 * ES; const pillFont = 19 * ES;
  const textW = (p.pillTextWidth ?? p.hashtag.length * (19 * 0.56)) * ES;
  const pillW = Math.round(textW + pillPadX * 2);
  const side = p.hashtagSide ?? 'right';
  const { x: pillX, y: pillY } = pillAnchor(p.preset, side, pillW, pillH);
  const pill = `<rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${c.pillBg}"/>
  <text x="${r2(pillX + pillW / 2)}" y="${r2(pillY + 28 * ES)}" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="${r2(pillFont)}" letter-spacing="${r2(0.5 * ES)}" fill="${c.pillText}">${esc(p.hashtag)}</text>`;

  const ph = photoPlacement2(p);
  const blobTy = p.preset.h - BLOB_H; // bottom-anchor the blob

  // per-element animation wrappers (no-ops when p.anim is absent)
  const lw = 283 * S; const lh = 70 * S; const lx = 54 * S; const ly = 54 * S;
  const [phoO, phoC] = gWrap(p.anim, 'photo', p.preset.w / 2, p.preset.h / 2, S, SY);
  const [hO, hC] = gWrap(p.anim, 'headline', TEXT_X, headTop, S, SY);
  const [bO, bC] = gWrap(p.anim, 'body', TEXT_X, bodyTop, S, SY);
  const [piO, piC] = gWrap(p.anim, 'pill', pillX + pillW / 2, pillY + pillH / 2, S, SY);
  const [loO, loC] = gWrap(p.anim, 'logo', lx + lw / 2, ly + lh / 2, S, SY);

  return `<svg width="${p.preset.w}" height="${p.preset.h}" viewBox="0 0 ${p.preset.w} ${p.preset.h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${p.fontFaceCss ? `<style>${p.fontFaceCss}</style>` : ''}
    <linearGradient id="l2top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0E1C50" stop-opacity="0.62"/>
      <stop offset="0.42" stop-color="#0E1C50" stop-opacity="0"/>
    </linearGradient>
    <filter id="l2shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#000000" flood-opacity="0.30"/>
    </filter>
  </defs>

  <rect width="${p.preset.w}" height="${p.preset.h}" fill="#0E1C50"/>
  ${phoO}<image href="${p.photoHref}" x="${ph.dx}" y="${ph.dy}" width="${ph.dw}" height="${ph.dh}" preserveAspectRatio="none"/>${phoC}
  <rect width="${p.preset.w}" height="${p.preset.h}" fill="url(#l2top)"/>

  <g transform="translate(0 ${blobTy})" filter="url(#l2shadow)">
    <path d="${BLOB_D}" fill="${c.blob}"/>
  </g>

  ${loO}<image href="${p.logoHref}" x="${54 * S}" y="${54 * S}" width="${283 * S}" height="${70 * S}"/>${loC}

  ${hO}${headTspans}${hC}
  ${bO}${bodyTspans}${bC}
  ${piO}${pill}${piC}
</svg>`;
}

export { HEAD_MAX_W as L2_HEAD_MAX_W, BODY_MAX_W as L2_BODY_MAX_W };
