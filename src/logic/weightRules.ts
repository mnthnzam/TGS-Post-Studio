// Kalam font-weight selection logic.
// Source of truth: TGS_Design_System_v1.md §4.2 and §15.5.
export type HeadlineKind = 'statement' | 'cta' | 'value' | 'testimonial' | 'community';

export interface HeadlineInput {
  kind: HeadlineKind;
  words: number;
}

/**
 * Returns the Kalam weight for a headline.
 *  - 15+ words → 300 (reduce visual weight), regardless of kind
 *  - testimonial / community voice → 400 (warmth > authority)
 *  - statement / CTA / value declaration → 700 (default)
 */
export function kalamWeight({ kind, words }: HeadlineInput): 300 | 400 | 700 {
  if (words >= 15) return 300;
  if (kind === 'testimonial' || kind === 'community') return 400;
  return 700;
}
