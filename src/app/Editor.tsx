import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, PointerEvent as RPointerEvent, ReactNode, WheelEvent as RWheelEvent } from 'react';
import { getModule } from '../layouts/registry';
import { injectFontFaces } from '../assets';
import { store } from '../store';
import { exportDocPng } from './export';
import { ui } from '../ui/styles';
import { uid } from '../model';
import type { ColorwayId, CustomShape, PhotoVal, PostDoc } from '../model';

// Parse pasted/uploaded SVG → data URI + intrinsic size (for placement).
function parseSvg(svgText: string): { dataUri: string; baseW: number; baseH: number } | null {
  const t = svgText.trim();
  if (!t.includes('<svg')) return null;
  let w = 200, h = 200;
  try {
    const el = new DOMParser().parseFromString(t, 'image/svg+xml').querySelector('svg');
    if (el) {
      const wa = parseFloat(el.getAttribute('width') || '');
      const ha = parseFloat(el.getAttribute('height') || '');
      const vb = (el.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
      if (wa && ha) { w = wa; h = ha; } else if (vb.length === 4) { w = vb[2]; h = vb[3]; }
    }
  } catch { /* keep defaults */ }
  return { dataUri: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(t)))}`, baseW: w, baseH: h };
}

const CW_LABELS: Record<ColorwayId, string> = { A: 'Tatva Blue', B: 'Tatva Green', C: 'Learning Amber' };
const PREVIEW_SCALE = 0.5;

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 15, marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 2, height: 12, background: 'var(--accent)', borderRadius: 2, opacity: 0.75 }} />
        <span style={ui.sectionTitle}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  );
}

function Slider({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={ui.label}>{label}</span>
        <span style={ui.readout}>{Math.round(value * 100) / 100}{suffix ?? ''}</span>
      </div>
      <input type="range" min={min} max={max} step={step ?? 1} value={value} onChange={(e) => onChange(+e.target.value)} style={{ width: '100%' }} />
    </div>
  );
}

const fieldLabel = (t: string) => <span style={ui.label}>{t}</span>;

export default function Editor({ initialDoc, onBack }: { initialDoc: PostDoc; onBack: () => void }) {
  const [doc, setDoc] = useState<PostDoc>(() => ({ ...initialDoc, headlineDY: initialDoc.headlineDY ?? 0, bodyDY: initialDoc.bodyDY ?? 0, hashtagSide: initialDoc.hashtagSide ?? 'left' }));
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { injectFontFaces(); }, []);

  const set = <K extends keyof PostDoc>(k: K, v: PostDoc[K]) => { setDoc((d) => ({ ...d, [k]: v })); setSaved(false); };
  const setPhoto = (patch: Partial<PhotoVal>) => setDoc((d) => (d.photo ? { ...d, photo: { ...d.photo, ...patch } } : d));
  const setShape = (patch: Partial<NonNullable<PostDoc['shape']>>) => { setDoc((d) => ({ ...d, shape: { x: 0, y: 0, rotate: 0, scale: 1, ...d.shape, ...patch } })); setSaved(false); };
  const shape = doc.shape ?? { x: 0, y: 0, rotate: 0, scale: 1 };

  const [paste, setPaste] = useState('');
  const addShape = (svgText: string) => {
    const p = parseSvg(svgText);
    if (!p) { alert('That doesn’t look like SVG markup.'); return; }
    const s: CustomShape = { id: uid(), dataUri: p.dataUri, baseW: p.baseW, baseH: p.baseH, x: 600, y: 600, scale: 1, rotate: 0 };
    setDoc((d) => ({ ...d, customShapes: [...(d.customShapes ?? []), s] }));
    setSaved(false);
  };
  const onShapeFiles = (e: ChangeEvent<HTMLInputElement>) => { [...(e.target.files ?? [])].forEach((f) => f.text().then(addShape)); e.target.value = ''; };
  const updateShape = (id: string, patch: Partial<CustomShape>) => { setDoc((d) => ({ ...d, customShapes: (d.customShapes ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)) })); setSaved(false); };
  const removeShape = (id: string) => { setDoc((d) => ({ ...d, customShapes: (d.customShapes ?? []).filter((s) => s.id !== id) })); setSaved(false); };

  const mod = getModule(doc.layoutId);
  const svg = useMemo(() => mod.build(doc), [doc, mod]);

  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => set('photo', { src, w: img.naturalWidth, h: img.naturalHeight, scale: 1, focalX: 0, focalY: 0 });
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const onPointerDown = (e: RPointerEvent) => { drag.current = { x: e.clientX, y: e.clientY }; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
  const onPointerMove = (e: RPointerEvent) => {
    if (!drag.current || !doc.photo) return;
    const dx = (e.clientX - drag.current.x) / PREVIEW_SCALE;
    const dy = (e.clientY - drag.current.y) / PREVIEW_SCALE;
    drag.current = { x: e.clientX, y: e.clientY };
    setPhoto({ focalX: doc.photo.focalX + dx, focalY: doc.photo.focalY + dy });
  };
  const onPointerUp = () => { drag.current = null; };
  const onWheel = (e: RWheelEvent) => { if (doc.photo) setPhoto({ scale: Math.min(4, Math.max(1, doc.photo.scale - e.deltaY * 0.001)) }); };

  const onSave = () => { store.save(doc); setSaved(true); };
  const onExport = async () => {
    setExporting(true);
    try { await exportDocPng(doc); } catch (err) { alert('Export failed: ' + (err as Error).message); } finally { setExporting(false); }
  };

  const tArea: CSSProperties = { ...ui.field, resize: 'vertical' };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      {/* Instrument panel */}
      <div style={{ width: 348, ...ui.panel, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-soft)' }}>
          <button onClick={onBack} style={{ ...ui.btn, padding: '5px 10px', fontSize: 12 }}>← Library</button>
          <span style={{ ...ui.readout, color: 'var(--text-tertiary)' }}>{doc.layoutId} · {doc.colorway}</span>
        </div>

        <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div>
            {fieldLabel('Post name')}
            <input style={ui.field} value={doc.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <Group title="Copy">
            <div>{fieldLabel('Headline')}<textarea style={{ ...tArea, minHeight: 52 }} value={doc.headline} onChange={(e) => set('headline', e.target.value)} /></div>
            <div>{fieldLabel('Body')}<textarea style={{ ...tArea, minHeight: 64 }} value={doc.body} onChange={(e) => set('body', e.target.value)} /></div>
            <div>{fieldLabel('Hashtag')}<input style={ui.field} value={doc.hashtag} onChange={(e) => set('hashtag', e.target.value)} /></div>
            <div>{fieldLabel('Caption (scheduling — not on image)')}<textarea style={{ ...tArea, minHeight: 44 }} value={doc.caption ?? ''} onChange={(e) => set('caption', e.target.value)} /></div>
          </Group>

          <Group title="Type & colour">
            <Slider label="Headline size" value={doc.headlineSize} min={40} max={92} suffix="px" onChange={(v) => set('headlineSize', v)} />
            <Slider label="Body size" value={doc.bodySize} min={16} max={44} suffix="px" onChange={(v) => set('bodySize', v)} />
            <div>{fieldLabel('Colorway')}
              <select style={ui.field} value={doc.colorway} onChange={(e) => set('colorway', e.target.value as ColorwayId)}>
                {(['A', 'B', 'C'] as ColorwayId[]).map((c) => <option key={c} value={c}>{CW_LABELS[c]}</option>)}
              </select>
            </div>
            <div>{fieldLabel('Hashtag side')}
              <div style={{ display: 'flex', gap: 6 }}>
                {(['left', 'right'] as const).map((s) => (
                  <button key={s} onClick={() => set('hashtagSide', s)} style={{ ...ui.btn, flex: 1, textTransform: 'capitalize', ...(doc.hashtagSide === s ? { background: 'var(--accent-weak)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}) }}>{s}</button>
                ))}
              </div>
            </div>
          </Group>

          <Group title="Position">
            <Slider label="Headline" value={doc.headlineDY} min={-320} max={320} suffix="px" onChange={(v) => set('headlineDY', v)} />
            <Slider label="Body" value={doc.bodyDY} min={-320} max={320} suffix="px" onChange={(v) => set('bodyDY', v)} />
          </Group>

          <Group title="Photo">
            <div><span style={{ ...ui.label, marginBottom: 8 }}>Drag preview to pan · scroll to zoom</span>
              <input type="file" accept="image/*" onChange={onPhoto} style={{ color: 'var(--text-secondary)', fontSize: 12 }} />
            </div>
            {doc.photo && <>
              <Slider label="Zoom" value={doc.photo.scale} min={1} max={4} step={0.02} suffix="×" onChange={(v) => setPhoto({ scale: v })} />
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}><Slider label="Pan X" value={doc.photo.focalX} min={-1000} max={1000} suffix="px" onChange={(v) => setPhoto({ focalX: v })} /></div>
                <div style={{ flex: 1 }}><Slider label="Pan Y" value={doc.photo.focalY} min={-1200} max={1200} suffix="px" onChange={(v) => setPhoto({ focalY: v })} /></div>
              </div>
            </>}
          </Group>

          {doc.layoutId === 'L3' && (
            <Group title="Flower shape">
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}><Slider label="X" value={shape.x} min={-400} max={400} onChange={(v) => setShape({ x: v })} /></div>
                <div style={{ flex: 1 }}><Slider label="Y" value={shape.y} min={-400} max={400} onChange={(v) => setShape({ y: v })} /></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}><Slider label="Rotate" value={shape.rotate} min={-180} max={180} suffix="°" onChange={(v) => setShape({ rotate: v })} /></div>
                <div style={{ flex: 1 }}><Slider label="Scale" value={shape.scale} min={0.4} max={2} step={0.02} suffix="×" onChange={(v) => setShape({ scale: v })} /></div>
              </div>
            </Group>
          )}

          {doc.layoutId === 'L3' && (
            <Group title="Custom shapes">
              <div>
                <span style={{ ...ui.label, marginBottom: 8 }}>Import SVG (one or more)</span>
                <input type="file" accept=".svg,image/svg+xml" multiple onChange={onShapeFiles} style={{ color: 'var(--text-secondary)', fontSize: 12 }} />
              </div>
              <div>
                {fieldLabel('…or paste SVG markup')}
                <textarea style={{ ...ui.field, minHeight: 46, fontFamily: 'var(--font-mono)', fontSize: 11, resize: 'vertical' }} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="<svg>…</svg>" />
                <button style={{ ...ui.btn, marginTop: 6 }} onClick={() => { if (paste.trim()) { addShape(paste); setPaste(''); } }}>Add shape</button>
              </div>
              {(doc.customShapes ?? []).map((s, i) => (
                <div key={s.id} style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={ui.label}>Shape {i + 1}</span>
                    <button style={{ ...ui.btn, padding: '3px 9px', fontSize: 11, color: 'var(--danger)' }} onClick={() => removeShape(s.id)}>Remove</button>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}><Slider label="X" value={s.x} min={0} max={1080} onChange={(v) => updateShape(s.id, { x: v })} /></div>
                    <div style={{ flex: 1 }}><Slider label="Y" value={s.y} min={0} max={1350} onChange={(v) => updateShape(s.id, { y: v })} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}><Slider label="Scale" value={s.scale} min={0.1} max={4} step={0.05} suffix="×" onChange={(v) => updateShape(s.id, { scale: v })} /></div>
                    <div style={{ flex: 1 }}><Slider label="Rotate" value={s.rotate} min={-180} max={180} suffix="°" onChange={(v) => updateShape(s.id, { rotate: v })} /></div>
                  </div>
                </div>
              ))}
            </Group>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--border-soft)' }}>
          <button onClick={onSave} style={{ ...ui.btn, flex: 1, ...(saved ? { color: 'var(--accent)', borderColor: 'var(--accent)' } : {}) }}>{saved ? 'Saved' : 'Save'}</button>
          <button onClick={onExport} disabled={exporting} style={{ ...ui.btnPrimary, flex: 1.4 }}>{exporting ? 'Exporting…' : 'Export PNG'}</button>
        </div>
      </div>

      {/* Stage */}
      <div style={{ flex: 1, ...ui.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'auto' }}>
        <div style={{ position: 'relative', width: 1080 * PREVIEW_SCALE, height: 1350 * PREVIEW_SCALE, border: '1px solid var(--border-hairline)', borderRadius: 2 }}>
          <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg style="width:100%;height:100%;display:block" ') }} />
          <div
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onWheel={onWheel}
            title="Drag to pan · scroll to zoom"
            style={{ position: 'absolute', left: mod.photoRegion.x * PREVIEW_SCALE, top: mod.photoRegion.y * PREVIEW_SCALE, width: mod.photoRegion.w * PREVIEW_SCALE, height: mod.photoRegion.h * PREVIEW_SCALE, cursor: drag.current ? 'grabbing' : 'grab' }}
          />
        </div>
      </div>
    </div>
  );
}
