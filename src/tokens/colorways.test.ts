import { describe, it, expect } from 'vitest';
import { COLORWAYS } from './colorways';

describe('colorways', () => {
  it('Amber (C) uses the dark logo and dark text-on-primary', () => {
    expect(COLORWAYS.C.CW_PRIMARY).toBe('#FFC352');
    expect(COLORWAYS.C.CW_TEXT_ON_PRIMARY).toBe('#1F2937');
    expect(COLORWAYS.C.logoVariant).toBe('dark');
  });

  it('Blue and Green use the white logo', () => {
    expect(COLORWAYS.A.logoVariant).toBe('white');
    expect(COLORWAYS.B.logoVariant).toBe('white');
  });

  it('pill is Hashtag Corral on Blue/Green but inverts to Tatva Blue on Amber', () => {
    expect(COLORWAYS.A.CW_PILL_BG).toBe('#E9695F');
    expect(COLORWAYS.B.CW_PILL_BG).toBe('#E9695F');
    expect(COLORWAYS.C.CW_PILL_BG).toBe('#1E3A8A');
  });

  it('accent is amber on Blue/Green and blue on Amber', () => {
    expect(COLORWAYS.A.CW_ACCENT).toBe('#FFC352');
    expect(COLORWAYS.C.CW_ACCENT).toBe('#1E3A8A');
  });
});
