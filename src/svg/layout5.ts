// SVG builder for Layout 5 — "Gradient Panel" (gradient top + solid panel bottom).
//
// Design intent: Top 55% of canvas is a gradient zone (photo behind it optional).
// Bottom 45% is a clean light/white text panel — headline and body live there.
// Logo appears top-left inside the gradient zone (white variant by default).
//
// Per-layout hashtag placement: pill defaults to BOTTOM-RIGHT corner.
//   L5 hashtagSide = 'right'  (authored default in layout5.ts newDoc)
//
// Authored in 1080×1350 base space; scaled to active preset via S = w/1080,
// SY = h/1350. feed-portrait (S=SY=1) is the reference.
//
// Colorway → gradient mapping:
//   A  →  G04  Teal-Indigo Radial        (dark gradient top, white panel)
//   B  →  G07  Amber-Green Radial        (warm gradient top, warm white panel)
//   C  →  G13  Teal-TatvaGreen Radial    (teal-green gradient top, white panel)

import type { FormatPreset } from '../presets/index';
import { pillAnchor } from '../presets/index';
import { GRADIENTS } from '../tokens/gradients';
import { gWrap } from '../anim/svgGroup';
import type { AnimMap } from '../anim/types';

export type ColorwayId = 'A' | 'B' | 'C';

