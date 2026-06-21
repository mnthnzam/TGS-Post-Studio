import type { CSSProperties } from 'react';
import type { PhotoValue } from '../types';

interface PhotoProps {
  photo?: PhotoValue;
  /** Placeholder fill + label shown when no photo is provided. */
  placeholderBg: string;
  placeholderLabel: string;
  defaultObjectPosition?: string;
  style: CSSProperties; // absolute box (position/size)
}

/** Photo zone: cover-fit image with focal point, or a spec placeholder. */
export function Photo({
  photo,
  placeholderBg,
  placeholderLabel,
  defaultObjectPosition = '50% 50%',
  style,
}: PhotoProps) {
  return (
    <div style={{ ...style, overflow: 'hidden' }} data-testid="photo-zone">
      {photo ? (
        <img
          src={photo.src}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: photo.objectPosition ?? defaultObjectPosition,
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: placeholderBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'Poppins', sans-serif",
            fontSize: 16,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textAlign: 'center',
            padding: 24,
          }}
        >
          {placeholderLabel}
        </div>
      )}
    </div>
  );
}
