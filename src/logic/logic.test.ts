import { describe, it, expect } from 'vitest';
import { defaultLayout, preferredColorway, hashtagFor, BUCKETS } from './mappings';
import { displayWeight } from './weightRules';
import { isTypicallyBoosted, BOOST_CTA_LINE } from './postTypes';

describe('bucket mappings (§11/§12)', () => {
  it('Values-Based → Layout 3, Green, #RootedInValues', () => {
    expect(defaultLayout('Values-Based')).toBe('L3');
    expect(preferredColorway('Values-Based')).toBe('B');
    expect(hashtagFor('Values-Based')).toBe('#RootedInValues');
  });

  it('Curiosity Lab → Layout 2, Blue, #TheCuriosityLab', () => {
    expect(defaultLayout('Curiosity Lab')).toBe('L2');
    expect(preferredColorway('Curiosity Lab')).toBe('A');
    expect(hashtagFor('Curiosity Lab')).toBe('#TheCuriosityLab');
  });

  it('covers all 14 buckets', () => {
    expect(BUCKETS).toHaveLength(14);
  });
});

describe('Display weight rules (§15.5 — DM Serif Display)', () => {
  // DM Serif Display is single-weight (400). Style switches to italic for
  // testimonials, community posts, and long headlines (15+ words).
  it('testimonial → italic (emphasis)', () => {
    expect(displayWeight({ kind: 'testimonial', words: 9 })).toEqual({ fontWeight: 400, fontStyle: 'italic' });
  });
  it('statement (short) → normal', () => {
    expect(displayWeight({ kind: 'statement', words: 6 })).toEqual({ fontWeight: 400, fontStyle: 'normal' });
  });
  it('15+ words → italic regardless of kind', () => {
    expect(displayWeight({ kind: 'statement', words: 16 })).toEqual({ fontWeight: 400, fontStyle: 'italic' });
  });
});

describe('post types (§13/§6.2)', () => {
  it('flags typically-boosted buckets', () => {
    expect(isTypicallyBoosted("Director's Desk")).toBe(true);
    expect(isTypicallyBoosted('Alumni Echo')).toBe(false);
  });
  it('uses the TGS domain in the CTA line', () => {
    expect(BOOST_CTA_LINE).toContain('tatvaglobalschool.com');
  });
});
