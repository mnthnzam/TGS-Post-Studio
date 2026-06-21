import { describe, it, expect } from 'vitest';
import { buildFileName } from './exportImage';

describe('buildFileName', () => {
  it('slugs the label and appends the format', () => {
    const name = buildFileName('Values-Based', 'png');
    expect(name).toMatch(/^tgs-values-based-\d+\.png$/);
  });
  it('handles messy labels and jpg', () => {
    const name = buildFileName('3Cs in Action!', 'jpg');
    expect(name).toMatch(/^tgs-3cs-in-action-\d+\.jpg$/);
  });
});
