import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import { uid } from '../model';
import { ui } from '../ui/styles';
import { addPhoto, listPhotos, deletePhoto, updateTags } from './db';
import { generateThumbnail } from './thumbnails';
import type { PhotoEntry } from './types';

const h2: CSSProperties = { color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, margin: '0 0 6px' };
const small: CSSProperties = { fontSize: 11.5, color: 'var(--text-tertiary)' };

// Object URLs for thumbnails, recreated when the photo list changes and revoked on cleanup.
function useThumbUrls(photos: PhotoEntry[]): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    const map: Record<string, string> = {};
    photos.forEach((p) => { map[p.id] = URL.createObjectURL(p.thumbnail); });
    setUrls(map);
    return () => { Object.values(map).forEach((u) => URL.revokeObjectURL(u)); };
  }, [photos]);
  return urls;
}

export default function PhotoLibrary() {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [busy, setBusy] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = () => listPhotos().then((p) => { setPhotos(p); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const urls = useThumbUrls(photos);
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

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(`Uploading ${files.length} photo(s)`);
    try {
      for (const file of Array.from(files)) {
        const { thumb, width, height } = await generateThumbnail(file);
        const entry: PhotoEntry = {
          id: uid(),
          name: file.name.replace(/\.[^.]+$/, ''),
          tags: [],
          blob: file,
          thumbnail: thumb,
          width,
          height,
          uploadedAt: Date.now(),
          usageCount: 0,
        };
        await addPhoto(entry);
      }
      await reload();
    } catch (e) {
      alert('Upload failed: ' + (e as Error).message);
    } finally {
      setBusy('');
    }
  };

  const onUploadInput = (e: ChangeEvent<HTMLInputElement>) => { handleUpload(e.target.files); e.target.value = ''; };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this photo from the library?')) return;
    await deletePhoto(id);
    await reload();
  };

  const onTagsBlur = async (id: string, raw: string) => {
    const tags = raw.split(',').map((t) => t.trim()).filter(Boolean);
    await updateTags(id, tags);
    await reload();
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 30, display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1180 }}>
      <div>
        <h2 style={h2}>Photo library</h2>
        <div style={small}>Stored in this browser only — not synced. Reusable across all your posts.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ ...ui.btnPrimary, display: 'inline-block' }}>
            Upload photos
            <input type="file" accept="image/*" multiple onChange={onUploadInput} style={{ display: 'none' }} />
          </label>
          <input style={{ ...ui.field, width: 220 }} placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={{ ...ui.field, width: 200 }} value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span style={small}>{visible.length} of {photos.length}</span>
        </div>
      </div>

      {loading ? (
        <div style={{ ...small, padding: 16 }}>Loading…</div>
      ) : photos.length === 0 ? (
        <div style={{ ...small, padding: 16 }}>No photos yet. Upload a few to build your reusable library.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
          {visible.map((p) => (
            <div key={p.id} style={ui.card}>
              <div style={{ width: '100%', aspectRatio: '1 / 1', background: 'var(--bg-canvas)' }}>
                {urls[p.id] && <img src={urls[p.id]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              <div style={{ padding: 11, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.name}>{p.name}</div>
                <input
                  style={{ ...ui.field, fontSize: 11.5, padding: '5px 8px' }}
                  defaultValue={p.tags.join(', ')}
                  placeholder="tags, comma-separated"
                  onBlur={(e) => onTagsBlur(p.id, e.target.value)}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={small}>{p.width}×{p.height} · used {p.usageCount}×</span>
                  <button onClick={() => onDelete(p.id)} style={{ ...ui.btn, padding: '3px 9px', fontSize: 11, color: 'var(--danger)' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {busy && <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'var(--accent)', color: 'var(--accent-text)', padding: '10px 16px', borderRadius: 'var(--r-md)', fontSize: 13 }}>{busy}…</div>}
    </div>
  );
}
