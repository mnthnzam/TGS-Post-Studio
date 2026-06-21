import { buildLayout1Svg } from '../svg/layout1';
import type { Layout1Params } from '../svg/layout1';
import { ASSETS } from '../assets';

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// Build @font-face CSS with the fonts embedded so SVG→canvas rasterization has them.
let fontCssCache: string | null = null;
async function fontFaceCss(): Promise<string> {
  if (fontCssCache) return fontCssCache;
  // ASSETS.fonts src is a data URI (single-file build) or a URL (dev). fetch()
  // handles both, so the exported SVG always carries embedded font data.
  const css = await Promise.all(
    ASSETS.fonts.map(async (f) => {
      const data = await urlToDataUrl(f.src);
      return `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:normal;src:url(${data}) format('truetype');}`;
    }),
  );
  fontCssCache = css.join('\n');
  return fontCssCache;
}

function download(dataUrl: string, name: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = name;
  a.click();
}

/**
 * Deterministic PNG export: embeds fonts + photo + logo as data URIs, rasterizes
 * the SVG via canvas at true 1080x1350. Renders identically to the Node pipeline.
 */
export async function exportLayout1Png(params: Layout1Params, fileLabel: string): Promise<void> {
  const [photoHref, logoHref, css] = await Promise.all([
    params.photoHref.startsWith('data:') ? Promise.resolve(params.photoHref) : urlToDataUrl(params.photoHref),
    params.logoHref.startsWith('data:') ? Promise.resolve(params.logoHref) : urlToDataUrl(params.logoHref),
    fontFaceCss(),
  ]);

  const svg = buildLayout1Svg({ ...params, photoHref, logoHref, fontFaceCss: css });
  const svgUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

  const img = new Image();
  img.decoding = 'sync';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('SVG image failed to load'));
    img.src = svgUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 1080, 1350);

  const slug = fileLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  download(canvas.toDataURL('image/png'), `tgs-${slug || 'post'}-${Date.now()}.png`);
}
