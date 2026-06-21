import { getModule, LAYOUTS } from '../layouts/registry';
import { ASSETS } from '../assets';
import { getLogoColor, getLogoWhite } from '../settings';
import { buildGuidePages } from '../svg/styleguide';
import type { LayoutExample } from '../svg/styleguide';
import { imagesToPdf } from '../lib/pdf';
import type { ColorwayId, LayoutId, PostDoc } from '../model';

const USE_CASES: Record<LayoutId, string> = {
  L1: 'Pulse · Director · Teacher · Voices',
  L2: 'Labs · Experiential · 3Cs',
  L3: 'Values · Sports · Culture · Alumni',
};

async function urlToDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

let fontCssCache: string | null = null;
export async function fontFaceCss(): Promise<string> {
  if (fontCssCache) return fontCssCache;
  const css = await Promise.all(
    ASSETS.fonts.map(async (f) => {
      const data = await urlToDataUrl(f.src);
      return `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:normal;src:url(${data}) format('truetype');}`;
    }),
  );
  fontCssCache = css.join('\n');
  return fontCssCache;
}

async function rasterize(svg: string, w: number, h: number, mime: string, quality = 0.95): Promise<string> {
  const url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('SVG render failed'));
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL(mime, quality);
}

function download(dataUrl: string, name: string) {
  const a = document.createElement('a');
  a.href = dataUrl; a.download = name; a.click();
}
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  download(url, name);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'post';
}

async function resolveDoc(doc: PostDoc): Promise<{ photoHref: string; logoHref?: string }> {
  const photoHref = doc.photo ? await urlToDataUrl(doc.photo.src) : await urlToDataUrl(ASSETS.teacher.href);
  return { photoHref };
}

// ---- single / batch image export ----
export async function exportDocImage(doc: PostDoc, fmt: 'png' | 'jpg' = 'png'): Promise<void> {
  const mod = getModule(doc.layoutId);
  const css = await fontFaceCss();
  const { photoHref } = await resolveDoc(doc);
  const useColor = doc.layoutId === 'L1' || (doc.layoutId === 'L3' && doc.colorway === 'C');
  const logoHref = await urlToDataUrl(useColor ? getLogoColor() : getLogoWhite());
  const svg = mod.build(doc, { photoHref, logoHref, fontFaceCss: css });
  const mime = fmt === 'png' ? 'image/png' : 'image/jpeg';
  download(await rasterize(svg, 1080, 1350, mime), `tgs-${slug(doc.name || doc.hashtag)}-${doc.colorway}.${fmt}`);
}

export const exportDocPng = (doc: PostDoc) => exportDocImage(doc, 'png');

// ---- colorway variants (3 PNGs) ----
export async function exportColorwayVariants(doc: PostDoc): Promise<void> {
  for (const cw of ['A', 'B', 'C'] as ColorwayId[]) {
    await exportDocImage({ ...doc, colorway: cw }, 'png');
  }
}

// ---- captions CSV ----
export function exportCaptionsCsv(docs: PostDoc[]): void {
  const q = (s: string) => `"${(s ?? '').replace(/"/g, '""')}"`;
  const rows = [['Name', 'Layout', 'Colorway', 'Headline', 'Body', 'Hashtag', 'Caption'].join(',')];
  for (const d of docs) {
    rows.push([q(d.name), d.layoutId, d.colorway, q(d.headline), q(d.body), q(d.hashtag), q(d.caption ?? '')].join(','));
  }
  downloadBlob(new Blob([rows.join('\n')], { type: 'text/csv' }), `tgs-captions-${Date.now()}.csv`);
}

// ---- project backup ----
export function exportProjectJson(docs: PostDoc[]): void {
  downloadBlob(new Blob([JSON.stringify({ version: 1, posts: docs }, null, 2)], { type: 'application/json' }), `tgs-project-${Date.now()}.json`);
}
export async function readProjectJson(file: File): Promise<PostDoc[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  const posts = Array.isArray(data) ? data : data.posts;
  if (!Array.isArray(posts)) throw new Error('Not a valid project file');
  return posts as PostDoc[];
}

// ---- style guide ----
async function buildGuide(): Promise<{ svg: string; title: string }[]> {
  const css = await fontFaceCss();
  const logoColor = await urlToDataUrl(getLogoColor());
  const logoWhite = await urlToDataUrl(getLogoWhite());
  const examples: LayoutExample[] = [];
  for (const m of LAYOUTS) {
    const d = m.newDoc();
    const photoHref = d.photo ? await urlToDataUrl(d.photo.src) : undefined;
    const logoHref = m.id === 'L1' ? logoColor : logoWhite;
    examples.push({ label: m.label, useCase: USE_CASES[m.id], svg: m.build(d, { photoHref, logoHref }) });
  }
  return buildGuidePages(examples, { version: 'v1.1', logoColor, logoWhite, fontFaceCss: css });
}

export async function exportStyleGuide(formats: { pdf?: boolean; html?: boolean; png?: boolean }): Promise<void> {
  const pages = await buildGuide();
  const W = 1240, H = 1754;

  if (formats.png) {
    for (let i = 0; i < pages.length; i++) {
      download(await rasterize(pages[i].svg, W, H, 'image/png'), `tgs-styleguide-${i + 1}-${slug(pages[i].title)}.png`);
    }
  }
  if (formats.pdf) {
    const jpegs: string[] = [];
    for (const pg of pages) {
      const dataUrl = await rasterize(pg.svg, W, H, 'image/jpeg', 0.92);
      jpegs.push(atob(dataUrl.split(',')[1]));
    }
    downloadBlob(imagesToPdf(jpegs, W, H), `tgs-styleguide-${Date.now()}.pdf`);
  }
  if (formats.html) {
    const body = pages.map((p) => `<section style="margin:0 auto 24px;max-width:1240px">${p.svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}</section>`).join('\n');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>TGS Style Guide</title><style>body{margin:0;background:#e9ecf2;padding:24px;font-family:sans-serif}</style></head><body>${body}</body></html>`;
    downloadBlob(new Blob([html], { type: 'text/html' }), `tgs-styleguide-${Date.now()}.html`);
  }
}
