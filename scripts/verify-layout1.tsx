// Verifies the shared buildLayout1Svg() renders correctly via resvg (Node).
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildLayout1Svg } from '../src/svg/layout1';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (p: string, mime: string) => `data:${mime};base64,${readFileSync(join(root, p)).toString('base64')}`;

const svg = buildLayout1Svg({
  headlineLines: ['Great futures begin with', 'great guidance.'],
  bodyLines: ['Our teachers light the path to excellence.', 'One lesson, one conversation,', 'one breakthrough at a time.'],
  hashtag: '#TheCuriosityLab',
  colorway: 'A',
  photoHref: b64('public/photos/default-teacher.png', 'image/png'),
  photoW: 1080,
  photoH: 2022,
  scale: 1,
  focalX: 0,
  focalY: -346,
  headlineSize: 66,
  bodySize: 27,
  logoHref: b64('public/brand/logo-color.svg', 'image/svg+xml'),
});

const resvg = new Resvg(svg, {
  font: {
    fontFiles: ['Kalam-Bold.ttf', 'Kalam-Regular.ttf', 'Poppins-Regular.ttf', 'Poppins-Medium.ttf', 'Poppins-SemiBold.ttf', 'Poppins-Bold.ttf'].map((f) => join(root, 'fonts', f)),
    loadSystemFonts: false,
    defaultFontFamily: 'Poppins',
  },
  fitTo: { mode: 'width', value: 1080 },
});
writeFileSync(join(root, 'preview/layout1-shared.png'), resvg.render().asPng());

// Variant: bigger body, zoomed+panned photo, single-line headline, green colorway
const svg2 = buildLayout1Svg({
  headlineLines: ['Every child, seen.'],
  bodyLines: ['Small moments of attention become', 'lifelong confidence.'],
  hashtag: '#TatvaPulse',
  colorway: 'B',
  photoHref: b64('public/photos/default-teacher.png', 'image/png'),
  photoW: 1080, photoH: 2022,
  scale: 1.35, focalX: 70, focalY: -520,
  headlineSize: 80, bodySize: 34,
  logoHref: b64('public/brand/logo-color.svg', 'image/svg+xml'),
});
const resvg2 = new Resvg(svg2, {
  font: { fontFiles: ['Kalam-Bold.ttf', 'Kalam-Regular.ttf', 'Poppins-Regular.ttf', 'Poppins-Medium.ttf', 'Poppins-SemiBold.ttf', 'Poppins-Bold.ttf'].map((f) => join(root, 'fonts', f)), loadSystemFonts: false, defaultFontFamily: 'Poppins' },
  fitTo: { mode: 'width', value: 1080 },
});
writeFileSync(join(root, 'preview/layout1-variant.png'), resvg2.render().asPng());
console.log('ok');
