// Canvas + grid tokens.
// Source of truth: TGS_Design_System_v1.md §1 (canvas) and §2 (grid).
export const CANVAS = { width: 1080, height: 1350 } as const;

export const GRID = {
  margin: 50,
  gutter: 20,
  columns: 5,
  columnWidth: 180,
  contentWidth: 980, // 1080 - 50 - 50
  contentHeight: 1250, // 1350 - 50 - 50
} as const;

// Left/right edges of each of the 5 columns (§2 table).
export const COLUMN_X = [
  { start: 50, end: 230 },
  { start: 250, end: 430 },
  { start: 450, end: 630 },
  { start: 650, end: 830 },
  { start: 850, end: 1030 },
] as const;
