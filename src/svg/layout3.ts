// Shared SVG builder for Layout 3 (Beyond the Chalkboard — cutout + flower burst).
// Geometry from Figma node 2562:213 family. Flower + grid recreated as recolorable
// SVG; the child is a transparent cutout PNG. Preview == export.
//
// Authored in 1080×1350 base space, scaled to the active preset (X/W by S=w/1080,
// Y/H by SY=h/1350). feed-portrait (S=SY=1) is byte-identical to the original.

import type { FormatPreset } from '../presets/index';
import { pillAnchor } from '../presets/index';
import { gWrap } from '../anim/svgGroup';
import type { AnimMap } from '../anim/types';

export type ColorwayId = 'A' | 'B' | 'C';

export interface Layout3Params {
  headlineLines: string[];
  bodyLines: string[];
  hashtag: string;
  colorway: ColorwayId;
  preset: FormatPreset;
  photoHref: string; // transparent cutout
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
  shapeX?: number; // flower offset from default centre
  shapeY?: number;
  shapeRotate?: number; // degrees
  shapeScale?: number;
  customShapes?: { dataUri: string; baseW: number; baseH: number; x: number; y: number; scale: number; rotate: number }[];
  logoHref: string;
  pillTextWidth?: number;
  fontFaceCss?: string;
  anim?: AnimMap;
}

