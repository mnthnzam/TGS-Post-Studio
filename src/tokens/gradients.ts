// Gradient catalogue — 14 swatches from Figma TATVA-x-SHIVA node 1:6609.
//
// G01/G02 are the large mesh gradients (image-based in Figma; approximated as
// radial SVG gradients here — use as decorative backgrounds only).
// G03–G14 are the 12 fully programmatic gradients extracted from Figma.
//
// Each entry exposes:
//   svgDef(id)   — returns a <linearGradient> or <radialGradient> SVG element
//                  to inject into a <defs> block; the gradient paints via fill="url(#id)"
//   cssPreview   — CSS background-image for swatches in the brand-doc / editor
//   headline     — text colour to use on this background
//   body         — body text colour
//   pillBg       — hashtag pill background
//   pillText     — hashtag pill text
//   logoVariant  — 'white' or 'dark' logo

export interface GradientStyle {
  id: string;
  label: string;
  type: 'linear' | 'radial' | 'angular';
  palette: string;
  /** Returns the SVG gradient element (<linearGradient> or <radialGradient>)
   *  to embed inside <defs>. gradId will become the element's id attribute,
   *  used as fill="url(#gradId)" on the target rect. */
  svgDef: (gradId: string) => string;
  /** CSS background-image string for preview swatches. */
  cssPreview: string;
  headline: string;
  body: string;
  pillBg: string;
  pillText: string;
  logoVariant: 'white' | 'dark';
}

// ─── Gradient rows from Figma ────────────────────────────────────────────────
// Row 1 (large mesh swatches) ─ nodes 1:6610, 1:6611
// Row 2 (Teal-Indigo palette) ─ nodes 1:6612 (L), 1:6616 (R), 1:6620 (Angular)
// Row 3 (Orange-Amber palette) ─ nodes 1:6613 (L), 1:6617 (R), 1:6621 (Angular)
// Row 4 (Mint-Amber palette)   ─ nodes 1:6614 (L), 1:6618 (R), 1:6622 (Angular)
// Row 5 (bottom mix)           ─ nodes 1:6615 (R), 1:6619 (R), 1:6623 (L)

