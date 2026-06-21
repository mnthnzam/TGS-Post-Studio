// Brand style-guide pages as SVG (A4 portrait @150dpi = 1240×1754).
// Caller supplies pre-rendered layout example SVGs so this stays pure (no canvas).
import { COLORS } from '../tokens/colors';
import { COLORWAYS } from '../tokens/colorways';
import { BUCKET_RULES } from '../logic/mappings';

export const GUIDE_W = 1240;
export const GUIDE_H = 1754;

export interface LayoutExample { label: string; useCase: string; svg: string }
export interface GuidePage { title: string; svg: string }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function page(bg: string, inner: string, fontFaceCss?: string): string {
  return `<svg width="${GUIDE_W}" height="${GUIDE_H}" viewBox="0 0 ${GUIDE_W} ${GUIDE_H}" xmlns="http://www.w3.org/2000/svg">
  ${fontFaceCss ? `<defs><style>${fontFaceCss}</style></defs>` : ''}
  <rect width="${GUIDE_W}" height="${GUIDE_H}" fill="${bg}"/>
  ${inner}
</svg>`;
}

const heading = (t: string, y = 150) =>
  `<text x="90" y="${y}" font-family="Kalam" font-weight="700" font-size="64" fill="#1E3A8A">${esc(t)}</text>
   <rect x="92" y="${y + 24}" width="120" height="6" rx="3" fill="#FFC352"/>`;

// embed a 1080×1350 layout SVG at a box, scaled to fit
function embed(svg: string, x: number, y: number, w: number): string {
  const h = (w / 1080) * 1350;
  const inner = svg.replace(/^<svg[^>]*>/, `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 1080 1350" preserveAspectRatio="xMidYMid meet">`);
  return inner;
}

