// localStorage-backed store of saved posts. Works on file:// (single-file build).
import type { PostDoc } from './model';

const KEY = 'tgs.posts.v1';

function readAll(): PostDoc[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PostDoc[]) : [];
  } catch {
    return [];
  }
}

function writeAll(docs: PostDoc[]): void {
  localStorage.setItem(KEY, JSON.stringify(docs));
}

export const store = {
  list(): PostDoc[] {
    return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
  },
  get(id: string): PostDoc | undefined {
    return readAll().find((d) => d.id === id);
  },
  save(doc: PostDoc): void {
    const docs = readAll();
    const i = docs.findIndex((d) => d.id === doc.id);
    const next = { ...doc, updatedAt: Date.now() };
    if (i >= 0) docs[i] = next;
    else docs.push(next);
    writeAll(docs);
  },
  remove(id: string): void {
    writeAll(readAll().filter((d) => d.id !== id));
  },
  duplicate(id: string, uidFn: () => string): PostDoc | undefined {
    const doc = readAll().find((d) => d.id === id);
    if (!doc) return undefined;
    const copy: PostDoc = { ...doc, id: uidFn(), name: `${doc.name} copy`, createdAt: Date.now(), updatedAt: Date.now() };
    const docs = readAll();
    docs.push(copy);
    writeAll(docs);
    return copy;
  },
};
