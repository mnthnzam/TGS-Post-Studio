import type { AnimMap, ElementId } from './types';

const r2 = (n: number) => Math.round(n * 100) / 100;
// Scale needs finer precision than position: a Ken Burns zoom only travels
// ~1.0→1.08, so 2-decimal rounding would quantize it into ~9 visible steps.
const r5 = (n: number) => Math.round(n * 100000) / 100000;

/**
 * Returns [openTag, closeTag] that wrap an element in an animated <g>, applying the
 * element's opacity and a pivot-aware transform (scale about the pivot, then translate).
 * dx/dy are authored in base (1080) space and scaled to the preset via S/SY.
 *
 * When `map` is undefined (static render) or the element has no state, returns ['','']
 * so the builder output is byte-identical to the non-animated path.
 */
export function gWrap(
  map: AnimMap | undefined,
  id: ElementId,
  pivotX: number,
  pivotY: number,
  S: number,
  SY: number,
): [string, string] {
  if (!map) return ['', ''];
  const st = map[id];
  if (!st) return ['', ''];
  const tr =
    `translate(${r2(pivotX)} ${r2(pivotY)}) scale(${r5(st.scale)}) ` +
    `translate(${r2(-pivotX)} ${r2(-pivotY)}) translate(${r2(st.dx * S)} ${r2(st.dy * SY)})`;
  return [`<g opacity="${r2(st.opacity)}" transform="${tr}">`, '</g>'];
}
