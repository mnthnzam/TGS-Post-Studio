import type { LogoVariant } from '../tokens/colorways';

interface LogoIconProps {
  variant: LogoVariant;
  size?: number;
}

/**
 * Tatva tree mark. Geometry per TGS_Design_System_v1.md §5.4.
 * White variant: white strokes with amber accent. Dark variant: Tatva Blue.
 */
export function LogoIcon({ variant, size = 38 }: LogoIconProps) {
  const isWhite = variant === 'white';
  const main = isWhite ? '#FFC352' : '#1E3A8A';
  const stroke = isWhite ? '#FFFFFF' : '#1E3A8A';
  const ring = isWhite ? 'rgba(255,255,255,0.15)' : 'rgba(30,58,138,0.08)';
  const highlight = isWhite ? 'rgba(255,195,82,0.30)' : 'rgba(255,255,255,0.20)';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid="logo-icon"
    >
      <circle cx="20" cy="20" r="19" fill={ring} stroke={stroke} strokeWidth="1.2" />
      <rect x="19" y="20" width="2.2" height="12" rx="1" fill={main} />
      <path d="M20 32 Q16 34 13 38" stroke={main} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 32 Q24 34 27 38" stroke={main} strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="20" cy="16" rx="8" ry="7" fill={main} />
      <ellipse cx="14" cy="18" rx="5.5" ry="5" fill={main} />
      <ellipse cx="26" cy="18" rx="5.5" ry="5" fill={main} />
      <ellipse cx="20" cy="14.5" rx="4.5" ry="4" fill={highlight} />
    </svg>
  );
}
