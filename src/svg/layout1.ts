// Shared SVG builder for Layout 1 (Teacher-Centric Story Frame).
// Geometry traced from Figma node 2562:180 family. Used BY BOTH the live preview
// and the PNG export, so what you see is exactly what exports.

export type ColorwayId = 'A' | 'B' | 'C';

export interface Layout1Params {
  headlineLines: string[]; // amber Kalam, stacked
  bodyLines: string[]; // white/dark Poppins, stacked
  hashtag: string;
  colorway: ColorwayId;
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

const CARD = { x: 54, y: 138, w: 972, h: 1212, r: 40 }; // full outer card (fixed)
const TEXT_X = 114; // left padding inside the panel
const PAD_TOP = 84; // inner padding above headline
const PAD_BOTTOM = 84; // inner padding below body
const PHOTO_TOP = 138;
const PHOTO_OVERLAP = 30; // photo overlaps the panel's rounded top
const PANEL_TOP_MIN = 700; // panel can't grow past here (keep photo visible)
const PANEL_TOP_MAX = 1180; // panel can't shrink below this
const CANVAS_BOTTOM = 1350;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Dynamic layout: the blue panel grows with the text block (anchored to the
// bottom edge); the photo fills everything above it.
function computeLayout(p: Layout1Params) {
  const headLineH = p.headlineSize * 1.18;
  const bodyLineH = p.bodySize * 1.5;
  const gap = Math.round(p.bodySize * 0.9);
  const totalH = p.headlineLines.length * headLineH + gap + p.bodyLines.length * bodyLineH;
  const panelTop = clamp(CANVAS_BOTTOM - (totalH + PAD_TOP + PAD_BOTTOM), PANEL_TOP_MIN, PANEL_TOP_MAX);
  const panelH = CANVAS_BOTTOM - panelTop;
  const photoH = panelTop + PHOTO_OVERLAP - PHOTO_TOP;
  return { headLineH, bodyLineH, gap, panelTop, panelH, photoH };
}

// Photo placement: cover the (dynamic) photo region, zoomed + panned. Clip crops.
function photoPlacement(p: Layout1Params, photoH: number) {
  const cover = Math.max(CARD.w / p.photoW, photoH / p.photoH);
  const s = cover * p.scale;
  const dw = p.photoW * s;
  const dh = p.photoH * s;
  const dx = CARD.x + (CARD.w - dw) / 2 + p.focalX;
  const dy = PHOTO_TOP + (photoH - dh) / 2 + p.focalY;
  return { dx: r2(dx), dy: r2(dy), dw: r2(dw), dh: r2(dh) };
}

export function buildLayout1Svg(p: Layout1Params): string {
  const c = COLORWAY_STYLES[p.colorway];
  const L = computeLayout(p);

  // text block: top-anchored with PAD_TOP inside the (variable-height) panel.
  // headlineDY / bodyDY nudge each block vertically; left margin (TEXT_X) is fixed.
  const headlineDY = p.headlineDY ?? 0;
  const bodyDY = p.bodyDY ?? 0;
  let cursor = L.panelTop + PAD_TOP + headlineDY;
  const headTspans = p.headlineLines.map((line) => {
    const baseline = cursor + p.headlineSize * 0.82;
    cursor += L.headLineH;
    return `<text x="${TEXT_X}" y="${r2(baseline)}" font-family="Kalam" font-weight="700" font-size="${p.headlineSize}" fill="${c.headline}">${esc(line)}</text>`;
  }).join('\n  ');
  let bcur = L.panelTop + PAD_TOP + headlineDY + p.headlineLines.length * L.headLineH + L.gap + bodyDY;
  const bodyTspans = p.bodyLines.map((line) => {
    const baseline = bcur + p.bodySize * 0.82;
    bcur += L.bodyLineH;
    return `<text x="${TEXT_X}" y="${r2(baseline)}" font-family="Poppins" font-weight="400" font-size="${p.bodySize}" fill="${c.body}">${esc(line)}</text>`;
  }).join('\n  ');

  // pill: auto-sized; side switchable. Text centered so padding stays symmetric.
  const pillH = 47; const pillPadX = 27.5; const pillFont = 20;
  const pillY = L.panelTop - pillH - 5;
  const textW = p.pillTextWidth ?? p.hashtag.length * (pillFont * 0.56);
  const pillW = Math.round(textW + pillPadX * 2);
  // mirror the left inset (35px from the card edge) on the right so it never touches the frame
  const PILL_INSET = 35;
  const pillX = (p.hashtagSide ?? 'left') === 'right' ? 1026 - PILL_INSET - pillW : 54 + PILL_INSET;
  const pill = `<rect x="${pillX}" y="${r2(pillY)}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${c.pillBg}"/>
  <text x="${r2(pillX + pillW / 2)}" y="${r2(pillY + 31)}" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="${pillFont}" letter-spacing="0.5" fill="${c.pillText}">${esc(p.hashtag)}</text>`;

  const ph = photoPlacement(p, L.photoH);

  return `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
  ${p.fontFaceCss ? `<defs><style>${p.fontFaceCss}</style></defs>` : ''}
  <rect width="1080" height="1350" fill="#FFFFFF"/>
  <defs>
    <clipPath id="l1photo"><path d="${topRounded(CARD.x, PHOTO_TOP, CARD.w, L.photoH, CARD.r)}"/></clipPath>
  </defs>

  <!-- Blue panel: variable height, rounded top, square bottom (flush on the bottom edge) -->
  <path d="${topRounded(CARD.x, L.panelTop, CARD.w, L.panelH, CARD.r)}" fill="${c.panelBg}"/>

  <g clip-path="url(#l1photo)">
    <image href="${p.photoHref}" x="${ph.dx}" y="${ph.dy}" width="${ph.dw}" height="${ph.dh}" preserveAspectRatio="none"/>
  </g>

  <!-- Card border: rounded top, square bottom -->
  <path d="${topRounded(CARD.x, CARD.y, CARD.w, CARD.h, CARD.r)}" fill="none" stroke="${c.border}" stroke-width="5"/>

  ${pill}
  ${headTspans}
  ${bodyTspans}

  <image href="${p.logoHref}" x="78" y="46" width="250" height="62"/>
</svg>`;
}

// Approx photo area in 1080-space for the interactive drag overlay.
export const PHOTO_REGION = { x: 54, y: 138, w: 972, h: 762 };
