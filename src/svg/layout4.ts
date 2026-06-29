// SVG builder for Layout 4 — "Aurora" (gradient wash card).
//
// Design intent: A full-bleed gradient background is the primary visual.
// No photo required (pure gradient text card). If a photo is provided it
// renders on the right half behind the gradient at reduced opacity.
// Text lives on the left.
//
// Per-layout hashtag placement: pill defaults to BOTTOM-LEFT corner.
//   L4 hashtagSide = 'left'  (authored default in layout4.ts newDoc)
//
// Authored in 1080×1350 base space; scaled to active preset via S = w/1080,
// SY = h/1350. feed-portrait (S=SY=1) is the reference.
//
// Colorway → gradient mapping:
//   A  →  G03  Teal-Indigo Linear       (dark bg, amber headline, white body)
//   B  →  G06  Orange-Amber Linear      (warm bg, navy headline, dark body)
//   C  →  G14  Tatva Blue-Amber Linear  (blue→amber, white headline/body)

import type { FormatPreset } from '../presets/index';
import { pillAnchor } from '../presets/index';
import { GRADIENTS } from '../tokens/gradients';
import { gWrap } from '../anim/svgGroup';
import type { AnimMap } from '../anim/types';

export type ColorwayId = 'A' | 'B' | 'C';

export interface Layout4Params {
  headlineLines: string[];
  bodyLines: string[];
  hashtag: string;
  colorway: ColorwayId;
  preset: FormatPreset;
  // Photo is optional; if present it shows on the right half behind gradient
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
  headline: string;
  body: string;
  pillBg: string;
  pillText: string;
  accentColor: string;
  // Left-stop colour for the photo-side overlay fade (matches gradient start colour)
  photoOverlayColor: string;
}

const COLORWAYS: Record<ColorwayId, CW> = {
  A: { gradientId: 'G03', headline: '#FFC352', body: '#FFFFFF',  pillBg: '#E9695F', pillText: '#FFFFFF', accentColor: '#FFC352', photoOverlayColor: '#2F327F' },
  B: { gradientId: 'G06', headline: '#1E3A8A', body: '#1F2937',  pillBg: '#1E3A8A', pillText: '#FFFFFF', accentColor: '#1E3A8A', photoOverlayColor: '#E9695F' },
  C: { gradientId: 'G14', headline: '#FFFFFF',  body: '#FFFFFF',  pillBg: '#E9695F', pillText: '#FFFFFF', accentColor: '#FFC352', photoOverlayColor: '#1E3A8A' },
};

// Base-space text geometry (authored at 1080×1350)
const TEXT_X_BASE   = 72;   // headline/body left margin
const HEAD_TOP_BASE = 200;  // headline top (after logo)
const BODY_GAP_BASE = 36;   // gap between headline block bottom and body top

export const L4_HEAD_MAX_W = 840;
export const L4_BODY_MAX_W = 840;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2  = (n: number) => Math.round(n * 100) / 100;

