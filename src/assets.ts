// Brand + font assets. Imported so the bundler inlines them as data URIs in the
// single-file build (and serves them as URLs in dev) — same code path either way.
import teacher from './assets/default-teacher.png';
import lab from './assets/lab.jpg';
import boy from './assets/l3-boy.png';
import logoColor from './assets/logo-color.svg';
import logoWhite from './assets/logo-white.svg';
import KalamBold from './assets/Kalam-Bold.ttf';
import KalamRegular from './assets/Kalam-Regular.ttf';
import PoppinsRegular from './assets/Poppins-Regular.ttf';
import PoppinsSemiBold from './assets/Poppins-SemiBold.ttf';
import PoppinsBold from './assets/Poppins-Bold.ttf';

export const ASSETS = {
  teacher: { href: teacher, w: 1080, h: 2022 },
  lab: { href: lab, w: 720, h: 480 },
  boy: { href: boy, w: 1010, h: 749 },
  logoColor,
  logoWhite,
  fonts: [
    { family: 'Kalam', weight: 700, src: KalamBold },
    { family: 'Kalam', weight: 400, src: KalamRegular },
    { family: 'Poppins', weight: 400, src: PoppinsRegular },
    { family: 'Poppins', weight: 600, src: PoppinsSemiBold },
    { family: 'Poppins', weight: 700, src: PoppinsBold },
  ],
};

// Inject @font-face rules so preview text uses real fonts even offline (file://).
export function injectFontFaces(): void {
  if (typeof document === 'undefined' || document.getElementById('tgs-fonts')) return;
  const style = document.createElement('style');
  style.id = 'tgs-fonts';
  style.textContent = ASSETS.fonts
    .map((f) => `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:normal;src:url(${f.src}) format('truetype');}`)
    .join('\n');
  document.head.appendChild(style);
}
