import { getModule } from '../layouts/registry';
import { presetOf } from '../presets/index';
import { animMapAt, timeAtFrame } from './engine';
import type { ChoreographyStyle } from './types';
import type { BuildOpts, PostDoc } from '../model';

/**
 * Renders a single animated frame of a post as an SVG string.
 * `opts` carries the same overrides the static export uses (photoHref / logoHref /
 * fontFaceCss data URIs) so rasterized frames have embedded photo + fonts.
 */
export function renderFrame(
  doc: PostDoc,
  style: ChoreographyStyle,
  frame: number,
  fps: number,
  opts: BuildOpts = {},
): string {
  const preset = presetOf(doc.preset);
  const anim = animMapAt(style, timeAtFrame(frame, fps));
  return getModule(doc.layoutId).build(doc, preset, { ...opts, anim });
}