export function buildLayout4Svg(p: Layout4Params): string {
  const c  = COLORWAYS[p.colorway];
  const S  = p.preset.w / 1080;
  const SY = p.preset.h / 1350;

  const TEXT_X    = TEXT_X_BASE * S;
  const headLineH = p.headlineSize * 1.18;
  const bodyLineH = p.bodySize * 1.5;

  // ── Text blocks ────────────────────────────────────────────────────────────
  const headlineDY = p.headlineDY ?? 0;
  const bodyDY     = p.bodyDY ?? 0;
  const headTop    = HEAD_TOP_BASE * SY + headlineDY;
  let cursor = headTop;
  const headTspans = p.headlineLines.map((line) => {
    const baseline = cursor + p.headlineSize * 0.82;
    cursor += headLineH;
    return `<text x="${r2(TEXT_X)}" y="${r2(baseline)}" font-family="DM Serif Display" font-weight="400" font-size="${p.headlineSize}" fill="${c.headline}">${esc(line)}</text>`;
  }).join('\n  ');

  const bodyTop = HEAD_TOP_BASE * SY + headlineDY + p.headlineLines.length * headLineH + BODY_GAP_BASE * SY + bodyDY;
  let bcur = bodyTop;
  const bodyTspans = p.bodyLines.map((line) => {
    const baseline = bcur + p.bodySize * 0.82;
    bcur += bodyLineH;
    return `<text x="${r2(TEXT_X)}" y="${r2(baseline)}" font-family="DM Sans" font-weight="400" font-size="${p.bodySize}" fill="${c.body}">${esc(line)}</text>`;
  }).join('\n  ');

  // ── Hashtag pill — BOTTOM-LEFT by design ──────────────────────────────────
  const ES = S;
  const pillH    = Math.round(44 * ES);
  const pillPadX = 24 * ES;
  const pillFont = 19 * ES;
  const textW    = (p.pillTextWidth ?? p.hashtag.length * (19 * 0.56)) * ES;
  const pillW    = Math.round(textW + pillPadX * 2);
  const side     = p.hashtagSide ?? 'left';
  const { x: pillX, y: pillY } = pillAnchor(p.preset, side, pillW, pillH);
  const pill =
    `<rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${c.pillBg}"/>` +
    `\n  <text x="${r2(pillX + pillW / 2)}" y="${r2(pillY + 29 * ES)}" text-anchor="middle" font-family="DM Sans" font-weight="700" font-size="${r2(pillFont)}" letter-spacing="${r2(0.5 * ES)}" fill="${c.pillText}">${esc(p.hashtag)}</text>`;

  // ── Logo ───────────────────────────────────────────────────────────────────
  const lw = 250 * S; const lh = 62 * S; const lx = 78 * S; const ly = 46 * S;

  // ── SVG gradient defs ─────────────────────────────────────────────────────
  const grad = GRADIENTS[c.gradientId];
  const BG_GRAD_ID = 'l4bg';

  // ── Optional photo layer (right half, tinted) ──────────────────────────────
  const hasPhoto = !!(p.photoHref && p.photoW && p.photoH);
  let photoDefs = '';
  let photoBody = '';
  if (hasPhoto && p.photoHref && p.photoW && p.photoH) {
    const photoX  = Math.round(p.preset.w * 0.45);
    const photoW  = p.preset.w - photoX;
    const cover   = Math.max(photoW / p.photoW, p.preset.h / p.photoH);
    const s       = cover * (p.scale ?? 1);
    const dw      = r2(p.photoW * s);
    const dh      = r2(p.photoH * s);
    const dx      = r2(photoX + (photoW - dw) / 2 + (p.focalX ?? 0));
    const dy      = r2((p.preset.h - dh) / 2 + (p.focalY ?? 0));
    photoDefs =
      `<clipPath id="l4photoClip"><rect x="${photoX}" y="0" width="${photoW}" height="${p.preset.h}"/></clipPath>` +
      `\n    <linearGradient id="l4photoOvl" x1="0" y1="0" x2="1" y2="0">` +
      `<stop offset="0%" stop-color="${c.photoOverlayColor}" stop-opacity="0.78"/>` +
      `<stop offset="100%" stop-color="${c.photoOverlayColor}" stop-opacity="0.1"/>` +
      `</linearGradient>`;
    photoBody =
      `<g clip-path="url(#l4photoClip)">` +
      `\n    <image href="${p.photoHref}" x="${dx}" y="${dy}" width="${dw}" height="${dh}" preserveAspectRatio="none" opacity="0.55"/>` +
      `\n    <rect x="${photoX}" y="0" width="${photoW}" height="${p.preset.h}" fill="url(#l4photoOvl)"/>` +
      `\n  </g>`;
  }

  // ── Short accent line above headline ──────────────────────────────────────
  const accentY  = r2(headTop - 18 * SY);
  const accentX1 = r2(TEXT_X);
  const accentX2 = r2(TEXT_X + 120 * S);

  // ── Animation wrappers ────────────────────────────────────────────────────
  const [hO, hC]   = gWrap(p.anim, 'headline', TEXT_X, headTop, S, SY);
  const [bO, bC]   = gWrap(p.anim, 'body', TEXT_X, bodyTop, S, SY);
  const [piO, piC] = gWrap(p.anim, 'pill', pillX + pillW / 2, pillY + pillH / 2, S, SY);
  const [loO, loC] = gWrap(p.anim, 'logo', lx + lw / 2, ly + lh / 2, S, SY);

  return `<svg width="${p.preset.w}" height="${p.preset.h}" viewBox="0 0 ${p.preset.w} ${p.preset.h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${p.fontFaceCss ? `<style>${p.fontFaceCss}</style>` : ''}
    ${grad.svgDef(BG_GRAD_ID)}
    ${photoDefs}
  </defs>

  <!-- Full-bleed gradient background -->
  <rect width="${p.preset.w}" height="${p.preset.h}" fill="url(#${BG_GRAD_ID})"/>

  <!-- Optional photo (right half, tinted) -->
  ${photoBody}

  <!-- Short accent line above headline -->
  <line x1="${accentX1}" y1="${accentY}" x2="${accentX2}" y2="${accentY}" stroke="${c.accentColor}" stroke-width="${r2(3 * S)}" stroke-linecap="round"/>

  ${loO}<image href="${p.logoHref}" x="${r2(lx)}" y="${r2(ly)}" width="${r2(lw)}" height="${r2(lh)}"/>${loC}
  ${hO}${headTspans}${hC}
  ${bO}${bodyTspans}${bC}
  ${piO}${pill}${piC}
</svg>`;
}
