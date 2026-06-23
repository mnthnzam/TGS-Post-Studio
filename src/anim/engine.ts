import { ease } from './easing';
import { IDENTITY } from './types';
import type { AnimMap, AnimStep, ChoreographyStyle, ElementId, ElementState } from './types';

// Base-space travel distance for rise/fall/slide effects.
const OFFSET = 56;
const KEN_BURNS_TO = 1.08;

/** Local progress of a step at absolute time t (ms), clamped to [0,1]. */
export function localProgress(step: AnimStep, tMs: number): number {
  if (step.durMs <= 0) return tMs >= step.delayMs ? 1 : 0;
  return Math.max(0, Math.min(1, (tMs - step.delayMs) / step.durMs));
}

/** Resolved element state at time t for a single step. */
export function elementStateAt(step: AnimStep | undefined, tMs: number): ElementState {
  if (!step || step.effect === 'none') return { ...IDENTITY };
  const raw = localProgress(step, tMs);

  if (step.effect === 'kenBurns') {
    // continuous push-in across the step; eased for a gentle settle
    const p = ease(step.easing, raw);
    return { opacity: 1, scale: 1 + (KEN_BURNS_TO - 1) * p, dx: 0, dy: 0 };
  }

  const p = ease(step.easing, raw);
  const opacity = p; // all entrance effects fade in
  switch (step.effect) {
    case 'fade':
      return { opacity, scale: 1, dx: 0, dy: 0 };
    case 'rise':
      return { opacity, scale: 1, dx: 0, dy: OFFSET * (1 - p) };
    case 'fall':
      return { opacity, scale: 1, dx: 0, dy: -OFFSET * (1 - p) };
    case 'pop':
      return { opacity, scale: 0.86 + 0.14 * p, dx: 0, dy: 0 };
    case 'slideL':
      return { opacity, scale: 1, dx: OFFSET * (1 - p), dy: 0 };
    case 'slideR':
      return { opacity, scale: 1, dx: -OFFSET * (1 - p), dy: 0 };
    default:
      return { ...IDENTITY };
  }
}

const ALL_ELEMENTS: ElementId[] = ['photo', 'headline', 'body', 'pill', 'logo'];

/** Full per-element state map for a style at time t. Elements with no step are identity. */
export function animMapAt(style: ChoreographyStyle, tMs: number): AnimMap {
  const map: AnimMap = {};
  for (const id of ALL_ELEMENTS) {
    map[id] = elementStateAt(style.steps[id], tMs);
  }
  return map;
}

export function frameCount(totalMs: number, fps: number): number {
  return Math.max(1, Math.round((totalMs / 1000) * fps));
}

export function timeAtFrame(frame: number, fps: number): number {
  return (frame / fps) * 1000;
}
