import { useRef, useState } from 'react';
import { PostRenderer } from '../lib/PostRenderer';
import { PhotoControl } from './PhotoControl';
import { exportPost } from './exportImage';
import type { ExportFormat } from './exportImage';
import { BUCKETS, BUCKET_RULES } from '../logic/mappings';
import type { Bucket } from '../logic/mappings';
import { isTypicallyBoosted } from '../logic/postTypes';
import type { PostContent, ColorwayId, LayoutId } from '../types';

const COLORWAY_LABELS: Record<ColorwayId, string> = { A: 'Tatva Blue', B: 'Tatva Green', C: 'Learning Amber' };
const LAYOUT_LABELS: Record<LayoutId, string> = { L1: 'L1 · Teacher', L2: 'L2 · Curiosity', L3: 'L3 · Beyond' };

const SEED: PostContent = {
  layout: 'L1',
  colorway: 'A',
  headline: 'Great futures begin with great guidance.',
  accent: 'guidance.',
  body: "Our teachers don't just teach. They observe, adapt, and walk alongside each child's unique journey — building the confidence that no textbook ever could.",
  attribution: '— The Tatva Teacher Community',
  hashtag: '#TatvaPulse',
  boosted: false,
};

const field: React.CSSProperties = {
  width: '100%', padding: '7px 9px', background: '#23252f', border: '1px solid #383b47',
  borderRadius: 6, color: '#e8e8ea', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
};
const label: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7e8c',
};

export default function Generator() {
  const [content, setContent] = useState<PostContent>(SEED);
  const [bucket, setBucket] = useState<Bucket>('Tatva Pulse');
  const stageRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<PostContent>) => setContent((c) => ({ ...c, ...patch }));

  // Bucket drives layout + colorway + hashtag + boost suggestion (all still editable).
  const applyBucket = (b: Bucket) => {
    setBucket(b);
    const rule = BUCKET_RULES[b];
    set({ layout: rule.layout, colorway: rule.colorway, hashtag: rule.hashtag, boosted: isTypicallyBoosted(b) });
  };

  const doExport = async (fmt: ExportFormat) => {
    if (stageRef.current) await exportPost(stageRef.current, fmt, bucket);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1c26', fontFamily: 'DM Sans, sans-serif' }}>
      {/* ── Controls ── */}
      <div style={{ width: 340, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, borderRight: '1px solid #2a2d39', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFC352' }} />
          <strong style={{ color: '#fff', fontSize: 13, letterSpacing: '0.05em' }}>TGS STUDIO</strong>
        </div>

        <div>
          <div style={label}>Content bucket</div>
          <select style={field} value={bucket} onChange={(e) => applyBucket(e.target.value as Bucket)}>
            {BUCKETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={label}>Layout</div>
            <select style={field} value={content.layout} onChange={(e) => set({ layout: e.target.value as LayoutId })}>
              {(['L1', 'L2', 'L3'] as LayoutId[]).map((l) => <option key={l} value={l}>{LAYOUT_LABELS[l]}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={label}>Colorway</div>
            <select style={field} value={content.colorway} onChange={(e) => set({ colorway: e.target.value as ColorwayId })}>
              {(['A', 'B', 'C'] as ColorwayId[]).map((c) => <option key={c} value={c}>{COLORWAY_LABELS[c]}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div style={label}>Headline (use ⏎ for line breaks)</div>
          <textarea style={{ ...field, minHeight: 56, resize: 'vertical' }} value={content.headline} onChange={(e) => set({ headline: e.target.value })} />
        </div>
        <div>
          <div style={label}>Accent word(s)</div>
          <input style={field} value={content.accent ?? ''} onChange={(e) => set({ accent: e.target.value })} />
        </div>
        <div>
          <div style={label}>Body</div>
          <textarea style={{ ...field, minHeight: 72, resize: 'vertical' }} value={content.body} onChange={(e) => set({ body: e.target.value })} />
        </div>
        {content.layout === 'L1' && (
          <div>
            <div style={label}>Attribution (optional)</div>
            <input style={field} value={content.attribution ?? ''} onChange={(e) => set({ attribution: e.target.value })} />
          </div>
        )}
        <div>
          <div style={label}>Hashtag</div>
          <input style={field} value={content.hashtag} onChange={(e) => set({ hashtag: e.target.value })} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c8ccd8', fontSize: 13 }}>
          <input type="checkbox" checked={!!content.boosted} onChange={(e) => set({ boosted: e.target.checked })} />
          Boosted (adds CTA line)
        </label>

        <div>
          <div style={label}>Photo</div>
          <PhotoControl value={content.photo} onChange={(photo) => set({ photo })} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={() => doExport('png')} style={{ flex: 1, padding: '10px', background: '#1E3A8A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            Download PNG
          </button>
          <button onClick={() => doExport('jpg')} style={{ flex: 1, padding: '10px', background: '#23252f', color: '#c8ccd8', border: '1px solid #383b47', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            JPG
          </button>
        </div>
      </div>

      {/* ── Live preview ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40, overflow: 'auto' }}>
        <PostRenderer ref={stageRef} content={content} scale={0.45} />
      </div>
    </div>
  );
}
