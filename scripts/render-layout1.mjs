// Renders the real Layout 1 to PNG via resvg (no browser). Faithful to Figma geometry.
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');
const b64 = (p, mime) => `data:${mime};base64,${readFileSync(p).toString('base64')}`;

const photo = b64(join(root, 'public/photos/teacher_raw_a.png'), 'image/png');
const logo = b64(join(root, 'public/brand/logo-color.svg'), 'image/svg+xml');

// rounded-rect path helpers
const topRounded = (x, y, w, h, r) =>
  `M${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} L${x},${y + h} Z`;
const botRounded = (x, y, w, h, r) =>
  `M${x},${y} L${x + w},${y} L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} Z`;

// Geometry (Figma, artboard-relative)
const CARD = { x: 54, y: 138, w: 972, h: 1212, r: 40 };
const PHOTO = { x: 54, y: 138, w: 972, h: 755 };
const PANEL = { x: 54, y: 893, w: 972, h: 457 };

const svg = `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1350" fill="#FFFFFF"/>

  <defs>
    <clipPath id="photoClip"><path d="${topRounded(PHOTO.x, PHOTO.y, PHOTO.w, PHOTO.h, CARD.r)}"/></clipPath>
  </defs>

  <!-- Photo: source 1080x2022, scaled to width (s=0.9 -> 972x1820), manually
       offset so the teacher (face ~row 1116 in scaled space) sits ~30% down the frame. -->
  <g clip-path="url(#photoClip)">
    <image href="${photo}" x="${PHOTO.x}" y="-740" width="972" height="1820" preserveAspectRatio="none"/>
  </g>

  <!-- Blue text panel -->
  <path d="${botRounded(PANEL.x, PANEL.y, PANEL.w, PANEL.h, CARD.r)}" fill="#1E3A8A"/>

  <!-- Card navy border -->
  <rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}" fill="none" stroke="#1E3A8A" stroke-width="5"/>

  <!-- Coral hashtag pill (bottom-left, overlapping the seam) -->
  <rect x="89" y="811" width="261" height="47" rx="23.5" fill="#E9695F"/>
  <text x="${89 + 261 / 2}" y="${811 + 31}" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="20" letter-spacing="0.5" fill="#FFFFFF">#TheCuriosityLab</text>

  <!-- Kalam headline (amber) -->
  <text x="114" y="1008" font-family="Kalam" font-weight="700" font-size="66" fill="#FFC352">Great futures begin with</text>
  <text x="114" y="1086" font-family="Kalam" font-weight="700" font-size="66" fill="#FFC352">great guidance.</text>

  <!-- Body (white) -->
  <text x="114" y="1182" font-family="Poppins" font-weight="400" font-size="27" fill="#FFFFFF">Our teachers light the path to excellence.</text>
  <text x="114" y="1219" font-family="Poppins" font-weight="400" font-size="27" fill="#FFFFFF">One lesson, one conversation,</text>
  <text x="114" y="1256" font-family="Poppins" font-weight="400" font-size="27" fill="#FFFFFF">one breakthrough at a time.</text>

  <!-- Logo (color variant), top-left header band -->
  <image href="${logo}" x="80" y="48" width="223" height="55"/>
</svg>`;

const resvg = new Resvg(svg, {
  font: {
    fontFiles: [
      'fonts/Kalam-Bold.ttf', 'fonts/Kalam-Regular.ttf',
      'fonts/Poppins-Regular.ttf', 'fonts/Poppins-Medium.ttf',
      'fonts/Poppins-SemiBold.ttf', 'fonts/Poppins-Bold.ttf',
    ].map((f) => join(root, f)),
    loadSystemFonts: false,
    defaultFontFamily: 'Poppins',
  },
  fitTo: { mode: 'width', value: 1080 },
});
const png = resvg.render().asPng();
mkdirSync(join(root, 'preview'), { recursive: true });
const out = join(root, 'preview/layout1.png');
writeFileSync(out, png);
console.log('Wrote', out, png.length, 'bytes');
