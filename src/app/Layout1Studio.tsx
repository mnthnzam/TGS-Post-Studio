import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, PointerEvent as RPointerEvent, WheelEvent as RWheelEvent } from 'react';
import { buildLayout1Svg, PHOTO_REGION } from '../svg/layout1';
import type { ColorwayId, Layout1Params } from '../svg/layout1';
import { PRESETS } from '../presets/index';
import { exportLayout1Png } from './exportLayout1';
import { ASSETS, injectFontFaces } from '../assets';

interface PhotoState { href: string; w: number; h: number }
const DEFAULT_PHOTO: PhotoState = { href: ASSETS.teacher.href, w: ASSETS.teacher.w, h: ASSETS.teacher.h };
const CW_LABELS: Record<ColorwayId, string> = { A: 'Tatva Blue', B: 'Tatva Green', C: 'Learning Amber' };
const PREVIEW_SCALE = 0.5;
const TEXT_MAX_W = 852; // inner text width inside the blue panel

// Offscreen canvas for measuring/wrapping text at true (1080-space) sizes.
let _ctx: CanvasRenderingContext2D | null = null;
function ctx(): CanvasRenderingContext2D {
  if (!_ctx) _ctx = document.createElement('canvas').getContext('2d')!;
  return _ctx;
}
function measure(text: string, font: string): number {
  const c = ctx();
  c.font = font;
  return c.measureText(text).width;
}
// Word-wrap to maxW, honoring manual line breaks as hard breaks.
function wrap(text: string, font: string, maxW: number): string[] {
  const c = ctx();
  c.font = font;
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(' ');
    let cur = '';
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (cur && c.measureText(t).width > maxW) { out.push(cur); cur = w; }
      else cur = t;
    }
    out.push(cur);
  }
  return out;
}

const field: CSSProperties = {
  width: '100%', padding: '8px 10px', background: '#23252f', border: '1px solid #383b47',
  borderRadius: 6, color: '#e8e8ea', fontSize: 13, fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box',
};
const label: CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7e8c', marginBottom: 4, display: 'block' };
const row: CSSProperties = { display: 'flex', gap: 10 };

