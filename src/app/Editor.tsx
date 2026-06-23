import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, PointerEvent as RPointerEvent, ReactNode, WheelEvent as RWheelEvent } from 'react';
import { getModule } from '../layouts/registry';
import { injectFontFaces } from '../assets';
import { presetOf, PRESET_LIST } from '../presets/index';
import { store } from '../store';
import { exportDocPng } from './export';
import PhotoPicker from '../photoLibrary/PhotoPicker';
import { incrementUsage } from '../photoLibrary/db';
import { blobToDataUrl } from '../photoLibrary/thumbnails';
import type { PhotoEntry } from '../photoLibrary/types';
import { ANIM_STYLES, DEFAULT_STYLE_ID, getStyle } from '../anim/styles';
import { animMapAt } from '../anim/engine';
import type { VideoFormat } from '../anim/exportVideo';
import type { AnimMap } from '../anim/types';
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
// The preview stage scales each preset to fit a fixed display box.
const VIEW_MAX_W = 520;
const VIEW_MAX_H = 660;

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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [animStyleId, setAnimStyleId] = useState(DEFAULT_STYLE_ID);
  const [previewing, setPreviewing] = useState(false);
  const [previewAnim, setPreviewAnim] = useState<AnimMap | null>(null);
  const [vExport, setVExport] = useState('');
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { injectFontFaces(); }, []);

  const set = <K extends keyof PostDoc>(k: K, v: PostDoc[K]) => { setDoc((d) => ({ ...d, [k]: v })); setSaved(false); };
  const setPhoto = (patch: Partial<PhotoVal>) => setDoc((d) => (d.photo ? { ...d, photo: { ...d.photo, ...patch } } : d));
  // Focal point is stored per-preset, so panning on one format doesn't move it on another.
  const setFocal = (patch: { focalX?: number; focalY?: number }) => {
    setDoc((d) => {
      const cur = d.photoFocalPoints?.[d.preset] ?? { focalX: d.photo?.focalX ?? 0, focalY: d.photo?.focalY ?? 0 };
      return { ...d, photoFocalPoints: { ...(d.photoFocalPoints ?? {}), [d.preset]: { ...cur, ...patch } } };
    });
    setSaved(false);
  };
  const panBy = (dx: number, dy: number) => {
    setDoc((d) => {
      const cur = d.photoFocalPoints?.[d.preset] ?? { focalX: d.photo?.focalX ?? 0, focalY: d.photo?.focalY ?? 0 };
      return { ...d, photoFocalPoints: { ...(d.photoFocalPoints ?? {}), [d.preset]: { focalX: cur.focalX + dx, focalY: cur.focalY + dy } } };
    });
    setSaved(false);
  };
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
  const preset = presetOf(doc.preset);
  const view = Math.min(VIEW_MAX_W / preset.w, VIEW_MAX_H / preset.h);
  const region = mod.photoRegion(preset);
  const fpCur = doc.photoFocalPoints?.[doc.preset];
  const focalX = fpCur?.focalX ?? doc.photo?.focalX ?? 0;
  const focalY = fpCur?.focalY ?? doc.photo?.focalY ?? 0;
  const svg = useMemo(() => mod.build(doc, preset, previewAnim ? { anim: previewAnim } : {}), [doc, mod, preset, previewAnim]);

  // Live animation preview: loop the chosen choreography in the stage.
  useEffect(() => {
    if (!previewing) { setPreviewAnim(null); return; }
    const style = getStyle(animStyleId);
    const loopMs = style.totalMs + 700; // brief hold before looping
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      setPreviewAnim(animMapAt(style, (performance.now() - start) % loopMs));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [previewing, animStyleId]);

  const onExportVideo = async (fmt: VideoFormat) => {
    setPreviewing(false);
    setVExport('Rendering 0%');
    try {
      // Loaded lazily so the editor runs without the encoder packages installed.
      const { exportVideo } = await import('../anim/exportVideo');
      await exportVideo(doc, animStyleId, fmt, { onProgress: (p) => setVExport(`Rendering ${Math.round(p * 100)}%`) });
    } catch (err) {
      alert('Video export failed: ' + (err as Error).message);
    } finally {
      setVExport('');
    }
  };

  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => { setDoc((d) => ({ ...d, photo: { src, w: img.naturalWidth, h: img.naturalHeight, scale: 1, focalX: 0, focalY: 0 }, photoFocalPoints: {} })); setSaved(false); };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const onPickFromLibrary = async (entry: PhotoEntry) => {
    setPickerOpen(false);
    try {
      const src = await blobToDataUrl(entry.blob);
      setDoc((d) => ({ ...d, photo: { src, w: entry.width, h: entry.height, scale: 1, focalX: 0, focalY: 0 }, photoFocalPoints: {} }));
      setSaved(false);
      incrementUsage(entry.id);
    } catch (e) {
      alert('Could not load photo: ' + (e as Error).message);
    }
  };

  const onPointerDown = (e: RPointerEvent) => { drag.current = { x: e.clientX, y: e.clientY }; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
  const onPointerMove = (e: RPointerEvent) => {
    if (!drag.current || !doc.photo) return;
    const dx = (e.clientX - drag.current.x) / view;
    const dy = (e.clientY - drag.current.y) / view;
    drag.current = { x: e.clientX, y: e.clientY };
    panBy(dx, dy);
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
              <button onClick={() => setPickerOpen(true)} style={{ ...ui.btn, marginTop: 8, width: '100%' }}>Choose from Library</button>
            </div>
            {doc.photo && <>
              <Slider label="Zoom" value={doc.photo.scale} min={1} max={4} step={0.02} suffix="×" onChange={(v) => setPhoto({ scale: v })} />
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}><Slider label="Pan X" value={focalX} min={-1000} max={1000} suffix="px" onChange={(v) => setFocal({ focalX: v })} /></div>
                <div style={{ flex: 1 }}><Slider label="Pan Y" value={focalY} min={-1200} max={1200} suffix="px" onChange={(v) => setFocal({ focalY: v })} /></div>
              </div>
            </>}
          </Group>

          <Group title="Animation (video)">
            <div>{fieldLabel('Choreography style')}
              <select style={ui.field} value={animStyleId} onChange={(e) => setAnimStyleId(e.target.value)}>
                {ANIM_STYLES.map((s) => <option key={s.id} value={s.id}>{s.label} · {(s.totalMs / 1000).toFixed(1)}s</option>)}
              </select>
            </div>
            <button onClick={() => setPreviewing((v) => !v)} style={{ ...ui.btn, ...(previewing ? { background: 'var(--accent-weak)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}) }}>
              {previewing ? '■ Stop preview' : '▶ Play preview'}
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onExportVideo('mp4')} disabled={!!vExport} style={{ ...ui.btnPrimary, flex: 1 }}>Export MP4</button>
              <button onClick={() => onExportVideo('gif')} disabled={!!vExport} style={{ ...ui.btn, flex: 1 }}>Export GIF</button>
            </div>
            {vExport && <span style={{ ...ui.readout, color: 'var(--accent)' }}>{vExport}…</span>}
            <span style={{ ...ui.label, marginBottom: 0, textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)' }}>MP4 needs Chrome/Edge or Safari 16.4+.</span>
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
      <div style={{ flex: 1, ...ui.canvas, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 40, overflow: 'auto' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {PRESET_LIST.map((p) => (
            <button
              key={p.id}
              onClick={() => set('preset', p.id)}
              title={p.label}
              style={{ ...ui.btn, padding: '5px 11px', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.25, ...(doc.preset === p.id ? { background: 'var(--accent-weak)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}) }}
            >
              <span style={{ fontWeight: 600 }}>{p.aspectLabel}</span>
              <span style={{ fontSize: 9.5, opacity: 0.7 }}>{p.label.replace(/^\S+\s/, '')}</span>
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: preset.w * view, height: preset.h * view, border: '1px solid var(--border-hairline)', borderRadius: 2 }}>
          <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg style="width:100%;height:100%;display:block" ') }} />
          <div
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onWheel={onWheel}
            title="Drag to pan · scroll to zoom"
            style={{ position: 'absolute', left: region.x * view, top: region.y * view, width: region.w * view, height: region.h * view, cursor: drag.current ? 'grabbing' : 'grab' }}
          />
        </div>
      </div>

      {pickerOpen && <PhotoPicker onSelect={onPickFromLibrary} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}
