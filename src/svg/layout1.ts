// Shared SVG builder for Layout 1 (Teacher-Centric Story Frame).
// Geometry traced from Figma node 2562:180 family. Used BY BOTH the live preview
// and the PNG export, so what you see is exactly what exports.
//
// All geometry is authored in 1080×1350 base space and scaled to the active
// preset: X/W by S = w/1080, Y/H by SY = h/1350. For feed-portrait (S=SY=1)
// the output is byte-identical to the original single-format builder.

import type { FormatPreset } from '../presets/index';
import { gWrap } from '../anim/svgGroup';
import type { AnimMap } from '../anim/types';

export type ColorwayId = 'A' | 'B' | 'C';

export interface Layout1Params {
  headlineLines: string[]; // DM Serif Display, stacked
  bodyLines: string[]; // DM Sans body, stacked
  hashtag: string;
  colorway: ColorwayId;
  preset: FormatPreset; // target canvas
  // photo + framing
  photoHref: string; // URL or data URI
  photoW: number; // natural width
  photoH: number; // natural height
  scale: number; // zoom multiplier on top of cover (1 = cover)
  focalX: number; // horizontal pan (px)
  focalY: number; // vertical pan (px)
  // type (lines should already be wrapped to fit by the caller)
  headlineSize: number; // px
  bodySize: number; // px
  headlineDY?: number; // vertical nudge for headline
  bodyDY?: number; // vertical nudge for body
  hashtagSide?: 'left' | 'right';
  // brand
  logoHref: string;
  pillTextWidth?: number; // measured hashtag text width; pill auto-sizes to it
  /** When provided, injected as <style> so SVG-as-image rasterization has fonts. */
  fontFaceCss?: string;
  /** Per-element animation state for video frames. Omit for a static render. */
  anim?: AnimMap;
}