export default function Layout1Studio() {
  const [headline, setHeadline] = useState('Great futures begin with\ngreat guidance.');
  const [body, setBody] = useState('Our teachers light the path to excellence.\nOne lesson, one conversation,\none breakthrough at a time.');
  const [hashtag, setHashtag] = useState('#TheCuriosityLab');
  const [colorway, setColorway] = useState<ColorwayId>('A');
  const [photo, setPhoto] = useState<PhotoState>(DEFAULT_PHOTO);
  const [scale, setScale] = useState(1);
  const [focalX, setFocalX] = useState(0);
  const [focalY, setFocalY] = useState(-346);
  const [headlineSize, setHeadlineSize] = useState(66);
  const [bodySize, setBodySize] = useState(27);
  const [exporting, setExporting] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    injectFontFaces();
    const fs = (document as Document & { fonts?: FontFaceSet }).fonts;
    fs?.ready.then(() => setFontsReady(true));
  }, []);

  // Wrap text to the panel width and measure the pill (recompute once fonts load).
  const headlineLines = useMemo(
    () => wrap(headline, `700 ${headlineSize}px Kalam`, TEXT_MAX_W),
    [headline, headlineSize, fontsReady],
  );
  const bodyLines = useMemo(
    () => wrap(body, `400 ${bodySize}px Poppins`, TEXT_MAX_W),
    [body, bodySize, fontsReady],
  );
  const pillTextWidth = useMemo(
    () => measure(hashtag, '600 20px Poppins'),
    [hashtag, fontsReady],
  );

  const params: Layout1Params = useMemo(() => ({
    headlineLines, bodyLines,
    hashtag, colorway,
    preset: PRESETS['feed-portrait'],
    photoHref: photo.href, photoW: photo.w, photoH: photo.h,
    scale, focalX, focalY, headlineSize, bodySize,
    logoHref: ASSETS.logoColor, pillTextWidth,
  }), [headlineLines, bodyLines, hashtag, colorway, photo, scale, focalX, focalY, headlineSize, bodySize, pillTextWidth]);

  const svg = useMemo(() => buildLayout1Svg(params), [params]);

  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const href = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setPhoto({ href, w: img.naturalWidth, h: img.naturalHeight }); setScale(1); setFocalX(0); setFocalY(0); };
    img.src = href;
  };

  // drag to pan the photo; wheel to zoom
  const onPointerDown = (e: RPointerEvent) => { drag.current = { x: e.clientX, y: e.clientY }; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
  const onPointerMove = (e: RPointerEvent) => {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.x) / PREVIEW_SCALE;
    const dy = (e.clientY - drag.current.y) / PREVIEW_SCALE;
    drag.current = { x: e.clientX, y: e.clientY };
    setFocalX((v) => v + dx);
    setFocalY((v) => v + dy);
  };
  const onPointerUp = () => { drag.current = null; };
  const onWheel = (e: RWheelEvent) => { setScale((s) => Math.min(4, Math.max(1, s - e.deltaY * 0.001))); };

  const onExport = async () => {
    setExporting(true);
    try { await exportLayout1Png(params, hashtag.replace('#', '')); }
    catch (err) { alert('Export failed: ' + (err as Error).message); }
    finally { setExporting(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1c26', fontFamily: 'Poppins, sans-serif' }}>
      {/* Controls */}
      <div style={{ width: 360, padding: 22, display: 'flex', flexDirection: 'column', gap: 14, borderRight: '1px solid #2a2d39', overflowY: 'auto', maxHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFC352' }} />
          <strong style={{ color: '#fff', fontSize: 13, letterSpacing: '0.05em' }}>TGS POST STUDIO · Layout 1</strong>
        </div>

        <div>
          <span style={label}>Headline (⏎ for line break)</span>
          <textarea style={{ ...field, minHeight: 56, resize: 'vertical' }} value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>
        <div style={row}>
          <div style={{ flex: 1 }}>
            <span style={label}>Headline size ({headlineSize})</span>
            <input type="range" min={40} max={92} value={headlineSize} onChange={(e) => setHeadlineSize(+e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>
        <div>
          <span style={label}>Body</span>
          <textarea style={{ ...field, minHeight: 70, resize: 'vertical' }} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div style={row}>
          <div style={{ flex: 1 }}>
            <span style={label}>Body size ({bodySize})</span>
            <input type="range" min={16} max={44} value={bodySize} onChange={(e) => setBodySize(+e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>
        <div>
          <span style={label}>Hashtag</span>
          <input style={field} value={hashtag} onChange={(e) => setHashtag(e.target.value)} />
        </div>
        <div>
          <span style={label}>Colorway</span>
          <select style={field} value={colorway} onChange={(e) => setColorway(e.target.value as ColorwayId)}>
            {(['A', 'B', 'C'] as ColorwayId[]).map((c) => <option key={c} value={c}>{CW_LABELS[c]}</option>)}
          </select>
        </div>
        <div style={{ borderTop: '1px solid #2a2d39', paddingTop: 12 }}>
          <span style={label}>Photo — drag preview to pan, scroll to zoom</span>
          <input type="file" accept="image/*" onChange={onPhoto} style={{ color: '#aaa', fontSize: 12 }} />
        </div>
        <div style={row}>
          <div style={{ flex: 1 }}>
            <span style={label}>Zoom ({scale.toFixed(2)}×)</span>
            <input type="range" min={1} max={4} step={0.02} value={scale} onChange={(e) => setScale(+e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>
        <div style={row}>
          <div style={{ flex: 1 }}>
            <span style={label}>Pan X ({Math.round(focalX)})</span>
            <input type="range" min={-500} max={500} value={focalX} onChange={(e) => setFocalX(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={label}>Pan Y ({Math.round(focalY)})</span>
            <input type="range" min={-1000} max={300} value={focalY} onChange={(e) => setFocalY(+e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        <button onClick={onExport} disabled={exporting} style={{ padding: '12px', background: '#1E3A8A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
          {exporting ? 'Exporting…' : 'Download PNG (1080×1350)'}
        </button>
      </div>

      {/* Live preview with photo-drag overlay */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40, overflow: 'auto' }}>
        <div style={{ position: 'relative', width: 1080 * PREVIEW_SCALE, height: 1350 * PREVIEW_SCALE, boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg style="width:100%;height:100%;display:block" ') }} />
          {/* transparent drag layer over the photo region */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onWheel={onWheel}
            title="Drag to pan · scroll to zoom"
            style={{
              position: 'absolute',
              left: PHOTO_REGION.x * PREVIEW_SCALE,
              top: PHOTO_REGION.y * PREVIEW_SCALE,
              width: PHOTO_REGION.w * PREVIEW_SCALE,
              height: PHOTO_REGION.h * PREVIEW_SCALE,
              cursor: drag.current ? 'grabbing' : 'grab',
            }}
          />
        </div>
      </div>
    </div>
  );
}
