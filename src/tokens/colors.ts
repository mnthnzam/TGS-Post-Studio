// Design tokens — base colour palette.
// Source of truth: TGS Brand Master Deliverable v1.0 (July 2026) §07 — The Tatva Palette.
// Updated July 2026: added warmOrange + lavenderGrey; fixed spelling hashtagCorral → hashtagCoral.
export const COLORS = {
  tatvaBlue: '#1E3A8A',       // Primary brand colour
  tatvaGreen: '#0B7A53',      // Primary brand colour
  learningAmber: '#FFC352',   // Accent, highlight, energy — also Gold Rule colour
  hashtagCoral: '#E9695F',    // Hashtag pill default background
  warmOrange: '#F17833',      // NEW July 2026 — secondary warm accent
  secondaryBlue: '#0E7490',   // Teal-blue accent
  whisperWhite: '#F7F7F7',    // Background / light surface
  slateBlack: '#1F2937',      // Primary body text
  sandBeige: '#F7EFE3',       // Warm off-white surface (previously "learningWhite")
  leafMint: '#E9F7EF',        // Subtle green tint surface
  coolBlueGrey: '#F5F7FA',    // Subtle blue tint surface (previously "coolBlue")
  lavenderGrey: '#E9E7EF',    // NEW July 2026 — soft neutral surface
} as const;

export type ColorName = keyof typeof COLORS;