export interface Layout5Params {
  headlineLines: string[];
  bodyLines: string[];
  hashtag: string;
  colorway: ColorwayId;
  preset: FormatPreset;
  // Photo fills behind the gradient zone (top portion). Optional.
  photoHref?: string;
  photoW?: number;
  photoH?: number;
  scale?: number;
  focalX?: number;
  focalY?: number;
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

interface CW {
  gradientId: string;
  panelBg: string;    // solid panel background
  headline: string;   // text in panel
  body: string;
  pillBg: string;
  pillText: string;
  // Gradient-to-panel transition overlay colour
  fadeColor: string;
}

const COLORWAYS: Record<ColorwayId, CW> = {
  A: { gradientId: 'G04', panelBg: '#FFFFFF',  headline: '#1E3A8A', body: '#1F2937', pillBg: '#E9695F', pillText: '#FFFFFF', fadeColor: '#2F327F' },
  B: { gradientId: 'G07', panelBg: '#FFF8EB',  headline: '#0B7A53', body: '#1F2937', pillBg: '#E9695F', pillText: '#FFFFFF', fadeColor: '#0B7A53' },
  C: { gradientId: 'G13', panelBg: '#F0FAF7',  headline: '#1E3A8A', body: '#1F2937', pillBg: '#1E3A8A', pillText: '#FFFFFF', fadeColor: '#0E7490' },
};

// Base-space geometry
// SPLIT is where the gradient zone ends and the panel begins (55% of 1350)
const SPLIT_Y_BASE  = 742;   // ~55% of 1350
const TEXT_X_BASE   = 72;
const TEXT_TOP_PAD  = 60;    // padding from panel top to headline
const BODY_GAP_BASE = 32;    // gap between headline block bottom and body top

export const L5_HEAD_MAX_W = 900;
export const L5_BODY_MAX_W = 900;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2  = (n: number) => Math.round(n * 100) / 100;

export function buildLayout5Svg(p: Layout5Params): string {
  const c  = COLORWAYS[p.colorway];
  const S  = p.preset.w / 1080;
  const SY = p.preset.h / 1350;

  const splitY  = Math.round(SPLIT_Y_BASE * SY);
  const TEXT_X  = TEXT_X_BASE * S;

  const headLineH = p.headlineSize * 1.18;
  const bodyLineH = p.bodySize * 1.5;

  // ── Text blocks (inside panel, below split) ────────────────────────────────
  const headlineDY = p.headlineDY ?? 0;
  const bodyDY     = p.bodyDY ?? 0;
  const headTop    = splitY + TEXT_TOP_PAD * SY + headlineDY;
  let cursor = headTop;
  const headTspans = p.headlineLines.map((line) => {
    const baseline = cursor + p.headlineSize * 0.82;
    cursor += headLineH;
    return `<text x="${r2(TEXT_X)}" y="${r2(baseline)}" font-family="Kalam" font-weight="700" font-size="${p.headlineSize}" fill="${c.headline}">${esc(line)}</text>`;
  }).join('\n  ');

  const bodyTop = splitY + TEXT_TOP_PAD * SY + headlineDY + p.headlineLines.length * headLineH + BODY_GAP_BASE * SY + bodyDY;
  let bcur = bodyTop;
  const bodyTspans = p.bodyLines.map((line) => {
    const baseline = bcur + p.bodySize * 0.82;
    bcur += bodyLineH;
    return `<text x="${r2(TEXT_X)}" y="${r2(baseline)}" font-family="Poppins" font-weight="400" font-size="${p.bodySize}" fill="${c.body}">${esc(line)}</text>`;
  }).join('\n  ');

  // ── Hashtag pill — BOTTOM-RIGHT by design ─────────────────────────────────
  const ES = S;
  const pillH    = Math.round(44 * ES);
  const pillPadX = 24 * ES;
  const pillFont = 19 * ES;
  const textW    = (p.pillTextWidth ?? p.hashtag.length * (19 * 0.56)) * ES;
  const pillW    = Math.round(textW + pillPadX * 2);
  const side     = p.hashtagSide ?? 'right';
  const { x: pillX, y: pillY } = pillAnchor(p.preset, side, pillW, pillH);
  const pill =
    `<rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${c.pillBg}"/>` +
    `\n  <text x="${r2(pillX + pillW / 2)}" y="${r2(pillY + 29 * ES)}" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="${r2(pillFont)}" letter-spacing="${r2(0.5 * ES)}" fill="${c.pillText}">${esc(p.hashtag)}</text>`;

  // ── Logo ───────────────────────────────────────────────────────────────────
  const lw = 250 * S; const lh = 62 * S; const lx = 78 * S; const ly = 46 * S;

  // ── Gradient def ──────────────────────────────────────────────────────────
  const grad = GRADIENTS[c.gradientId];
  const BG_GRAD_ID   = 'l5bg';
  const FADE_GRAD_ID = 'l5fade';

  // ── Optional photo (fills gradient zone, behind gradient) ─────────────────
  let photoDefs = '';
  let photoBody = '';
  const hasPhoto = !!(p.photoHref && p.photoW && p.photoH);
  if (hasPhoto && p.photoHref && p.photoW && p.photoH) {
    const cover = Math.max(p.preset.w / p.photoW, splitY / p.photoH);
    const s     = cover * (p.scale ?? 1);
    const dw    = r2(p.photoW * s);
    const dh    = r2(p.photoH * s);
    const dx    = r2((p.preset.w - dw) / 2 + (p.focalX ?? 0));
    const dy    = r2((splitY - dh) / 2 + (p.focalY ?? 0));
    photoDefs = `<clipPath id="l5photoClip"><rect x="0" y="0" width="${p.preset.w}" height="${splitY}"/></clipPath>`;
    photoBody =
      `<g clip-path="url(#l5photoClip)">` +
      `\n    <image href="${p.photoHref}" x="${dx}" y="${dy}" width="${dw}" height="${dh}" preserveAspectRatio="none" opacity="0.6"/>` +
      `\n  </g>`;
  }

  // ── Animation wrappers ────────────────────────────────────────────────────
  const [hO, hC]   = gWrap(p.anim, 'headline', TEXT_X, headTop, S, SY);
  const [bO, bC]   = gWrap(p.anim, 'body', TEXT_X, bodyTop, S, SY);
  const [piO, piC] = gWrap(p.anim, 'pill', pillX + pillW / 2, pillY + pillH / 2, S, SY);
  const [loO, loC] = gWrap(p.anim, 'logo', lx + lw / 2, ly + lh / 2, S, SY);

  return `<svg width="${p.preset.w}" height="${p.preset.h}" viewBox="0 0 ${p.preset.w} ${p.preset.h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${p.fontFaceCss ? `<style>${p.fontFaceCss}</style>` : ''}
    ${grad.svgDef(BG_GRAD_ID)}
    <!-- Fade: gradient zone bottom edge blends into panel -->
    <linearGradient id="${FADE_GRAD_ID}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c.fadeColor}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${c.fadeColor}" stop-opacity="0.35"/>
    </linearGradient>
    ${photoDefs}
  </defs>

  <!-- White/light canvas base -->
  <rect width="${p.preset.w}" height="${p.preset.h}" fill="${c.panelBg}"/>

  <!-- Gradient zone (top ${SPLIT_Y_BASE}px base / ${Math.round(SPLIT_Y_BASE/1350*100)}% of canvas) -->
  <rect x="0" y="0" width="${p.preset.w}" height="${splitY}" fill="url(#${BG_GRAD_ID})"/>

  <!-- Optional photo behind gradient zone -->
  ${photoBody}

  <!-- Soft fade at the bottom of the gradient zone -->
  <rect x="0" y="${Math.round(splitY * 0.6)}" width="${p.preset.w}" height="${Math.round(splitY * 0.4)}" fill="url(#${FADE_GRAD_ID})"/>

  <!-- Divider line between gradient zone and panel -->
  <line x1="0" y1="${splitY}" x2="${p.preset.w}" y2="${splitY}" stroke="${c.fadeColor}" stroke-width="2" stroke-opacity="0.25"/>

  <!-- Text panel -->
  ${hO}${headTspans}${hC}
  ${bO}${bodyTspans}${bC}

  <!-- Logo (top-left of gradient zone) -->
  ${loO}<image href="${p.logoHref}" x="${r2(lx)}" y="${r2(ly)}" width="${r2(lw)}" height="${r2(lh)}"/>${loC}

  <!-- Hashtag pill — BOTTOM-RIGHT by design -->
  ${piO}${pill}${piC}
</svg>`;
}
