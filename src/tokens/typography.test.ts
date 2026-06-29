import { describe, it, expect } from 'vitest';
import { TYPE, FONT_DISPLAY } from './typography';

describe('typography', () => {
  it('every DM Serif Display preset has fontWeight 400 (single-weight font)', () => {
    for (const preset of Object.values(TYPE)) {
      if (preset.fontFamily === FONT_DISPLAY) {
        expect(preset.fontWeight).toBe(400);
      }
    }
  });

  it('display headlines match the spec sizes', () => {
    expect(TYPE.displayL1.fontSize).toBe(36);
    expect(TYPE.displayL2.fontSize).toBe(48);
    expect(TYPE.displayL3.fontSize).toBe(44);
    expect(TYPE.displayL1.fontWeight).toBe(400); // DM Serif Display is single-weight
  });

  it('default body weight is DM Sans 500 (bodyLight)', () => {
    expect(TYPE.bodyLight.fontWeight).toBe(500);
  });

  it('quote-in-body is the only italic preset', () => {
    expect(TYPE.quoteInBody.fontStyle).toBe('italic');
  });
});
