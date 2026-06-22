import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Shell from './app/Shell';
import Login from './app/Login';
import { cloudEnabled } from './cloud-config';
import { isAuthed } from './cloud';
import { syncFromCloud } from './store';

export default function App() {
  const [authed, setAuthed] = useState(() => cloudEnabled && isAuthed());
  const [offline, setOffline] = useState(false);

  useEffect(() => { if (authed) syncFromCloud(); }, [authed]);

  const content = cloudEnabled && !authed && !offline
    ? <Login onAuthed={() => setAuthed(true)} onOffline={() => setOffline(true)} />
    : <Shell signedIn={authed} />;

  return (
    <>
      {content}
      <Analytics />
    </>
  );
}