export function buildGuidePages(examples: LayoutExample[], opts: { version?: string; logoColor: string; logoWhite: string; fontFaceCss?: string } ): GuidePage[] {
  const css = opts.fontFaceCss;
  const pages: GuidePage[] = [];

  // 1 — Cover
  pages.push({ title: 'Cover', svg: page('#F7F7F7', `
    <image href="${opts.logoColor}" x="${(GUIDE_W - 460) / 2}" y="520" width="460" height="114"/>
    <text x="${GUIDE_W / 2}" y="820" text-anchor="middle" font-family="Kalam" font-weight="700" font-size="84" fill="#1E3A8A">Social Design System</text>
    <text x="${GUIDE_W / 2}" y="900" text-anchor="middle" font-family="Poppins" font-weight="500" font-size="30" fill="#1F2937">Tatva Global School · Brand &amp; Social Guidelines</text>
    <text x="${GUIDE_W / 2}" y="1660" text-anchor="middle" font-family="Poppins" font-weight="400" font-size="22" fill="#7a7e8c">${esc(opts.version ?? 'v1')} · Maintained by Zamstars</text>
  `, css) });

  // 2 — Colour palette
  const base = Object.entries(COLORS);
  let swatches = '';
  base.forEach(([name, hex], i) => {
    const col = i % 2; const rowi = Math.floor(i / 2);
    const x = 90 + col * 540; const y = 230 + rowi * 150;
    swatches += `<rect x="${x}" y="${y}" width="120" height="120" rx="14" fill="${hex}" stroke="rgba(0,0,0,0.08)"/>
      <text x="${x + 145}" y="${y + 52}" font-family="Poppins" font-weight="600" font-size="26" fill="#1F2937">${esc(name)}</text>
      <text x="${x + 145}" y="${y + 90}" font-family="Poppins" font-weight="400" font-size="24" fill="#7a7e8c">${esc(hex)}</text>`;
  });
  // colorways row
  let cwRow = '';
  (['A', 'B', 'C'] as const).forEach((id, i) => {
    const cw = COLORWAYS[id]; const x = 90 + i * 370; const y = 1420;
    cwRow += `<rect x="${x}" y="${y}" width="330" height="150" rx="16" fill="${cw.CW_PRIMARY}"/>
      <text x="${x + 24}" y="${y + 60}" font-family="Poppins" font-weight="700" font-size="26" fill="${cw.CW_TEXT_ON_PRIMARY}">Colorway ${id}</text>
      <text x="${x + 24}" y="${y + 100}" font-family="Poppins" font-weight="400" font-size="22" fill="${cw.CW_TEXT_ON_PRIMARY}">${esc(cw.label)}</text>`;
  });
  pages.push({ title: 'Colour', svg: page('#FFFFFF', `${heading('Colour Palette')}
    ${swatches}
    <text x="90" y="1390" font-family="Poppins" font-weight="600" font-size="28" fill="#1F2937">Colorways</text>
    ${cwRow}`, css) });

  // 3 — Typography
  pages.push({ title: 'Typography', svg: page('#FFFFFF', `${heading('Typography')}
    <text x="90" y="320" font-family="Poppins" font-weight="600" font-size="28" fill="#7a7e8c">Display · Kalam</text>
    <text x="90" y="430" font-family="Kalam" font-weight="700" font-size="96" fill="#1E3A8A">Great futures begin</text>
    <text x="90" y="510" font-family="Poppins" font-weight="400" font-size="24" fill="#1F2937">Headlines, pull-quotes, CTAs. Weight 700 default. Never CSS-italicised.</text>
    <text x="90" y="700" font-family="Poppins" font-weight="600" font-size="28" fill="#7a7e8c">Body · Poppins</text>
    <text x="90" y="790" font-family="Poppins" font-weight="500" font-size="48" fill="#1F2937">The quick brown fox jumps over the lazy dog.</text>
    <text x="90" y="850" font-family="Poppins" font-weight="400" font-size="24" fill="#1F2937">Body copy, attributions, hashtag pill. Weights 300 / 400 / 500 / 600.</text>`, css) });

  // 4 — Logo
  pages.push({ title: 'Logo', svg: page('#FFFFFF', `${heading('Logo')}
    <rect x="90" y="240" width="1060" height="360" rx="20" fill="#F7F7F7"/>
    <image href="${opts.logoColor}" x="430" y="340" width="380" height="94"/>
    <text x="620" y="540" text-anchor="middle" font-family="Poppins" font-weight="400" font-size="24" fill="#7a7e8c">Colour variant · on light surfaces</text>
    <rect x="90" y="660" width="1060" height="360" rx="20" fill="#1E3A8A"/>
    <image href="${opts.logoWhite}" x="430" y="760" width="380" height="94"/>
    <text x="620" y="960" text-anchor="middle" font-family="Poppins" font-weight="400" font-size="24" fill="rgba(255,255,255,0.7)">White variant · on photos / dark surfaces</text>
    <text x="90" y="1130" font-family="Poppins" font-weight="600" font-size="28" fill="#1F2937">Non-negotiable</text>
    <text x="90" y="1180" font-family="Poppins" font-weight="400" font-size="24" fill="#1F2937">Always top-left. Fixed size. Never recoloured beyond these two variants.</text>`, css) });

  // 5 — Layouts
  let ex = '';
  examples.forEach((e, i) => {
    const x = 90 + i * 370; const w = 330;
    ex += embed(e.svg, x, 250, w);
    ex += `<text x="${x}" y="${250 + (w / 1080) * 1350 + 46}" font-family="Poppins" font-weight="600" font-size="26" fill="#1F2937">${esc(e.label)}</text>
      <text x="${x}" y="${250 + (w / 1080) * 1350 + 82}" font-family="Poppins" font-weight="400" font-size="20" fill="#7a7e8c">${esc(e.useCase)}</text>`;
  });
  pages.push({ title: 'Layouts', svg: page('#FFFFFF', `${heading('Layouts')}${ex}`, css) });

  // 6 — Rules & references
  const buckets = Object.entries(BUCKET_RULES);
  let blist = '';
  buckets.forEach(([name, r], i) => {
    const y = 700 + i * 64;
    blist += `<text x="90" y="${y}" font-family="Poppins" font-weight="500" font-size="24" fill="#1F2937">${esc(name)}</text>
      <text x="640" y="${y}" font-family="Poppins" font-weight="400" font-size="24" fill="#7a7e8c">${r.layout} · ${esc(r.hashtag)}</text>`;
  });
  pages.push({ title: 'References', svg: page('#FFFFFF', `${heading('Rules &amp; References')}
    <text x="90" y="300" font-family="Poppins" font-weight="600" font-size="28" fill="#1F2937">Non-negotiables</text>
    <text x="90" y="350" font-family="Poppins" font-weight="400" font-size="24" fill="#1F2937">Logo top-left · Hashtag pill always present · Kalam + Poppins only · 50px margins · 1080×1350.</text>
    <text x="90" y="620" font-family="Poppins" font-weight="600" font-size="28" fill="#1F2937">Content bucket → layout · hashtag</text>
    ${blist}`, css) });

  return pages;
}
