// Colorway variable sets A / B / C.
// Source of truth: TGS_Design_System_v1.md §3.2.
export type LogoVariant = 'white' | 'dark';
export type ColorwayId = 'A' | 'B' | 'C';

export interface Colorway {
  id: ColorwayId;
  label: string;
  CW_PRIMARY: string;
  CW_TEXT_ON_PRIMARY: string;
  CW_ACCENT: string;
  CW_OVERLAY: string;
  CW_BOTTOM_BG: string;
  CW_BOTTOM_TEXT: string;
  CW_BORDER: string;
  CW_PILL_BG: string;
  CW_PILL_TEXT: string;
  CW_ACCENT_SHAPE: string;
  logoVariant: LogoVariant;
}

export const COLORWAYS: Record<ColorwayId, Colorway> = {
  // Colorway A — Tatva Blue
  A: {
    id: 'A',
    label: 'Tatva Blue',
    CW_PRIMARY: '#1E3A8A',
    CW_TEXT_ON_PRIMARY: '#FFFFFF',
    CW_ACCENT: '#FFC352',
    CW_OVERLAY: 'rgba(14, 28, 80, 0.82)',
    CW_BOTTOM_BG: '#F7F7F7',
    CW_BOTTOM_TEXT: '#1F2937',
    CW_BORDER: '#1E3A8A',
    CW_PILL_BG: '#E9695F',
    CW_PILL_TEXT: '#FFFFFF',
    CW_ACCENT_SHAPE: '#FFC352',
    logoVariant: 'white',
  },
  // Colorway B — Tatva Green
  B: {
    id: 'B',
    label: 'Tatva Green',
    CW_PRIMARY: '#0B7A53',
    CW_TEXT_ON_PRIMARY: '#FFFFFF',
    CW_ACCENT: '#FFC352',
    CW_OVERLAY: 'rgba(5, 60, 40, 0.82)',
    CW_BOTTOM_BG: '#F7F7F7',
    CW_BOTTOM_TEXT: '#1F2937',
    CW_BORDER: '#0B7A53',
    CW_PILL_BG: '#E9695F',
    CW_PILL_TEXT: '#FFFFFF',
    CW_ACCENT_SHAPE: '#FFC352',
    logoVariant: 'white',
  },
  // Colorway C — Learning Amber (the only colorway with a dark logo)
  C: {
    id: 'C',
    label: 'Learning Amber',
    CW_PRIMARY: '#FFC352',
    CW_TEXT_ON_PRIMARY: '#1F2937',
    CW_ACCENT: '#1E3A8A',
    CW_OVERLAY: 'rgba(160, 100, 5, 0.80)',
    CW_BOTTOM_BG: '#FFF8EB',
    CW_BOTTOM_TEXT: '#1F2937',
    CW_BORDER: '#FFC352',
    CW_PILL_BG: '#1E3A8A',
    CW_PILL_TEXT: '#FFFFFF',
    CW_ACCENT_SHAPE: '#1E3A8A',
    logoVariant: 'dark',
  },
};
