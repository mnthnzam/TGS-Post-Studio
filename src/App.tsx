import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Shell from './app/Shell';
import { cloudEnabled } from './cloud-config';
import { syncFromCloud } from './store';

export default function App() {
  useEffect(() => { if (cloudEnabled) syncFromCloud(); }, []);

  return (
    <>
      <Shell />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
