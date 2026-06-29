// Canvas + grid tokens.
// Source of truth: TGS_Design_System_v1.md §1 (canvas) and §2 (grid).
export const CANVAS = { width: 1080, height: 1350 } as const;

export const GRID = {
  margin: 54,           // brand master July 2026: ≈5% of 1080px canvas
  gutter: 20,
  columns: 5,
  columnWidth: 174,     // (972 - 4×20) / 5 = 178.4 → floor to 174 (nearest even)
  contentWidth: 972,    // 1080 - 54 - 54
  contentHeight: 1242,  // 1350 - 54 - 54
} as const;

// Left/right edges of each of the 5 columns (§2 reference grid — 54px margins).
// Column width 174px, gutter 20px: 5×174 + 4×20 = 950 (fits within 972 content width).
export const COLUMN_X = [
  { start: 54,  end: 228 },
  { start: 248, end: 422 },
  { start: 442, end: 616 },
  { start: 636, end: 810 },
  { start: 830, end: 1004 },
] as const;
