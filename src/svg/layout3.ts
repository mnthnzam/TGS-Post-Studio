// Shared SVG builder for Layout 3 (Beyond the Chalkboard — cutout + flower burst).
// Geometry from Figma node 2562:213 family. Flower + grid recreated as recolorable
// SVG; the child is a transparent cutout PNG. Preview == export.

export type ColorwayId = 'A' | 'B' | 'C';

export interface Layout3Params {
  headlineLines: string[];
  bodyLines: string[];
  hashtag: string;
  colorway: ColorwayId;
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
function customShapes(shapes: NonNullable<Layout3Params['customShapes']>): string {
  return shapes.map((s) => {
    const w = s.baseW * s.scale;
    const h = s.baseH * s.scale;
    return `<g transform="translate(${r2(s.x)} ${r2(s.y)}) rotate(${s.rotate})"><image href="${s.dataUri}" x="${r2(-w / 2)}" y="${r2(-h / 2)}" width="${r2(w)}" height="${r2(h)}"/></g>`;
  }).join('');
}

function grid(color: string): string {
  let lines = '';
  for (let x = 0; x <= 1080; x += 108) lines += `<line x1="${x}" y1="0" x2="${x}" y2="1350" stroke="${color}" stroke-width="1.5"/>`;
  for (let y = 0; y <= 1350; y += 108) lines += `<line x1="0" y1="${y}" x2="1080" y2="${y}" stroke="${color}" stroke-width="1.5"/>`;
  return lines;
}

// Cutout placement: anchored bottom-right, scaled by `scale`, panned by focal.
function cutoutPlacement(p: Layout3Params) {
  const baseW = 820; // default render width at scale 1
  const s = (baseW / p.photoW) * p.scale;
  const dw = p.photoW * s;
  const dh = p.photoH * s;
  const dx = 1080 - dw + p.focalX; // right-anchored
  const dy = 1350 - dh + p.focalY; // bottom-anchored
  return { dx: r2(dx), dy: r2(dy), dw: r2(dw), dh: r2(dh) };
}

export function buildLayout3Svg(p: Layout3Params): string {
  const c = STYLES[p.colorway];
  const headLineH = p.headlineSize * 1.05;
  const bodyLineH = p.bodySize * 1.45;

  const headlineDY = p.headlineDY ?? 0;
  const bodyDY = p.bodyDY ?? 0;
  let cur = HEAD_TOP + headlineDY;
  const headTspans = p.headlineLines.map((line) => {
    const baseline = cur + p.headlineSize * 0.86;
    cur += headLineH;
    return `<text x="54" y="${r2(baseline)}" font-family="Kalam" font-weight="700" font-size="${p.headlineSize}" fill="${c.headline}">${esc(line)}</text>`;
  }).join('\n  ');
  let bcur = BODY_TOP + bodyDY;
  const bodyTspans = p.bodyLines.map((line) => {
    const baseline = bcur + p.bodySize * 0.82;
    bcur += bodyLineH;
    return `<text x="54" y="${r2(baseline)}" font-family="Poppins" font-weight="400" font-size="${p.bodySize}" fill="${c.body}">${esc(line)}</text>`;
  }).join('\n  ');
  const pillY = bcur + 18;

  const pillH = 47; const pillPadX = 27.5; const pillFont = 20;
  const textW = p.pillTextWidth ?? p.hashtag.length * (pillFont * 0.56);
  const pillW = Math.round(textW + pillPadX * 2);
  const pillX = (p.hashtagSide ?? 'left') === 'right' ? 1026 - pillW : 54;
  const pill = `<rect x="${pillX}" y="${r2(pillY)}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${c.pillBg}"/>
  <text x="${r2(pillX + pillW / 2)}" y="${r2(pillY + 31)}" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="${pillFont}" letter-spacing="0.5" fill="${c.pillText}">${esc(p.hashtag)}</text>`;

  const cut = cutoutPlacement(p);

  return `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
  ${p.fontFaceCss ? `<defs><style>${p.fontFaceCss}</style></defs>` : ''}
  <rect width="1080" height="1350" fill="${c.bg}"/>
  ${grid(c.grid)}
  ${flower(700 + (p.shapeX ?? 0), 600 + (p.shapeY ?? 0), p.shapeRotate ?? 0, p.shapeScale ?? 1, c.flower)}
  ${p.customShapes && p.customShapes.length ? customShapes(p.customShapes) : ''}
  <image href="${p.photoHref}" x="${cut.dx}" y="${cut.dy}" width="${cut.dw}" height="${cut.dh}" preserveAspectRatio="none"/>

  <image href="${p.logoHref}" x="54" y="54" width="283" height="70"/>
  ${headTspans}
  ${bodyTspans}
  ${pill}
</svg>`;
}

export { HEAD_MAX_W as L3_HEAD_MAX_W, BODY_MAX_W as L3_BODY_MAX_W };
