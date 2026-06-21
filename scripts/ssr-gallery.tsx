// Server-renders the real React components into one static HTML preview.
// Run: npx tsx --tsconfig tsconfig.app.json scripts/ssr-gallery.tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement as h } from 'react';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { PostRenderer } from '../src/lib/PostRenderer';
import type { PostContent, ColorwayId, LayoutId } from '../src/types';

const SAMPLES: Record<LayoutId, Omit<PostContent, 'colorway'>> = {
  L1: {
    layout: 'L1',
    headline: 'Great futures begin with great guidance.',
    accent: 'guidance.',
    body: "Our teachers don't just teach. They observe, adapt, and walk alongside each child's unique journey — building the confidence that no textbook ever could.",
    attribution: '— The Tatva Teacher Community',
    hashtag: '#TatvaPulse',
  },
  L2: {
    layout: 'L2',
    headline: 'Small experiments.\nBig learning.',
    accent: 'Big learning.',
    body: 'Exploring ideas, testing theories, and discovering more. Bringing science to life through hands-on experiences.',
    hashtag: '#TheCuriosityLab',
  },
  L3: {
    layout: 'L3',
    headline: 'Just give it\na shot!',
    accent: 'a shot!',
    body: 'Fear of failure is where growth gets stuck. At Tatva, we build the courage to try — because the best learning always starts with a leap.',
    hashtag: '#BeyondTheChalkboard',
  },
};

const LAYOUTS: LayoutId[] = ['L1', 'L2', 'L3'];
const COLORWAYS: ColorwayId[] = ['A', 'B', 'C'];
const CW_LABEL: Record<ColorwayId, string> = { A: 'Tatva Blue', B: 'Tatva Green', C: 'Learning Amber' };
const LAYOUT_LABEL: Record<LayoutId, string> = {
  L1: 'Layout 1 · Teacher-Centric Story Frame',
  L2: 'Layout 2 · Curiosity Labs (Full Bleed)',
  L3: 'Layout 3 · Beyond the Chalkboard (Cutout)',
};

const tokensCss = readFileSync(new URL('../src/tokens/tokens.css', import.meta.url), 'utf8');

let rows = '';
for (const layout of LAYOUTS) {
  let cols = '';
  for (const cw of COLORWAYS) {
    const content = { ...SAMPLES[layout], colorway: cw } as PostContent;
    const post = renderToStaticMarkup(h(PostRenderer, { content, scale: 0.42 }));
    cols += `<div class="cell"><div class="cell-label">${CW_LABEL[cw]} · organic</div>${post}</div>`;
  }
  // one boosted example per layout (preferred colorway)
  const boosted = { ...SAMPLES[layout], colorway: 'A', boosted: true } as PostContent;
  cols += `<div class="cell"><div class="cell-label">Tatva Blue · BOOSTED</div>${renderToStaticMarkup(
    h(PostRenderer, { content: boosted, scale: 0.42 }),
  )}</div>`;
  rows += `<section><h2>${LAYOUT_LABEL[layout]}</h2><div class="grid">${cols}</div></section>`;
}

const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>TGS Post Studio — Fidelity Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap" rel="stylesheet">
<style>
${tokensCss}
body { margin:0; background:#2C2F3A; font-family:'Poppins',sans-serif; padding:32px; }
h1 { color:#fff; font-size:18px; font-weight:600; letter-spacing:0.04em; }
.sub { color:rgba(255,255,255,0.45); font-size:12px; margin-bottom:24px; }
section { margin-bottom:36px; }
h2 { color:rgba(255,255,255,0.6); font-size:13px; font-weight:600; margin:0 0 12px; }
.grid { display:flex; gap:20px; flex-wrap:wrap; }
.cell { display:flex; flex-direction:column; gap:8px; }
.cell-label { color:rgba(255,255,255,0.35); font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; }
</style></head>
<body>
<h1>TGS Post Studio — Fidelity Preview</h1>
<div class="sub">Real React components, server-rendered. 3 layouts × 3 colorways + 1 boosted each. Source of truth: TGS_Design_System_v1.md</div>
${rows}
</body></html>`;

mkdirSync(new URL('../preview/', import.meta.url), { recursive: true });
const out = new URL('../preview/TGS_Post_Studio_Preview.html', import.meta.url);
writeFileSync(out, html);
console.log('Wrote', out.pathname);
