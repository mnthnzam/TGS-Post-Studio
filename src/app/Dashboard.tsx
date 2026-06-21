import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { LAYOUTS, getModule } from '../layouts/registry';
import { store } from '../store';
import { uid } from '../model';
import { BUCKETS } from '../logic/mappings';
import { ui } from '../ui/styles';
import type { Bucket } from '../logic/mappings';
import type { LayoutId, PostDoc } from '../model';

const thumb: CSSProperties = { width: '100%', aspectRatio: '1080 / 1350', background: 'var(--bg-canvas)' };
const small: CSSProperties = { fontSize: 11.5, color: 'var(--text-tertiary)' };
const sectionH: CSSProperties = { color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, margin: '0 0 10px' };

function Thumb({ doc }: { doc: PostDoc }) {
  const svg = useMemo(() => { try { return getModule(doc.layoutId).build(doc); } catch { return ''; } }, [doc]);
  return <div style={thumb} dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg style="width:100%;height:100%;display:block" ') }} />;
}

function mini(): CSSProperties {
  return { flex: 1, padding: '6px 0', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-hairline)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' };
}

export default function Dashboard({ onNew, onNewFromBucket, onEdit }: { onNew: (id: LayoutId) => void; onNewFromBucket: (b: Bucket) => void; onEdit: (doc: PostDoc) => void }) {
  const [tick, setTick] = useState(0);
  const posts = useMemo(() => store.list(), [tick]);
  const refresh = () => setTick((t) => t + 1);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 30, maxWidth: 1180 }}>
      <h2 style={sectionH}>Start from a content bucket</h2>
      <div style={{ ...small, marginBottom: 10 }}>Picks the on-brand layout, colorway and hashtag automatically.</div>
      <select
        defaultValue=""
        onChange={(e) => { if (e.target.value) { onNewFromBucket(e.target.value as Bucket); e.target.value = ''; } }}
        style={{ ...ui.field, width: 320, maxWidth: '100%', marginBottom: 34 }}
      >
        <option value="" disabled>Choose a bucket…</option>
        {BUCKETS.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>

      <h2 style={sectionH}>Or start from a layout</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16, marginBottom: 34 }}>
        {LAYOUTS.map((m) => (
          <div key={m.id} style={{ ...ui.card, cursor: 'pointer' }} onClick={() => onNew(m.id)}>
            <Thumb doc={m.newDoc()} />
            <div style={{ padding: 12 }}>
              <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>{m.label}</div>
              <div style={small}>New · {m.id}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={sectionH}>Saved posts ({posts.length})</h2>
      {posts.length === 0 ? (
        <div style={{ ...small, padding: 16 }}>No saved posts yet. Start one above, then hit Save in the editor.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
          {posts.map((doc) => (
            <div key={doc.id} style={ui.card}>
              <div style={{ cursor: 'pointer' }} onClick={() => onEdit(doc)}><Thumb doc={doc} /></div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name || 'Untitled'}</div>
                <div style={small}>{doc.layoutId} · {new Date(doc.updatedAt).toLocaleDateString()}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => onEdit(doc)} style={mini()}>Edit</button>
                  <button onClick={() => { store.duplicate(doc.id, uid); refresh(); }} style={mini()}>Duplicate</button>
                  <button onClick={() => { if (confirm('Delete this post?')) { store.remove(doc.id); refresh(); } }} style={{ ...mini(), color: 'var(--danger)' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