export const GRADIENTS: Record<string, GradientStyle> = {

  // ── Row 1: Mesh gradients (image-based in Figma; SVG approximation) ──────
  G01: {
    id: 'G01', label: 'Teal-Indigo Mesh', type: 'radial', palette: 'Teal-Indigo',
    svgDef: (gid) =>
      `<radialGradient id="${gid}" cx="30%" cy="40%" r="75%" gradientUnits="objectBoundingBox">` +
      `<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>` +
      `<stop offset="35%" stop-color="#0B7A53" stop-opacity="0.8"/>` +
      `<stop offset="100%" stop-color="#0D0C9B"/>` +
      `</radialGradient>`,
    cssPreview: 'radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.9) 0%, #0B7A53 35%, #0D0C9B 100%)',
    headline: '#FFC352', body: '#FFFFFF', pillBg: '#FFC352', pillText: '#1F2937', logoVariant: 'white',
  },

  G02: {
    id: 'G02', label: 'Teal-Indigo Mesh Alt', type: 'radial', palette: 'Teal-Indigo',
    svgDef: (gid) =>
      `<radialGradient id="${gid}" cx="60%" cy="50%" r="70%" gradientUnits="objectBoundingBox">` +
      `<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>` +
      `<stop offset="40%" stop-color="#0B7A53" stop-opacity="0.7"/>` +
      `<stop offset="100%" stop-color="#1E3A8A"/>` +
      `</radialGradient>`,
    cssPreview: 'radial-gradient(ellipse at 60% 50%, rgba(255,255,255,0.85) 0%, rgba(11,122,83,0.7) 40%, #1E3A8A 100%)',
    headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF', logoVariant: 'white',
  },

  // ── Row 2: Teal-Indigo palette ─────────────────────────────────────────────
  // Figma node 1:6612 — linear-gradient(233.78deg, rgb(47,50,127) 5.53%, rgb(11,122,83) 100.76%)
  G03: {
    id: 'G03', label: 'Teal-Indigo Linear', type: 'linear', palette: 'Teal-Indigo',
    svgDef: (gid) =>
      `<linearGradient id="${gid}" x1="0.94" y1="0.06" x2="0.06" y2="0.94">` +
      `<stop offset="5.53%" stop-color="#2F327F"/>` +
      `<stop offset="100%" stop-color="#0B7A53"/>` +
      `</linearGradient>`,
    cssPreview: 'linear-gradient(234deg, #2F327F 5.53%, #0B7A53 100%)',
    headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF', logoVariant: 'white',
  },

  // Figma node 1:6616 — radialGradient: #2F327F → #1D5669 → #0B7A53 (focal bottom-right)
  G04: {
    id: 'G04', label: 'Teal-Indigo Radial', type: 'radial', palette: 'Teal-Indigo',
    svgDef: (gid) =>
      `<radialGradient id="${gid}" cx="77%" cy="100%" r="90%" gradientUnits="objectBoundingBox">` +
      `<stop offset="0%" stop-color="#2F327F"/>` +
      `<stop offset="48%" stop-color="#1D5669"/>` +
      `<stop offset="100%" stop-color="#0B7A53"/>` +
      `</radialGradient>`,
    cssPreview: 'radial-gradient(ellipse at 77% 100%, #2F327F, #1D5669 48%, #0B7A53)',
    headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF', logoVariant: 'white',
  },

  // Figma node 1:6620 — conic-gradient: #2F327F → #1D5669 → #0B7A53 (SVG approximated as linear)
  G05: {
    id: 'G05', label: 'Teal-Indigo Angular', type: 'angular', palette: 'Teal-Indigo',
    svgDef: (gid) =>
      `<linearGradient id="${gid}" x1="0.94" y1="0.06" x2="0.06" y2="0.94">` +
      `<stop offset="0%" stop-color="#2F327F"/>` +
      `<stop offset="50%" stop-color="#1D5669"/>` +
      `<stop offset="100%" stop-color="#0B7A53"/>` +
      `</linearGradient>`,
    cssPreview: 'conic-gradient(from 90deg at 50% 50%, #2F327F 0%, #1D5669 30%, #0B7A53 60%, #1D5669 80%, #2F327F 100%)',
    headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF', logoVariant: 'white',
  },

  // ── Row 3: Orange-Amber palette ────────────────────────────────────────────
  // Figma node 1:6613 — linear-gradient(235.31deg, rgb(233,105,95) 7.34%, rgb(255,195,82) 100.66%)
  G06: {
    id: 'G06', label: 'Orange-Amber Linear', type: 'linear', palette: 'Orange-Amber',
    svgDef: (gid) =>
      `<linearGradient id="${gid}" x1="0.94" y1="0.06" x2="0.06" y2="0.94">` +
      `<stop offset="7.34%" stop-color="#E9695F"/>` +
      `<stop offset="100%" stop-color="#FFC352"/>` +
      `</linearGradient>`,
    cssPreview: 'linear-gradient(235deg, #E9695F 7.34%, #FFC352 100%)',
    headline: '#1E3A8A', body: '#1F2937', pillBg: '#1E3A8A', pillText: '#FFFFFF', logoVariant: 'dark',
  },

  // Figma node 1:6617 — radialGradient: #FFC352 → #C2B152 → #859E53 → #0B7A53
  G07: {
    id: 'G07', label: 'Amber-Green Radial', type: 'radial', palette: 'Orange-Amber',
    svgDef: (gid) =>
      `<radialGradient id="${gid}" cx="77%" cy="100%" r="90%" gradientUnits="objectBoundingBox">` +
      `<stop offset="0%" stop-color="#FFC352"/>` +
      `<stop offset="24%" stop-color="#C2B152"/>` +
      `<stop offset="48%" stop-color="#859E53"/>` +
      `<stop offset="96%" stop-color="#0B7A53"/>` +
      `</radialGradient>`,
    cssPreview: 'radial-gradient(ellipse at 77% 100%, #FFC352, #C2B152 24%, #859E53 48%, #0B7A53 96%)',
    headline: '#1E3A8A', body: '#1F2937', pillBg: '#E9695F', pillText: '#FFFFFF', logoVariant: 'dark',
  },

  // Figma node 1:6621 — conic: #2F327F → #E9695F → back (SVG approximated as linear diagonal)
  G08: {
    id: 'G08', label: 'Indigo-Red Angular', type: 'angular', palette: 'Orange-Amber',
    svgDef: (gid) =>
      `<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0%" stop-color="#2F327F"/>` +
      `<stop offset="50%" stop-color="#E9695F"/>` +
      `<stop offset="100%" stop-color="#2F327F"/>` +
      `</linearGradient>`,
    cssPreview: 'conic-gradient(from 90deg at 50% 50%, #2F327F 0%, #E9695F 60%, #2F327F 100%)',
    headline: '#FFC352', body: '#FFFFFF', pillBg: '#FFC352', pillText: '#1F2937', logoVariant: 'white',
  },

  // ── Row 4: Mint-Amber palette ──────────────────────────────────────────────
  // Figma node 1:6614 — linear-gradient(235.31deg, rgb(233,247,239) 7.34%, rgb(255,195,82) 100.66%)
  G09: {
    id: 'G09', label: 'Leaf Mint–Amber Linear', type: 'linear', palette: 'Mint-Amber',
    svgDef: (gid) =>
      `<linearGradient id="${gid}" x1="0.94" y1="0.06" x2="0.06" y2="0.94">` +
      `<stop offset="7.34%" stop-color="#E9F7EF"/>` +
      `<stop offset="100%" stop-color="#FFC352"/>` +
      `</linearGradient>`,
    cssPreview: 'linear-gradient(235deg, #E9F7EF 7.34%, #FFC352 100%)',
    headline: '#0B7A53', body: '#1F2937', pillBg: '#0B7A53', pillText: '#FFFFFF', logoVariant: 'dark',
  },

  // Figma node 1:6618 — radialGradient: #E9F7EF → #60A5B4 → #0E7490
  G10: {
    id: 'G10', label: 'Mint–Secondary Blue Radial', type: 'radial', palette: 'Mint-Blue',
    svgDef: (gid) =>
      `<radialGradient id="${gid}" cx="77%" cy="100%" r="90%" gradientUnits="objectBoundingBox">` +
      `<stop offset="0%" stop-color="#E9F7EF"/>` +
      `<stop offset="48%" stop-color="#60A5B4"/>` +
      `<stop offset="96%" stop-color="#0E7490"/>` +
      `</radialGradient>`,
    cssPreview: 'radial-gradient(ellipse at 77% 100%, #E9F7EF, #60A5B4 48%, #0E7490 96%)',
    headline: '#1E3A8A', body: '#1F2937', pillBg: '#1E3A8A', pillText: '#FFFFFF', logoVariant: 'dark',
  },

  // Figma node 1:6622 — conic: #1F2937 (dark) → #F7EFE3 (cream) → back (SVG as vertical linear)
  G11: {
    id: 'G11', label: 'Dark–Cream Angular', type: 'angular', palette: 'Dark-Cream',
    svgDef: (gid) =>
      `<linearGradient id="${gid}" x1="0.5" y1="0" x2="0.5" y2="1">` +
      `<stop offset="0%" stop-color="#1F2937"/>` +
      `<stop offset="50%" stop-color="#8B8C8D"/>` +
      `<stop offset="100%" stop-color="#F7EFE3"/>` +
      `</linearGradient>`,
    cssPreview: 'conic-gradient(from 90deg at 50% 50%, #1F2937 0%, #8B8C8D 45%, #F7EFE3 60%, #8B8C8D 80%, #1F2937 100%)',
    headline: '#FFC352', body: '#FFFFFF', pillBg: '#FFC352', pillText: '#1F2937', logoVariant: 'white',
  },

  // ── Row 5: Bottom mix ──────────────────────────────────────────────────────
  // Figma node 1:6615 — radialGradient: #FFC352 → #C3AF62 → #879E72 → #4B8D82 → #0E7490
  G12: {
    id: 'G12', label: 'Amber–Secondary Blue Radial', type: 'radial', palette: 'Amber-Blue',
    svgDef: (gid) =>
      `<radialGradient id="${gid}" cx="83%" cy="26%" r="100%" gradientUnits="objectBoundingBox">` +
      `<stop offset="0%" stop-color="#FFC352"/>` +
      `<stop offset="24%" stop-color="#C3AF62"/>` +
      `<stop offset="48%" stop-color="#879E72"/>` +
      `<stop offset="72%" stop-color="#4B8D82"/>` +
      `<stop offset="96%" stop-color="#0E7490"/>` +
      `</radialGradient>`,
    cssPreview: 'radial-gradient(ellipse at 83% 26%, #FFC352, #C3AF62 24%, #879E72 48%, #4B8D82 72%, #0E7490 96%)',
    headline: '#1E3A8A', body: '#1F2937', pillBg: '#E9695F', pillText: '#FFFFFF', logoVariant: 'dark',
  },

  // Figma node 1:6619 — radialGradient: #0E7490 → #0D7772 → #0B7A53
  G13: {
    id: 'G13', label: 'Teal–TatvaGreen Radial', type: 'radial', palette: 'Teal-Green',
    svgDef: (gid) =>
      `<radialGradient id="${gid}" cx="77%" cy="100%" r="90%" gradientUnits="objectBoundingBox">` +
      `<stop offset="0%" stop-color="#0E7490"/>` +
      `<stop offset="48%" stop-color="#0D7772"/>` +
      `<stop offset="96%" stop-color="#0B7A53"/>` +
      `</radialGradient>`,
    cssPreview: 'radial-gradient(ellipse at 77% 100%, #0E7490, #0D7772 48%, #0B7A53 96%)',
    headline: '#FFC352', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF', logoVariant: 'white',
  },

  // Figma node 1:6623 — linear-gradient(116.90deg, rgb(30,58,138) 8.65%, rgb(255,195,82) 109.25%)
  G14: {
    id: 'G14', label: 'Tatva Blue–Amber Linear', type: 'linear', palette: 'Blue-Amber',
    svgDef: (gid) =>
      `<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="8.65%" stop-color="#1E3A8A"/>` +
      `<stop offset="100%" stop-color="#FFC352"/>` +
      `</linearGradient>`,
    cssPreview: 'linear-gradient(117deg, #1E3A8A 8.65%, #FFC352 109.25%)',
    headline: '#FFFFFF', body: '#FFFFFF', pillBg: '#E9695F', pillText: '#FFFFFF', logoVariant: 'white',
  },
};

export type GradientId = keyof typeof GRADIENTS;
export const GRADIENT_LIST: GradientStyle[] = Object.values(GRADIENTS);

// Convenience lookup — safe; returns undefined if id is unknown.
export function getGradient(id: string): GradientStyle | undefined {
  return GRADIENTS[id];
}
