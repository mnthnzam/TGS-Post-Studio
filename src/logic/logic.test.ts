import { describe, it, expect } from 'vitest';
import { defaultLayout, preferredColorway, hashtagFor, BUCKETS } from './mappings';
import { kalamWeight } from './weightRules';
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

describe('Kalam weight rules (§15.5)', () => {
  it('testimonial → 400, statement → 700, 15+ words → 300', () => {
    expect(kalamWeight({ kind: 'testimonial', words: 9 })).toBe(400);
    expect(kalamWeight({ kind: 'statement', words: 6 })).toBe(700);
    expect(kalamWeight({ kind: 'statement', words: 16 })).toBe(300);
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
