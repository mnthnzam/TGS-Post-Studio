import { useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import { getSettings, saveSettings, getLogoColor, getLogoWhite } from '../settings';
import { BUCKETS, BUCKET_RULES } from '../logic/mappings';
import { ui } from '../ui/styles';
import type { Settings } from '../settings';

const h2: CSSProperties = { color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, margin: '0 0 6px' };
const small: CSSProperties = { fontSize: 11.5, color: 'var(--text-tertiary)' };

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function BrandSettings() {
  const [s, setS] = useState<Settings>(() => ({ ...getSettings(), bucketHashtags: { ...getSettings().bucketHashtags } }));
  const update = (next: Settings) => { setS(next); saveSettings(next); };

  const onLogo = (variant: 'logoColor' | 'logoWhite') => async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update({ ...s, [variant]: await readDataUrl(file) });
  };
  const resetLogo = (variant: 'logoColor' | 'logoWhite') => update({ ...s, [variant]: undefined });
  const setHashtag = (bucket: string, value: string) => update({ ...s, bucketHashtags: { ...s.bucketHashtags, [bucket]: value } });

  const logoCard = (bg: string): CSSProperties => ({ background: bg, borderRadius: 'var(--r-lg)', border: '1px solid var(--border-hairline)', padding: 20, width: 320, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' });

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 30, display: 'flex', flexDirection: 'column', gap: 30, maxWidth: 1180 }}>
      <div>
        <h2 style={h2}>Logos</h2>
        <div style={small}>Override the brand logo (SVG or PNG). Leave default if unsure. Fonts are locked to DM Serif Display + DM Sans.</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={logoCard('#F7F7F7')}><img src={getLogoColor()} alt="" style={{ maxWidth: '80%', maxHeight: 70 }} /></div>
            <span style={small}>Colour variant (light surfaces)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={ui.btn}>Upload<input type="file" accept="image/*" style={{ display: 'none' }} onChange={onLogo('logoColor')} /></label>
              {s.logoColor && <button style={ui.btn} onClick={() => resetLogo('logoColor')}>Reset</button>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={logoCard('#1E3A8A')}><img src={getLogoWhite()} alt="" style={{ maxWidth: '80%', maxHeight: 70 }} /></div>
            <span style={small}>White variant (photos / dark surfaces)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={ui.btn}>Upload<input type="file" accept="image/*" style={{ display: 'none' }} onChange={onLogo('logoWhite')} /></label>
              {s.logoWhite && <button style={ui.btn} onClick={() => resetLogo('logoWhite')}>Reset</button>}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 style={h2}>Default hashtags per content bucket</h2>
        <div style={small}>Used when you start a post from a bucket. Blank = system default.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 10, marginTop: 14 }}>
          {BUCKETS.map((b) => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{b}</span>
              <input style={{ ...ui.field, width: 220 }} value={s.bucketHashtags[b] ?? ''} placeholder={BUCKET_RULES[b].hashtag} onChange={(e) => setHashtag(b, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
