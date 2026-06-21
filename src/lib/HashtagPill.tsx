import { TYPE, presetToStyle } from '../tokens/typography';
import { GRID } from '../tokens/grid';

export const DEFAULT_CTA_LINE = 'Enroll Now · tatvaglobalschool.com';

interface HashtagPillProps {
  hashtag: string;
  boosted?: boolean;
  ctaLine?: string;
}

/**
 * NON-NEGOTIABLE component. Fixed bottom-right, 50px insets.
 * Organic = full pill (radius 999). Boosted = two lines, radius 12.
 * Source: TGS_Design_System_v1.md §6.
 */
export function HashtagPill({ hashtag, boosted = false, ctaLine }: HashtagPillProps) {
  const base = {
    position: 'absolute' as const,
    right: GRID.margin,
    bottom: GRID.margin,
    zIndex: 20,
    background: 'var(--cw-pill-bg)',
    color: 'var(--cw-pill-text)',
    padding: '7px 16px',
    whiteSpace: 'nowrap' as const,
  };

  if (boosted) {
    return (
      <div
        data-testid="pill"
        style={{
          ...base,
          ...presetToStyle(TYPE.pillText),
          color: 'var(--cw-pill-text)',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <span>{hashtag}</span>
        <span style={{ ...presetToStyle(TYPE.pillCta), opacity: 0.85 }}>
          {ctaLine ?? DEFAULT_CTA_LINE}
        </span>
      </div>
    );
  }

  return (
    <div
      data-testid="pill"
      style={{
        ...base,
        ...presetToStyle(TYPE.pillText),
        color: 'var(--cw-pill-text)',
        borderRadius: 999,
      }}
    >
      {hashtag}
    </div>
  );
}
