import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { presetToStyle } from '../tokens/typography';
import type { TypePreset } from '../tokens/typography';

interface AccentTextProps {
  text: string; // may contain \n for line breaks
  accent?: string; // first occurrence rendered in var(--cw-accent)
  preset: TypePreset;
  color?: string;
  style?: CSSProperties;
}

// Render a string, converting \n to <br />.
function withBreaks(str: string, keyBase: string) {
  const lines = str.split('\n');
  return lines.map((line, i) => (
    <Fragment key={`${keyBase}-${i}`}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}

/**
 * Kalam headline with one accent run highlighted in CW_ACCENT.
 * fontStyle is always inherited from the preset (Kalam presets are normal — §4.1).
 */
export function AccentText({ text, accent, preset, color, style }: AccentTextProps) {
  const base: CSSProperties = { ...presetToStyle(preset), ...(color ? { color } : {}), ...style };

  if (!accent || !text.includes(accent)) {
    return <span style={base}>{withBreaks(text, 'a')}</span>;
  }

  const idx = text.indexOf(accent);
  const before = text.slice(0, idx);
  const after = text.slice(idx + accent.length);

  return (
    <span style={base}>
      {before && withBreaks(before, 'b')}
      <span style={{ color: 'var(--cw-accent)' }} data-testid="accent">
        {withBreaks(accent, 'm')}
      </span>
      {after && withBreaks(after, 'a')}
    </span>
  );
}
