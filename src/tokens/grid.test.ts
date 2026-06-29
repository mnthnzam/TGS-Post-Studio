import { describe, it, expect } from 'vitest';
import { CANVAS, GRID, COLUMN_X } from './grid';

describe('grid', () => {
  it('canvas is 1080x1350 with 54px margins (brand master July 2026)', () => {
    expect(CANVAS.width).toBe(1080);
    expect(CANVAS.height).toBe(1350);
    expect(GRID.margin).toBe(54);
    expect(GRID.contentWidth).toBe(972);
    expect(GRID.contentHeight).toBe(1242);
  });

  it('column 3 starts at x=442', () => {
    expect(COLUMN_X[2].start).toBe(442);
  });

  it('has 5 columns', () => {
    expect(COLUMN_X).toHaveLength(5);
    expect(GRID.columns).toBe(5);
  });
});
