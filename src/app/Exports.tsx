import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import { getModule } from '../layouts/registry';
import { store, useStoreList } from '../store';
import {
  exportDocImage, exportColorwayVariants, exportCaptionsCsv,
  exportProjectJson, readProjectJson, exportStyleGuide,
} from './export';
import { ui } from '../ui/styles';
import type { PostDoc } from '../model';

const h2: CSSProperties = { color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, margin: '0 0 6px' };
const small: CSSProperties = { fontSize: 11.5, color: 'var(--text-tertiary)' };

function Thumb({ doc }: { doc: PostDoc }) {
  const svg = useMemo(() => { try { return getModule(doc.layoutId).build(doc); } catch { return ''; } }, [doc]);
  return <div style={{ width: '100%', aspectRatio: '1080 / 1350', background: 'var(--bg-canvas)', borderRadius: 'var(--r-sm)' }} dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg style="width:100%;height:100%;display:block" ') }} />;
}

export default function Exports() {
  const posts = useStoreList();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = posts.filter((p) => sel.has(p.id));
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const run = async (labelText: string, fn: () => Promise<void> | void) => { setBusy(labelText); try { await fn(); } catch (e) { alert('Failed: ' + (e as Error).message); } finally { setBusy(''); } };

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await run('Importing', async () => {
      const docs = await readProjectJson(file);
      docs.forEach((d) => store.save(d));
      alert(`Imported ${docs.length} post(s).`);
    });
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 30, display: 'flex', flexDirection: 'column', gap: 30, maxWidth: 1180 }}>
      <div>
        <h2 style={h2}>Brand style guide</h2>
        <div style={small}>A multi-page brand document — colours, type, logo, layouts, rules.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <button style={ui.btnPrimary} onClick={() => run('Building PDF', () => exportStyleGuide({ pdf: true }))}>Export PDF</button>
          <button style={ui.btn} onClick={() => run('Building HTML', () => exportStyleGuide({ html: true }))}>HTML</button>
          <button style={ui.btn} onClick={() => run('Building PNGs', () => exportStyleGuide({ png: true }))}>PNG pages</button>
        </div>
      </div>

      <div>
        <h2 style={h2}>Project backup</h2>
        <div style={small}>Save your whole library to a file, or restore from one.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button style={ui.btn} onClick={() => exportProjectJson(posts)} disabled={posts.length === 0}>Download backup (.json)</button>
          <button style={ui.btn} onClick={() => fileRef.current?.click()}>Import backup</button>
          <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={onImport} />
        </div>
      </div>

      <div>
        <h2 style={h2}>Export posts ({selected.length} selected)</h2>
        {posts.length === 0 ? (
          <div style={{ ...small, padding: 12 }}>No saved posts yet. Save some in the editor first.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <button style={ui.btnPrimary} disabled={!selected.length} onClick={() => run('Exporting PNG', async () => { for (const d of selected) await exportDocImage(d, 'png'); })}>PNG</button>
              <button style={ui.btn} disabled={!selected.length} onClick={() => run('Exporting JPG', async () => { for (const d of selected) await exportDocImage(d, 'jpg'); })}>JPG</button>
              <button style={ui.btn} disabled={!selected.length} onClick={() => run('Exporting variants', async () => { for (const d of selected) await exportColorwayVariants(d); })}>Colorway variants ×3</button>
              <button style={ui.btn} disabled={!selected.length} onClick={() => exportCaptionsCsv(selected)}>Captions CSV</button>
              <button style={ui.btn} onClick={() => setSel(new Set(posts.map((p) => p.id)))}>Select all</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
              {posts.map((doc) => (
                <label key={doc.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer', outline: sel.has(doc.id) ? '2px solid var(--accent)' : '2px solid transparent', borderRadius: 'var(--r-md)', padding: 6, background: 'var(--bg-raised)', border: '1px solid var(--border-hairline)' }}>
                  <Thumb doc={doc} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={sel.has(doc.id)} onChange={() => toggle(doc.id)} />
                    <span style={{ color: 'var(--text-primary)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name || 'Untitled'}</span>
                  </div>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {busy && <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'var(--accent)', color: 'var(--accent-text)', padding: '10px 16px', borderRadius: 'var(--r-md)', fontSize: 13 }}>{busy}…</div>}
    </div>
  );
}
