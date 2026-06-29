// Display font weight / style selection logic.
// Source of truth: TGS Brand Master Deliverable v1.0 (July 2026).
// Font: DM Serif Display (replaces Kalam — July 2026).
// DM Serif Display ships as a single numeric weight (Regular 400) with true italic support.
// Differentiation is achieved via italic vs upright — not multiple numeric weights.
export type HeadlineKind = 'statement' | 'cta' | 'value' | 'testimonial' | 'community';

export interface HeadlineInput {
  kind: HeadlineKind;
  words: number;
}

export interface DisplayStyle {
  fontWeight: 400;      // DM Serif Display only ships Regular
  fontStyle: 'normal' | 'italic';
}

/**
 * Returns the display style for a headline.
 *  - testimonial / community voice → italic (warmth, personal voice)
 *  - statement / CTA / value declaration → upright normal (authoritative)
 *  - 15+ words → italic (reduces visual weight at length)
 *
 * Renamed from kalamWeight() → displayWeight() July 2026
 * when the font stack changed from Kalam + Poppins to DM Serif Display + DM Sans.
 */
export function displayWeight({ kind, words }: HeadlineInput): DisplayStyle {
  const useItalic =
    kind === 'testimonial' ||
    kind === 'community' ||
    words >= 15;

  return { fontWeight: 400, fontStyle: useItalic ? 'italic' : 'normal' };
}

/** @deprecated Use displayWeight() — renamed July 2026 */
export const kalamWeight = (input: HeadlineInput) => displayWeight(input);
