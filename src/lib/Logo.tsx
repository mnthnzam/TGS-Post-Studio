import { LogoIcon } from './LogoIcon';
import { TYPE, presetToStyle } from '../tokens/typography';
import type { LogoVariant } from '../tokens/colorways';
import { GRID } from '../tokens/grid';

interface LogoProps {
  variant: LogoVariant;
}

/**
 * NON-NEGOTIABLE component. Fixed top-left at (50,50), icon 38x38, 7px gap.
 * Source: TGS_Design_System_v1.md §5. Only the colour variant changes.
 */
export function Logo({ variant }: LogoProps) {
  const color = variant === 'white' ? '#FFFFFF' : '#1E3A8A';
  const subColor = variant === 'white' ? 'rgba(255,255,255,0.75)' : 'rgba(30,58,138,0.75)';
  return (
    <div
      data-testid="logo"
      style={{
        position: 'absolute',
        left: GRID.margin,
        top: GRID.margin,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
      }}
    >
      <LogoIcon variant={variant} size={38} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            ...presetToStyle(TYPE.logoName),
            color,
            textTransform: 'uppercase',
          }}
        >
          TATVA
        </span>
        <span
          style={{
            ...presetToStyle(TYPE.logoSub),
            color: subColor,
            textTransform: 'uppercase',
          }}
        >
          GLOBAL SCHOOL
        </span>
      </div>
    </div>
  );
}