interface ColorwayStyle {
  panelBg: string; border: string; headline: string; body: string; pillBg: string; pillText: string;
}
const COLORWAY_STYLES: Record<ColorwayId, ColorwayStyle> = {
  A: { panelBg: '#1E3A8A', border: '#1E3A8A', headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF' },
  B: { panelBg: '#0B7A53', border: '#0B7A53', headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF' },
  C: { panelBg: '#FFC352', border: '#FFC352', headline: '#1E3A8A', body: '#1F2937', pillBg: '#1E3A8A', pillText: '#FFFFFF' },
};

const topRounded = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} L${x},${y + h} Z`;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = (n: number) => Math.round(n * 100) / 100;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Preset-scaled geometry. Base values are the original 1080-space constants.
function geom(preset: FormatPreset) {
  const S = preset.w / 1080;
  const SY = preset.h / 1350;
  return {
    S, SY,
    CARD: { x: 54 * S, y: 138 * SY, w: 972 * S, h: 1212 * SY, r: 40 * S },
    TEXT_X: 114 * S,
    PAD_TOP: 84 * SY,
    PAD_BOTTOM: 84 * SY,
    PHOTO_TOP: 138 * SY,
    PHOTO_OVERLAP: 30 * SY,
    PANEL_TOP_MIN: 700 * SY,
    PANEL_TOP_MAX: 1180 * SY,
    CANVAS_BOTTOM: preset.h,
  };
}
type Geom = ReturnType<typeof geom>;

// Dynamic layout: the blue panel grows with the text block (anchored to the
// bottom edge); the photo fills everything above it.
function computeLayout(p: Layout1Params, g: Geom) {
  const headLineH = p.headlineSize * 1.18;
  const bodyLineH = p.bodySize * 1.5;
  const gap = Math.round(p.bodySize * 0.9);
  const totalH = p.headlineLines.length * headLineH + gap + p.bodyLines.length * bodyLineH;
  const panelTop = clamp(g.CANVAS_BOTTOM - (totalH + g.PAD_TOP + g.PAD_BOTTOM), g.PANEL_TOP_MIN, g.PANEL_TOP_MAX);
  const panelH = g.CANVAS_BOTTOM - panelTop;
  const photoH = panelTop + g.PHOTO_OVERLAP - g.PHOTO_TOP;
  return { headLineH, bodyLineH, gap, panelTop, panelH, photoH };
}

// Photo placement: cover the (dynamic) photo region, zoomed + panned. Clip crops.
function photoPlacement(p: Layout1Params, g: Geom, photoH: number) {
  const cover = Math.max(g.CARD.w / p.photoW, photoH / p.photoH);
  const s = cover * p.scale;
  const dw = p.photoW * s;
  const dh = p.photoH * s;
  const dx = g.CARD.x + (g.CARD.w - dw) / 2 + p.focalX;
  const dy = g.PHOTO_TOP + (photoH - dh) / 2 + p.focalY;
  return { dx: r2(dx), dy: r2(dy), dw: r2(dw), dh: r2(dh) };
}

export function buildLayout1Svg(p: Layout1Params): string {
  const c = COLORWAY_STYLES[p.colorway];
  const g = geom(p.preset);
  const S = g.S;
  const L = computeLayout(p, g);

  // text block: top-anchored with PAD_TOP inside the (variable-height) panel.
  // headlineDY / bodyDY nudge each block vertically; left margin (TEXT_X) is fixed.
  const headlineDY = p.headlineDY ?? 0;
  const bodyDY = p.bodyDY ?? 0;
  const headTop = L.panelTop + g.PAD_TOP + headlineDY;
  let cursor = headTop;
  const headTspans = p.headlineLines.map((line) => {
    const baseline = cursor + p.headlineSize * 0.82;
    cursor += L.headLineH;
    return `<text x="${r2(g.TEXT_X)}" y="${r2(baseline)}" font-family="DM Serif Display" font-weight="400" font-size="${p.headlineSize}" fill="${c.headline}">${esc(line)}</text>`;
  }).join('\n  ');
  const bodyTop = L.panelTop + g.PAD_TOP + headlineDY + p.headlineLines.length * L.headLineH + L.gap + bodyDY;
  let bcur = bodyTop;
  const bodyTspans = p.bodyLines.map((line) => {
    const baseline = bcur + p.bodySize * 0.82;
    bcur += L.bodyLineH;
    return `<text x="${r2(g.TEXT_X)}" y="${r2(baseline)}" font-family="DM Sans" font-weight="400" font-size="${p.bodySize}" fill="${c.body}">${esc(line)}</text>`;
  }).join('\n  ');

  // pill: auto-sized; side switchable. Size scales with the card (ES = width factor S).
  const ES = S;
  const pillH = Math.round(47 * ES); const pillPadX = 27.5 * ES; const pillFont = 20 * ES;
  const textW = (p.pillTextWidth ?? p.hashtag.length * (20 * 0.56)) * ES;
  const pillW = Math.round(textW + pillPadX * 2);
  const side = p.hashtagSide ?? 'left';
  // L1 is mask-relative: the pill sits just above the colored panel's rounded top and
  // is inset from the card edges (NOT bottom-corner anchored like L2/L3). It tracks the
  // panel as copy grows — the original Teacher-Story design tied to the masking card.
  const PILL_INSET = 35 * S;
  const pillY = L.panelTop - pillH - 5 * g.SY;
  const pillX = side === 'right' ? g.CARD.x + g.CARD.w - PILL_INSET - pillW : g.CARD.x + PILL_INSET;
  const pill = `<rect x="${pillX}" y="${r2(pillY)}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${c.pillBg}"/>
  <text x="${r2(pillX + pillW / 2)}" y="${r2(pillY + 31 * ES)}" text-anchor="middle" font-family="DM Sans" font-weight="700" font-size="${r2(pillFont)}" letter-spacing="${r2(0.5 * ES)}" fill="${c.pillText}">${esc(p.hashtag)}</text>`;

  const ph = photoPlacement(p, g, L.photoH);

  // Logo: keep it clear of the masking card. Logo size scales by width (S) but the
  // card top scales by height (SY), so on wide/short formats they would collide. If the
  // logo's natural bottom would reach the card, scale it down to fit the top margin.
  const logoMargin = 16 * g.SY;
  const wantBottom = 108 * S; // (46 + 62) * S — natural logo bottom
  const band = g.CARD.y - logoMargin; // room above the card top
  const logoK = wantBottom > band ? band / wantBottom : 1;
  const lw = 250 * S * logoK; const lh = 62 * S * logoK; const lx = 78 * S * logoK; const ly = 46 * S * logoK;
  const [phoO, phoC] = gWrap(p.anim, 'photo', g.CARD.x + g.CARD.w / 2, g.PHOTO_TOP + L.photoH / 2, g.S, g.SY);
  const [hO, hC] = gWrap(p.anim, 'headline', g.TEXT_X, headTop, g.S, g.SY);
  const [bO, bC] = gWrap(p.anim, 'body', g.TEXT_X, bodyTop, g.S, g.SY);
  const [piO, piC] = gWrap(p.anim, 'pill', pillX + pillW / 2, pillY + pillH / 2, g.S, g.SY);
  const [loO, loC] = gWrap(p.anim, 'logo', lx + lw / 2, ly + lh / 2, g.S, g.SY);

  return `<svg width="${p.preset.w}" height="${p.preset.h}" viewBox="0 0 ${p.preset.w} ${p.preset.h}" xmlns="http://www.w3.org/2000/svg">
  ${p.fontFaceCss ? `<defs><style>${p.fontFaceCss}</style></defs>` : ''}
  <rect width="${p.preset.w}" height="${p.preset.h}" fill="#FFFFFF"/>
  <defs>
    <clipPath id="l1photo"><path d="${topRounded(g.CARD.x, g.PHOTO_TOP, g.CARD.w, L.photoH, g.CARD.r)}"/></clipPath>
  </defs>

  <!-- Blue panel: variable height, rounded top, square bottom (flush on the bottom edge) -->
  <path d="${topRounded(g.CARD.x, L.panelTop, g.CARD.w, L.panelH, g.CARD.r)}" fill="${c.panelBg}"/>

  <g clip-path="url(#l1photo)">
    ${phoO}<image href="${p.photoHref}" x="${ph.dx}" y="${ph.dy}" width="${ph.dw}" height="${ph.dh}" preserveAspectRatio="none"/>${phoC}
  </g>

  <!-- Card border: rounded top, square bottom -->
  <path d="${topRounded(g.CARD.x, g.CARD.y, g.CARD.w, g.CARD.h, g.CARD.r)}" fill="none" stroke="${c.border}" stroke-width="5"/>

  ${piO}${pill}${piC}
  ${hO}${headTspans}${hC}
  ${bO}${bodyTspans}${bC}

  ${loO}<image href="${p.logoHref}" x="${r2(lx)}" y="${r2(ly)}" width="${r2(lw)}" height="${r2(lh)}"/>${loC}
</svg>`;
}

// Approx photo area in 1080-space for the interactive drag overlay (legacy).
export const PHOTO_REGION = { x: 54, y: 138, w: 972, h: 762 };
