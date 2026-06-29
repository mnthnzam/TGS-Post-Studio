// Typography tokens — the §4.4 type scale as named presets.
// Source of truth: TGS Brand Master Deliverable v1.0 (July 2026) §07 Visual Identity System.
// FONT STACK (updated July 2026):
//   Display / Headline → DM Serif Display (Regular & Italic)
//   Body / UI          → DM Sans (300–700)
// Previous stack (Kalam + Poppins) is retired per approved brand master.
import type { CSSProperties } from 'react';

export const FONT_DISPLAY = "'DM Serif Display', serif";
export const FONT_BODY = "'DM Sans', sans-serif";

// Google Fonts import URLs
// Full (all weights):
// https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&display=swap
// Production (weights used in this system):
// https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&display=swap

export interface TypePreset {
  fontFamily: string;
  fontSize: number; // px at true 1080x1350 scale
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  lineHeight: number;
  letterSpacing: number; // px
}

const dmSerif = (
  fontSize: number,
  fontWeight: number,
  lineHeight: number,
  fontStyle: 'normal' | 'italic' = 'normal',
): TypePreset => ({
  fontFamily: FONT_DISPLAY,
  fontSize,
  fontWeight,
  fontStyle,
  lineHeight,
  letterSpacing: 0,
});

const dmSans = (
  fontSize: number,
  fontWeight: number,
  lineHeight: number,
  fontStyle: 'normal' | 'italic' = 'normal',
  letterSpacing = 0,
): TypePreset => ({
  fontFamily: FONT_BODY,
  fontSize,
  fontWeight,
  fontStyle,
  lineHeight,
  letterSpacing,
});

// Type scale — mirrors the §4.4 spec with DM Serif Display replacing Kalam
// and DM Sans replacing Poppins. Weight ranges are equivalent.
export const TYPE = {
  // Display presets (DM Serif Display)
  displayL1: dmSerif(36, 400, 1.2),         // Layout 1 headline — Regular weight at this size
  displayL2: dmSerif(48, 400, 1.1),         // Layout 2 headline — full bleed
  displayL3: dmSerif(44, 400, 1.1),         // Layout 3 headline — cutout
  displayL4: dmSerif(68, 400, 1.1),         // Layout 4 (Aurora) headline
  displayL5: dmSerif(60, 400, 1.1),         // Layout 5 (Gradient Panel) headline
  softTestimonial: dmSerif(36, 400, 1.25),  // Community/testimonial voice
  pullQuote: dmSerif(28, 400, 1.3),         // Long pull-quote
  displayItalic: dmSerif(48, 400, 1.1, 'italic'), // Italic emphasis — DM Serif Display supports true italic

  // Body presets (DM Sans)
  bodyLight: dmSans(13, 500, 1.6),          // Body on light background
  bodyDark: dmSans(12, 300, 1.55),          // Body on dark/overlay background
  bodyLong: dmSans(13, 400, 1.6),           // Long-form body text
  quoteInBody: dmSans(13, 400, 1.6, 'italic'), // Direct speech within body
  attribution: dmSans(11, 600, 1.4, 'normal', 0.5),
  pillText: dmSans(10, 700, 1.2, 'normal', 0.5),  // DM Sans Bold per brand spec
  pillCta: dmSans(8, 400, 1.2),
  logoName: dmSans(12, 700, 1.1, 'normal', 3),
  logoSub: dmSans(8, 400, 1.1, 'normal', 2.5),
  sectionLabel: dmSans(11, 700, 1.2, 'normal', 2), // Eyebrow / label — DM Sans 700 uppercase
} as const satisfies Record<string, TypePreset>;

export type TypePresetName = keyof typeof TYPE;

// Convert a preset to React inline styles (px units).
export function presetToStyle(p: TypePreset): CSSProperties {
  return {
    fontFamily: p.fontFamily,
    fontSize: `${p.fontSize}px`,
    fontWeight: p.fontWeight,
    fontStyle: p.fontStyle,
    lineHeight: p.lineHeight,
    letterSpacing: `${p.letterSpacing}px`,
  };
}
