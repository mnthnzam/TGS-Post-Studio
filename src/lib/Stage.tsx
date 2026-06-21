import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { CANVAS } from '../tokens/grid';
import type { ColorwayId } from '../tokens/colorways';

interface StageProps {
  colorway: ColorwayId;
  /** On-screen preview scale. Export always captures the true-size inner node. */
  scale?: number;
  children: ReactNode;
}

/**
 * Fixed 1080x1350 canvas. The forwarded ref points at the TRUE-SIZE inner node
 * (not the scaled wrapper) so html-to-image captures at full resolution.
 * data-cw drives every var(--cw-*) used by the layouts.
 */
export const Stage = forwardRef<HTMLDivElement, StageProps>(function Stage(
  { colorway, scale = 1, children },
  ref,
) {
  return (
    <div
      style={{
        width: CANVAS.width * scale,
        height: CANVAS.height * scale,
        flexShrink: 0,
      }}
    >
      <div
        ref={ref}
        data-cw={colorway}
        data-testid="stage"
        style={{
          width: CANVAS.width,
          height: CANVAS.height,
          position: 'relative',
          overflow: 'hidden',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: 'var(--whisper-white)',
        }}
      >
        {children}
      </div>
    </div>
  );
});
