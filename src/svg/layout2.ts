// Shared SVG builder for Layout 2 (Curiosity Labs — full-bleed + organic blob).
// Geometry from Figma node 2562:198 family. Preview == export.

export type ColorwayId = 'A' | 'B' | 'C';

export interface Layout2Params {
  headlineLines: string[];
  bodyLines: string[];
  hashtag: string;
  colorway: ColorwayId;
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
}

interface CW { blob: string; headline: string; body: string; pillBg: string; pillText: string; }
const STYLES: Record<ColorwayId, CW> = {
  A: { blob: '#2A2A86', headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF' },
  B: { blob: '#0B7A53', headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF' },
  C: { blob: '#FFC352', headline: '#1E3A8A', body: '#1F2937', pillBg: '#1E3A8A', pillText: '#FFFFFF' },
};

// Exact organic blob (Figma node 2562:200), bottom-anchored (translate y so its
// bottom edge — path y=1044 — lands on the canvas bottom, 1350).
const BLOB_D = 'M-191 1044H1147.5C1147.5 1044 1062 791 773.5 817C773.5 817 793.889 709.133 734 566.5C674.111 423.867 471.311 332.948 29.8612 519.859C29.8612 519.859 347.838 83.5354 -191 0V1044Z';
const BLOB_TY = 306; // 1350 - 1044

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = (n: number) => Math.round(n * 100) / 100;

const HEAD_TOP = 889; // Figma headline top
const BODY_GAP = 40; // headline block → body
const HEAD_MAX_W = 640;
const BODY_MAX_W = 600;

export function photoPlacement2(p: Layout2Params) {
  const cover = Math.max(1080 / p.photoW, 1350 / p.photoH);
  const s = cover * p.scale;
  const dw = p.photoW * s;
  const dh = p.photoH * s;
  return { dx: r2((1080 - dw) / 2 + p.focalX), dy: r2((1350 - dh) / 2 + p.focalY), dw: r2(dw), dh: r2(dh) };
}

export function buildLayout2Svg(p: Layout2Params): string {
  const c = STYLES[p.colorway];
  const headLineH = p.headlineSize * 1.2;
  const bodyLineH = p.bodySize * 1.45;

  const headlineDY = p.headlineDY ?? 0;
  const bodyDY = p.bodyDY ?? 0;
  let cursor = HEAD_TOP + headlineDY;
  const headTspans = p.headlineLines.map((line) => {
    const baseline = cursor + p.headlineSize * 0.86;
    cursor += headLineH;
    return `<text x="54" y="${r2(baseline)}" font-family="Kalam" font-weight="700" font-size="${p.headlineSize}" fill="${c.headline}">${esc(line)}</text>`;
  }).join('\n  ');
  let bcur = HEAD_TOP + headlineDY + p.headlineLines.length * headLineH + BODY_GAP + bodyDY;
  const bodyTspans = p.bodyLines.map((line) => {
    const baseline = bcur + p.bodySize * 0.82;
    bcur += bodyLineH;
    return `<text x="54" y="${r2(baseline)}" font-family="Poppins" font-weight="400" font-size="${p.bodySize}" fill="${c.body}">${esc(line)}</text>`;
  }).join('\n  ');

  // pill: side switchable (default right). Text centered.
  const pillH = 42; const pillPadX = 22; const pillFont = 19;
  const textW = p.pillTextWidth ?? p.hashtag.length * (pillFont * 0.56);
  const pillW = Math.round(textW + pillPadX * 2);
  const side = p.hashtagSide ?? 'right';
  const pillX = side === 'left' ? 54 : 1026 - pillW;
  // on the left the body sits above the pill — if the body grows, drop the pill
  // below it (clamped to a safe bottom) so they don't overlap. Right side is clear.
  const pillY = side === 'left' ? Math.min(1288, Math.max(1254, bcur + 14)) : 1254;
  const pill = `<rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${c.pillBg}"/>
  <text x="${r2(pillX + pillW / 2)}" y="${pillY + 28}" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="${pillFont}" letter-spacing="0.5" fill="${c.pillText}">${esc(p.hashtag)}</text>`;

  const ph = photoPlacement2(p);

  return `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
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

  <rect width="1080" height="1350" fill="#0E1C50"/>
  <image href="${p.photoHref}" x="${ph.dx}" y="${ph.dy}" width="${ph.dw}" height="${ph.dh}" preserveAspectRatio="none"/>
  <rect width="1080" height="1350" fill="url(#l2top)"/>

  <g transform="translate(0 ${BLOB_TY})" filter="url(#l2shadow)">
    <path d="${BLOB_D}" fill="${c.blob}"/>
  </g>

  <image href="${p.logoHref}" x="54" y="54" width="283" height="70"/>

  ${headTspans}
  ${bodyTspans}
  ${pill}
</svg>`;
}

export { HEAD_MAX_W as L2_HEAD_MAX_W, BODY_MAX_W as L2_BODY_MAX_W };
