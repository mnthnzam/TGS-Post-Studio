// Design tokens — base colour palette.
// Source of truth: TGS_Design_System_v1.md §3.1 (all 11 tokens).
export const COLORS = {
  tatvaBlue: '#1E3A8A',
  tatvaGreen: '#0B7A53',
  whisperWhite: '#F7F7F7',
  slateBlack: '#1F2937',
  learningAmber: '#FFC352',
  hashtagCorral: '#E9695F',
  leafMint: '#E9F7EF',
  coolBlue: '#F5F7FA',
  secondaryBlue: '#0E7490',
  learningWhite: '#F7EFE3',
} as const;

export type ColorName = keyof typeof COLORS;
