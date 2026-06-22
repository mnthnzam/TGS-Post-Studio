import { useState } from 'react';
import { signIn, signUp } from '../cloud';
import { ui } from '../ui/styles';
import { ASSETS } from '../assets';

export default function Login({ onAuthed, onOffline }: { onAuthed: () => void; onOffline: () => void }) {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');

  const submit = async () => {
    const e = email.trim();
    if (!e || !password) return;
    setBusy(true); setErr(''); setNote('');
    try {
      if (mode === 'in') { await signIn(e, password); onAuthed(); }
      else {
        const signedIn = await signUp(e, password);
        if (signedIn) onAuthed();
        else setNote('Account created. If email confirmation is on, confirm via the email, then sign in.');
      }
    } catch (ex) {
      setErr((ex as Error).message || 'Something went wrong');
    } finally { setBusy(false); }
  };

  return (
    <div style={{ height: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ ...ui.card, width: 380, padding: '28px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
          <img src={ASSETS.iconColor} alt="Tatva" style={{ width: 22, height: 22, display: 'block' }} />
          <strong style={{ fontSize: 12.5, letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>TGS · STUDIO</strong>
        </div>

        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{mode === 'in' ? 'Sign in' : 'Create account'}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Team members only. Use your Zamstars email.</div>

        <input style={{ ...ui.field, marginBottom: 8 }} type="email" placeholder="you@zamstars.com" value={email}
          onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <input style={ui.field} type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />

        {err && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>{err}</div>}
        {note && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{note}</div>}

        <button style={{ ...ui.btnPrimary, width: '100%', marginTop: 14 }} onClick={submit} disabled={busy}>
          {busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}
        </button>

        <button style={{ ...ui.btn, width: '100%', marginTop: 8, border: 'none', color: 'var(--text-secondary)' }}
          onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setErr(''); setNote(''); }}>
          {mode === 'in' ? 'First time? Create an account' : 'Have an account? Sign in'}
        </button>
        <button style={{ ...ui.btn, width: '100%', marginTop: 4, border: 'none', color: 'var(--text-tertiary)' }} onClick={onOffline}>
          Use offline on this device
        </button>
      </div>
    </div>
  );
}
