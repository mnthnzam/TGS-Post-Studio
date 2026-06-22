import { useEffect, useState } from 'react';
import Shell from './app/Shell';
import Login from './app/Login';
import { cloudEnabled } from './cloud-config';
import { isAuthed } from './cloud';
import { syncFromCloud } from './store';

export default function App() {
  const [authed, setAuthed] = useState(() => cloudEnabled && isAuthed());
  const [offline, setOffline] = useState(false);

  useEffect(() => { if (authed) syncFromCloud(); }, [authed]);

  if (cloudEnabled && !authed && !offline) {
    return <Login onAuthed={() => setAuthed(true)} onOffline={() => setOffline(true)} />;
  }
  return <Shell signedIn={authed} />;
}
