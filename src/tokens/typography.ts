// Typography tokens — the §4.4 type scale as named presets.
// Source of truth: TGS_Design_System_v1.md §4.
// IMPORTANT (§4.1): Kalam has no true italic. NEVER set fontStyle italic on Kalam —
// every Kalam preset below is fontStyle 'normal' by rule.
import type { CSSProperties } from 'react';

export const FONT_DISPLAY = "'Kalam', cursive";
export const FONT_BODY = "'Poppins', sans-serif";

export interface TypePreset {
  fontFamily: string;
  fontSize: number; // px at true 1080x1350 scale
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  lineHeight: number;
  letterSpacing: number; // px
}

const kalam = (
  fontSize: number,
  fontWeight: number,
  lineHeight: number,
): TypePreset => ({
  fontFamily: FONT_DISPLAY,
  fontSize,
  fontWeight,
  fontStyle: 'normal', // never italic — §4.1
  lineHeight,
  letterSpacing: 0,
});

const poppins = (
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

// Every row of the §4.4 type-scale table.
export const TYPE = {
  displayL1: kalam(36, 700, 1.2),
  displayL2: kalam(48, 700, 1.1),
  displayL3: kalam(44, 700, 1.1),
  softTestimonial: kalam(36, 400, 1.25),
  pullQuote: kalam(28, 300, 1.3),
  bodyLight: poppins(13, 500, 1.6),
  bodyDark: poppins(12, 300, 1.55),
  bodyLong: poppins(13, 400, 1.6),
  quoteInBody: poppins(13, 400, 1.6, 'italic'),
  attribution: poppins(11, 600, 1.4, 'normal', 0.5),
  // §6.1 (component spec) sets pill text to Poppins 600; overrides the §4.4 summary's 700.
  pillText: poppins(10, 600, 1.2, 'normal', 0.5),
  pillCta: poppins(8, 400, 1.2),
  logoName: poppins(12, 700, 1.1, 'normal', 3),
  logoSub: poppins(8, 400, 1.1, 'normal', 2.5),
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
