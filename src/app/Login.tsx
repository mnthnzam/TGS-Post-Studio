import { useState } from 'react';
import { requestMagicLink } from '../cloud';
import { ui } from '../ui/styles';
import { ASSETS } from '../assets';

export default function Login({ onOffline }: { onOffline: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    const e = email.trim();
    if (!e) return;
    setBusy(true); setErr('');
    try { await requestMagicLink(e); setSent(true); }
    catch { setErr('Could not send the link. Make sure this email has been invited to the team.'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ height: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ ...ui.card, width: 380, padding: '28px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
          <img src={ASSETS.iconColor} alt="Tatva" style={{ width: 22, height: 22, display: 'block' }} />
          <strong style={{ fontSize: 12.5, letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>TGS · STUDIO</strong>
        </div>

        {sent ? (
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Check your email</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We sent a sign-in link to <strong>{email}</strong>. Open it on this device to access the shared library.
            </div>
            <button style={{ ...ui.btn, marginTop: 18 }} onClick={() => setSent(false)}>Use a different email</button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Sign in</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Team members get a magic link by email — no password.</div>
            <input
              style={ui.field} type="email" placeholder="you@zamstars.com" value={email}
              onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
            {err && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>{err}</div>}
            <button style={{ ...ui.btnPrimary, width: '100%', marginTop: 14 }} onClick={submit} disabled={busy}>{busy ? 'Sending…' : 'Send magic link'}</button>
            <button style={{ ...ui.btn, width: '100%', marginTop: 8, border: 'none', color: 'var(--text-tertiary)' }} onClick={onOffline}>Use offline on this device</button>
          </div>
        )}
      </div>
    </div>
  );
}
