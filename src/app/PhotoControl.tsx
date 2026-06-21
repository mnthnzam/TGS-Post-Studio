import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { PhotoValue } from '../types';

interface PhotoControlProps {
  value?: PhotoValue;
  onChange: (p: PhotoValue | undefined) => void;
}

/** Upload a photo and set its focal point (object-position). In-memory only. */
export function PhotoControl({ value, onChange }: PhotoControlProps) {
  const [x, setX] = useState(50);
  const [y, setY] = useState(30);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    onChange({ src, objectPosition: `${x}% ${y}%` });
  };

  const updatePos = (nx: number, ny: number) => {
    setX(nx);
    setY(ny);
    if (value) onChange({ ...value, objectPosition: `${nx}% ${ny}%` });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input type="file" accept="image/*" onChange={handleFile} style={{ color: '#aaa', fontSize: 12 }} />
      {value && (
        <>
          <label style={{ fontSize: 11, color: '#9aa' }}>
            Focal X {x}%
            <input type="range" min={0} max={100} value={x} onChange={(e) => updatePos(+e.target.value, y)} style={{ width: '100%' }} />
          </label>
          <label style={{ fontSize: 11, color: '#9aa' }}>
            Focal Y {y}%
            <input type="range" min={0} max={100} value={y} onChange={(e) => updatePos(x, +e.target.value)} style={{ width: '100%' }} />
          </label>
          <button onClick={() => onChange(undefined)} style={{ fontSize: 11, padding: '4px 8px' }}>
            Remove photo
          </button>
        </>
      )}
    </div>
  );
}
