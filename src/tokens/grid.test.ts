import { describe, it, expect } from 'vitest';
import { CANVAS, GRID, COLUMN_X } from './grid';

describe('grid', () => {
  it('canvas is 1080x1350 with 50px margins', () => {
    expect(CANVAS.width).toBe(1080);
    expect(CANVAS.height).toBe(1350);
    expect(GRID.margin).toBe(50);
    expect(GRID.contentWidth).toBe(980);
    expect(GRID.contentHeight).toBe(1250);
  });

  it('column 3 starts at x=450', () => {
    expect(COLUMN_X[2].start).toBe(450);
  });

  it('has 5 columns', () => {
    expect(COLUMN_X).toHaveLength(5);
    expect(GRID.columns).toBe(5);
  });
});
