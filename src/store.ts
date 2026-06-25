// Saved-post store: localStorage cache (instant, offline) synced to Supabase (shared).
import { useSyncExternalStore } from 'react';
import type { PostDoc } from './model';
import { cloudEnabled } from './cloud-config';
import { cloudList, cloudUpsert, cloudDelete } from './cloud';

const KEY = 'tgs.posts.v1';

// Migrate old PostDocs that predate the format-preset system.
function migrate(doc: PostDoc): PostDoc {
  if (!doc.preset) doc.preset = 'feed-portrait';
  if (!doc.photoFocalPoints) doc.photoFocalPoints = {};
  return doc;
}
function readAll(): PostDoc[] {
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as PostDoc[]).map(migrate) : []; } catch { return []; }
}
function writeAll(docs: PostDoc[]): void { localStorage.setItem(KEY, JSON.stringify(docs)); rebuild(); }

// stable snapshot for useSyncExternalStore (new reference only when data changes)
let snapshot: PostDoc[] = sortList(readAll());
function sortList(docs: PostDoc[]): PostDoc[] { return [...docs].sort((a, b) => b.updatedAt - a.updatedAt); }
function rebuild() { snapshot = sortList(readAll()); subs.forEach((cb) => cb()); }

const subs = new Set<() => void>();
function subscribe(cb: () => void) { subs.add(cb); return () => { subs.delete(cb); }; }

// No login: the shared library is open, so the cloud is active whenever configured.
const cloudActive = () => cloudEnabled;

export const store = {
  list(): PostDoc[] { return snapshot; },
  get(id: string): PostDoc | undefined { return readAll().find((d) => d.id === id); },

  save(doc: PostDoc): void {
    const docs = readAll();
    const i = docs.findIndex((d) => d.id === doc.id);
    const next = { ...doc, updatedAt: Date.now() };
    if (i >= 0) docs[i] = next; else docs.push(next);
    writeAll(docs);
    if (cloudActive()) cloudUpsert(next).catch((e) => console.warn('cloud upsert failed', e));
  },

  remove(id: string): void {
    writeAll(readAll().filter((d) => d.id !== id));
    if (cloudActive()) cloudDelete(id).catch((e) => console.warn('cloud delete failed', e));
  },

  duplicate(id: string, uidFn: () => string): PostDoc | undefined {
    const doc = readAll().find((d) => d.id === id);
    if (!doc) return undefined;
    const copy: PostDoc = { ...doc, id: uidFn(), name: `${doc.name} copy`, createdAt: Date.now(), updatedAt: Date.now() };
    store.save(copy);
    return copy;
  },
};

// Pull the shared library from the cloud into the local cache (last-write-wins by id).
export async function syncFromCloud(): Promise<void> {
  if (!cloudActive()) return;
  try {
    const cloud = await cloudList();
    const local = readAll();
    const byId = new Map<string, PostDoc>();
    for (const d of local) byId.set(d.id, d);
    for (const d of cloud) {
      const cur = byId.get(d.id);
      if (!cur || (d.updatedAt ?? 0) >= (cur.updatedAt ?? 0)) byId.set(d.id, d);
    }
    writeAll([...byId.values()]);
    // push any local-only posts up so the team gets them
    const cloudIds = new Set(cloud.map((d) => d.id));
    for (const d of local) if (!cloudIds.has(d.id)) cloudUpsert(d).catch(() => {});
  } catch (e) {
    console.warn('cloud sync failed', e);
  }
}

export function useStoreList(): PostDoc[] {
  return useSyncExternalStore(subscribe, () => snapshot);
}