interface CW { bg: string; grid: string; flower: string; headline: string; body: string; pillBg: string; pillText: string; }
const STYLES: Record<ColorwayId, CW> = {
  A: { bg: '#1E3A8A', grid: 'rgba(255,255,255,0.10)', flower: '#FFC352', headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF' },
  B: { bg: '#0B7A53', grid: 'rgba(255,255,255,0.10)', flower: '#FFC352', headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF' },
  C: { bg: '#FFC352', grid: 'rgba(0,0,0,0.07)', flower: '#1E3A8A', headline: '#1E3A8A', body: '#1F2937', pillBg: '#1E3A8A', pillText: '#FFFFFF' },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = (n: number) => Math.round(n * 100) / 100;

const HEAD_TOP = 250;
const HEAD_MAX_W = 480;
const BODY_TOP = 820;
const BODY_MAX_W = 440;

// Flower burst: 8 amber petals radiating from a centre behind the cutout.
// The whole burst can be moved (cx/cy), rotated and scaled.
function flower(cx: number, cy: number, rotate: number, scale: number, fill: string): string {
  const petal = 'M0,0 C -62,-92 -56,-214 0,-306 C 56,-214 62,-92 0,0 Z';
  let g = `<g transform="translate(${r2(cx)} ${r2(cy)}) rotate(${rotate}) scale(${scale})" fill="${fill}">`;
  for (let i = 0; i < 8; i++) g += `<path d="${petal}" transform="rotate(${i * 45})"/>`;
  g += '</g>';
  return g;
}

// User-imported shapes, each centred at (x,y), scaled and rotated.
function customShapes(shapes: NonNullable<Layout3Params['customShapes']>, S: number, SY: number): string {
  return shapes.map((s) => {
    const w = s.baseW * s.scale;
    const h = s.baseH * s.scale;
    return `<g transform="translate(${r2(s.x * S)} ${r2(s.y * SY)}) rotate(${s.rotate})"><image href="${s.dataUri}" x="${r2(-w / 2)}" y="${r2(-h / 2)}" width="${r2(w)}" height="${r2(h)}"/></g>`;
  }).join('');
}

function grid(color: string, w: number, h: number): string {
  let lines = '';
  for (let x = 0; x <= w; x += 108) lines += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${color}" stroke-width="1.5"/>`;
  for (let y = 0; y <= h; y += 108) lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="1.5"/>`;
  return lines;
}

// Cutout placement: anchored bottom-right, scaled by `scale`, panned by focal.
function cutoutPlacement(p: Layout3Params) {
  const baseW = 820; // default render width at scale 1
  const s = (baseW / p.photoW) * p.scale;
  const dw = p.photoW * s;
  const dh = p.photoH * s;
  const dx = p.preset.w - dw + p.focalX; // right-anchored
  const dy = p.preset.h - dh + p.focalY; // bottom-anchored
  return { dx: r2(dx), dy: r2(dy), dw: r2(dw), dh: r2(dh) };
}

export function buildLayout3Svg(p: Layout3Params): string {
  const c = STYLES[p.colorway];
  const S = p.preset.w / 1080;
  const SY = p.preset.h / 1350;
  const TEXT_X = 54 * S;
  const headLineH = p.headlineSize * 1.05;
  const bodyLineH = p.bodySize * 1.45;

  const headlineDY = p.headlineDY ?? 0;
  const bodyDY = p.bodyDY ?? 0;
  const headTop = HEAD_TOP * SY + headlineDY;
  let cur = headTop;
  const headTspans = p.headlineLines.map((line) => {
    const baseline = cur + p.headlineSize * 0.86;
    cur += headLineH;
    return `<text x="${r2(TEXT_X)}" y="${r2(baseline)}" font-family="DM Serif Display" font-weight="400" font-size="${p.headlineSize}" fill="${c.headline}">${esc(line)}</text>`;
  }).join('\n  ');
  const bodyTop = BODY_TOP * SY + bodyDY;
  let bcur = bodyTop;
  const bodyTspans = p.bodyLines.map((line) => {
    const baseline = bcur + p.bodySize * 0.82;
    bcur += bodyLineH;
    return `<text x="${r2(TEXT_X)}" y="${r2(baseline)}" font-family="DM Sans" font-weight="400" font-size="${p.bodySize}" fill="${c.body}">${esc(line)}</text>`;
  }).join('\n  ');

  // pill: side switchable. Bottom-anchored with equal corner padding.
  // Brand-element scale ES = width factor S (one factor, like the logo).
  const ES = S;
  const pillH = Math.round(47 * ES); const pillPadX = 27.5 * ES; const pillFont = 20 * ES;
  const textW = (p.pillTextWidth ?? p.hashtag.length * (20 * 0.56)) * ES;
  const pillW = Math.round(textW + pillPadX * 2);
  const side = p.hashtagSide ?? 'left';
  const { x: pillX, y: pillY } = pillAnchor(p.preset, side, pillW, pillH);
  const pill = `<rect x="${pillX}" y="${r2(pillY)}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${c.pillBg}"/>
  <text x="${r2(pillX + pillW / 2)}" y="${r2(pillY + 31 * ES)}" text-anchor="middle" font-family="DM Sans" font-weight="700" font-size="${r2(pillFont)}" letter-spacing="${r2(0.5 * ES)}" fill="${c.pillText}">${esc(p.hashtag)}</text>`;

  const cut = cutoutPlacement(p);

  // per-element animation wrappers (no-ops when p.anim is absent)
  const lw = 283 * S; const lh = 70 * S; const lx = 54 * S; const ly = 54 * S;
  const [phoO, phoC] = gWrap(p.anim, 'photo', cut.dx + cut.dw / 2, cut.dy + cut.dh / 2, S, SY);
  const [hO, hC] = gWrap(p.anim, 'headline', TEXT_X, headTop, S, SY);
  const [bO, bC] = gWrap(p.anim, 'body', TEXT_X, bodyTop, S, SY);
  const [piO, piC] = gWrap(p.anim, 'pill', pillX + pillW / 2, pillY + pillH / 2, S, SY);
  const [loO, loC] = gWrap(p.anim, 'logo', lx + lw / 2, ly + lh / 2, S, SY);

  return `<svg width="${p.preset.w}" height="${p.preset.h}" viewBox="0 0 ${p.preset.w} ${p.preset.h}" xmlns="http://www.w3.org/2000/svg">
  ${p.fontFaceCss ? `<defs><style>${p.fontFaceCss}</style></defs>` : ''}
  <rect width="${p.preset.w}" height="${p.preset.h}" fill="${c.bg}"/>
  ${grid(c.grid, p.preset.w, p.preset.h)}
  ${flower((700 + (p.shapeX ?? 0)) * S, (600 + (p.shapeY ?? 0)) * SY, p.shapeRotate ?? 0, p.shapeScale ?? 1, c.flower)}
  ${p.customShapes && p.customShapes.length ? customShapes(p.customShapes, S, SY) : ''}
  ${phoO}<image href="${p.photoHref}" x="${cut.dx}" y="${cut.dy}" width="${cut.dw}" height="${cut.dh}" preserveAspectRatio="none"/>${phoC}

  ${loO}<image href="${p.logoHref}" x="${54 * S}" y="${54 * S}" width="${283 * S}" height="${70 * S}"/>${loC}
  ${hO}${headTspans}${hC}
  ${bO}${bodyTspans}${bC}
  ${piO}${pill}${piC}
</svg>`;
}

export { HEAD_MAX_W as L3_HEAD_MAX_W, BODY_MAX_W as L3_BODY_MAX_W };
