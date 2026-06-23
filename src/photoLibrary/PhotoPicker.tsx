import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { ui } from '../ui/styles';
import { listPhotos } from './db';
import type { PhotoEntry } from './types';

const small: CSSProperties = { fontSize: 11.5, color: 'var(--text-tertiary)' };

interface PhotoPickerProps {
  onSelect: (entry: PhotoEntry) => void;
  onClose: () => void;
}

export default function PhotoPicker({ onSelect, onClose }: PhotoPickerProps) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => { listPhotos().then((p) => { setPhotos(p); setLoading(false); }).catch(() => setLoading(false)); }, []);

  // Thumbnail object URLs, revoked on unmount / when photos change.
  useEffect(() => {
    const map: Record<string, string> = {};
    photos.forEach((p) => { map[p.id] = URL.createObjectURL(p.thumbnail); });
    setUrls(map);
    return () => { Object.values(map).forEach((u) => URL.revokeObjectURL(u)); };
  }, [photos]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    photos.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [photos]);

  const visible = photos.filter(
    (p) =>
      (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
      (!tagFilter || p.tags.includes(tagFilter)),
  );

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(900px, 100%)', maxHeight: '86vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderBottom: '1px solid var(--border-soft)' }}>
          <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>Choose from library</strong>
          <input style={{ ...ui.field, width: 200, marginLeft: 6 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={{ ...ui.field, width: 170 }} value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={onClose} style={{ ...ui.btn, marginLeft: 'auto', padding: '5px 11px', fontSize: 12 }}>Close</button>
        </div>

        <div style={{ overflowY: 'auto', padding: 16 }}>
          {loading ? (
            <div style={{ ...small, padding: 16 }}>Loading…</div>
          ) : photos.length === 0 ? (
            <div style={{ ...small, padding: 16 }}>No photos in the library yet. Add some in the Library tab first.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {visible.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  title={`${p.name} — ${p.width}×${p.height}`}
                  style={{ padding: 0, border: '1px solid var(--border-hairline)', borderRadius: 'var(--r-md)', overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-raised)' }}
                >
                  <div style={{ width: '100%', aspectRatio: '1 / 1', background: 'var(--bg-canvas)' }}>
                    {urls[p.id] && <img src={urls[p.id]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                  </div>
                  <div style={{ padding: '6px 8px', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
