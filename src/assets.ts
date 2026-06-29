// Brand + font assets. Imported so the bundler inlines them as data URIs in the
// single-file build (and serves them as URLs in dev) — same code path either way.
import teacher from './assets/default-teacher.png';
import lab from './assets/lab.jpg';
import boy from './assets/l3-boy.png';
import logoColor from './assets/logo-color.svg';
import logoWhite from './assets/logo-white.svg';
import iconColor from './assets/icon-color.svg';
import iconWhite from './assets/icon-white.svg';
// Brand master July 2026: DM Serif Display (display) + DM Sans (body)
import DMSerifDisplayRegular from './assets/DMSerifDisplay-Regular.ttf';
import DMSerifDisplayItalic from './assets/DMSerifDisplay-Italic.ttf';
import DMSansRegular from './assets/DMSans-Regular.ttf';
import DMSansMedium from './assets/DMSans-Medium.ttf';
import DMSansBold from './assets/DMSans-Bold.ttf';

export const ASSETS = {
  teacher: { href: teacher, w: 1080, h: 2022 },
  lab: { href: lab, w: 720, h: 480 },
  boy: { href: boy, w: 1010, h: 749 },
  logoColor,
  logoWhite,
  iconColor,
  iconWhite,
  fonts: [
    { family: 'DM Serif Display', weight: 400, style: 'normal',  src: DMSerifDisplayRegular },
    { family: 'DM Serif Display', weight: 400, style: 'italic',  src: DMSerifDisplayItalic },
    { family: 'DM Sans',          weight: 400, style: 'normal',  src: DMSansRegular },
    { family: 'DM Sans',          weight: 500, style: 'normal',  src: DMSansMedium },
    { family: 'DM Sans',          weight: 700, style: 'normal',  src: DMSansBold },
  ],
};

// Inject @font-face rules so preview text uses real fonts even offline (file://).
export function injectFontFaces(): void {
  if (typeof document === 'undefined' || document.getElementById('tgs-fonts')) return;
  const style = document.createElement('style');
  style.id = 'tgs-fonts';
  style.textContent = ASSETS.fonts
    .map((f) => `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:${f.style};src:url(${f.src}) format('truetype');}`)
    .join('\n');
  document.head.appendChild(style);
}
