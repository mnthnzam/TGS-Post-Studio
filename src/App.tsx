import { useEffect, useState } from 'react';
import Shell from './app/Shell';
import Login from './app/Login';
import { cloudEnabled } from './cloud-config';
import { consumeAuthRedirect, isAuthed } from './cloud';
import { syncFromCloud } from './store';

export default function App() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (cloudEnabled) consumeAuthRedirect();
    const a = cloudEnabled && isAuthed();
    setAuthed(a);
    setReady(true);
    if (a) syncFromCloud();
  }, []);

  if (!ready) return null;
  if (cloudEnabled && !authed && !offline) return <Login onOffline={() => setOffline(true)} />;
  return <Shell signedIn={authed} />;
}
