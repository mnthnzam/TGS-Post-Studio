import { useState } from 'react';
import type { CSSProperties } from 'react';
import Dashboard from './Dashboard';
import Editor from './Editor';
import Exports from './Exports';
import BrandSettings from './BrandSettings';
import PhotoLibrary from '../photoLibrary/PhotoLibrary';
import { getModule } from '../layouts/registry';
import { BUCKET_RULES, preferredColorway } from '../logic/mappings';
import type { Bucket } from '../logic/mappings';
import { getBucketHashtag } from '../settings';
import { useTheme } from '../ui/theme';
import { ASSETS } from '../assets';
import type { LayoutId, PostDoc } from '../model';

type Section = 'dashboard' | 'editor' | 'library' | 'exports' | 'brand';
const TABS: { id: Section; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'editor', label: 'Editor' },
  { id: 'library', label: 'Library' },
  { id: 'exports', label: 'Exports' },
  { id: 'brand', label: 'Brand' },
];

const accountBtn: CSSProperties = { padding: '6px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)' };

const tabStyle = (active: boolean): CSSProperties => ({
  position: 'relative', padding: '7px 13px', borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
  background: active ? 'var(--accent-weak)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-secondary)', border: 'none',
});

export default function Shell() {
  const [section, setSection] = useState<Section>('dashboard');
  const [doc, setDoc] = useState<PostDoc | null>(null);
  const [theme, toggleTheme] = useTheme();

  const openNew = (id: LayoutId) => { setDoc(getModule(id).newDoc()); setSection('editor'); };
  const openNewFromBucket = (b: Bucket) => {
    const rule = BUCKET_RULES[b];
    const d = getModule(rule.layout).newDoc();
    setDoc({ ...d, colorway: preferredColorway(b), hashtag: getBucketHashtag(b), bucket: b, name: b });
    setSection('editor');
  };
  const openEdit = (d: PostDoc) => { setDoc(d); setSection('editor'); };
  const backToDash = () => { setDoc(null); setSection('dashboard'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '11px 18px', borderBottom: '1px solid var(--border-hairline)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src={theme === 'dark' ? ASSETS.iconWhite : ASSETS.iconColor} alt="Tatva" style={{ width: 20, height: 20, display: 'block' }} />
          <strong style={{ fontSize: 12.5, letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>TGS · STUDIO</strong>
        </div>
        <nav style={{ display: 'flex', gap: 3, marginLeft: 10 }}>
          {TABS.map((t) => (
            <button key={t.id} style={tabStyle(section === t.id)} onClick={() => (t.id === 'editor' ? doc && setSection('editor') : setSection(t.id))} disabled={t.id === 'editor' && !doc}>
              {t.label}
              {section === t.id && <span style={{ position: 'absolute', left: 13, right: 13, bottom: -12, height: 2, background: 'var(--accent)', borderRadius: 2 }} />}
            </button>
          ))}
        </nav>
        <button onClick={toggleTheme} title="Toggle theme" style={{ ...accountBtn, marginLeft: 'auto' }}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
      </header>

      {section === 'dashboard' && <Dashboard onNew={openNew} onNewFromBucket={openNewFromBucket} onEdit={openEdit} />}
      {section === 'editor' && doc && <Editor key={doc.id} initialDoc={doc} onBack={backToDash} />}
      {section === 'library' && <PhotoLibrary />}
      {section === 'exports' && <Exports />}
      {section === 'brand' && <BrandSettings />}
    </div>
  );
}
