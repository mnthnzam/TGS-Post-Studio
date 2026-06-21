import { describe, it, expect } from 'vitest';
import { TYPE, FONT_DISPLAY } from './typography';

describe('typography', () => {
  it('every Kalam preset is font-style normal (§4.1 rule, never italic)', () => {
    for (const preset of Object.values(TYPE)) {
      if (preset.fontFamily === FONT_DISPLAY) {
        expect(preset.fontStyle).toBe('normal');
      }
    }
  });

  it('display headlines match the spec sizes', () => {
    expect(TYPE.displayL1.fontSize).toBe(36);
    expect(TYPE.displayL2.fontSize).toBe(48);
    expect(TYPE.displayL3.fontSize).toBe(44);
    expect(TYPE.displayL1.fontWeight).toBe(700);
  });

  it('default body weight is Poppins 500 (bodyLight)', () => {
    expect(TYPE.bodyLight.fontWeight).toBe(500);
  });

  it('quote-in-body is the only italic preset', () => {
    expect(TYPE.quoteInBody.fontStyle).toBe('italic');
  });
});
