import type { EasingId } from './types';

const clamp01 = (p: number) => Math.max(0, Math.min(1, p));

export function ease(id: EasingId, pRaw: number): number {
  const p = clamp01(pRaw);
  switch (id) {
    case 'linear':
      return p;
    case 'easeOut':
      return 1 - Math.pow(1 - p, 3); // cubic ease-out
    case 'easeInOut':
      return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    case 'easeOutBack': {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
    }
    default:
      return p;
  }
}
