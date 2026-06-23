// Per-browser photo library, backed by IndexedDB. Dependency-free promise wrapper
// over the native IndexedDB API (same surface the `idb` package would give us, but
// without adding a dependency). No server, no cloud — storage is per-browser.

import type { PhotoEntry } from './types';

const DB_NAME = 'tgs-photo-library';
const DB_VERSION = 1;
const STORE = 'photos';

let _db: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (_db) return _db;
  _db = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('uploadedAt', 'uploadedAt');
        store.createIndex('bucket', 'bucket');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _db;
}

// Run a single request inside a transaction and resolve with its result.
function run<T>(mode: IDBTransactionMode, makeReq: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = makeReq(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function addPhoto(entry: PhotoEntry): Promise<void> {
  await run('readwrite', (s) => s.put(entry));
}

export async function listPhotos(): Promise<PhotoEntry[]> {
  // newest first
  const all = await run<PhotoEntry[]>('readonly', (s) => s.index('uploadedAt').getAll());
  return all.reverse();
}

export function getPhoto(id: string): Promise<PhotoEntry | undefined> {
  return run<PhotoEntry | undefined>('readonly', (s) => s.get(id));
}

export async function deletePhoto(id: string): Promise<void> {
  await run('readwrite', (s) => s.delete(id));
}

export async function incrementUsage(id: string): Promise<void> {
  const entry = await getPhoto(id);
  if (entry) {
    entry.usageCount += 1;
    await addPhoto(entry);
  }
}

export async function updateTags(id: string, tags: string[]): Promise<void> {
  const entry = await getPhoto(id);
  if (entry) {
    entry.tags = tags;
    await addPhoto(entry);
  }
}

/** All unique tags across the library, sorted (for filtering / autocomplete). */
export async function allTags(): Promise<string[]> {
  const photos = await listPhotos();
  const set = new Set<string>();
  photos.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
}
