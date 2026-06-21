import type { CSSProperties } from 'react';

// Shared, theme-aware style tokens (all colours via CSS variables → adapt light/dark).
export const ui = {
  panel: { background: 'var(--bg-panel)', borderRight: '1px solid var(--border-hairline)' } as CSSProperties,
  canvas: { background: 'var(--bg-canvas)' } as CSSProperties,

  label: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-tertiary)', marginBottom: 5, display: 'block' } as CSSProperties,
  sectionTitle: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' } as CSSProperties,

  field: {
    width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-hairline)',
    borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-ui)', boxSizing: 'border-box', outline: 'none',
  } as CSSProperties,

  btn: {
    padding: '8px 13px', borderRadius: 'var(--r-md)', fontWeight: 500, cursor: 'pointer', fontSize: 12.5,
    border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--text-secondary)',
  } as CSSProperties,
  btnPrimary: {
    padding: '8px 13px', borderRadius: 'var(--r-md)', fontWeight: 600, cursor: 'pointer', fontSize: 12.5,
    border: '1px solid var(--accent)', background: 'var(--accent)', color: 'var(--accent-text)',
  } as CSSProperties,

  card: { background: 'var(--bg-raised)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--r-lg)', overflow: 'hidden' } as CSSProperties,
  readout: { fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 11, color: 'var(--text-secondary)' } as CSSProperties,
};
