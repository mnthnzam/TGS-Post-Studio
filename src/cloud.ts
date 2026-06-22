// Dependency-free Supabase client: GoTrue email magic-link auth + PostgREST CRUD.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './cloud-config';
import type { PostDoc } from './model';

interface Session { access_token: string; refresh_token: string; expires_at: number; email: string }
const SKEY = 'tgs.session';

function emailFromJwt(token: string): string {
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))));
    return payload.email ?? '';
  } catch { return ''; }
}
function expFromJwt(token: string): number {
  try { return (JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp ?? 0) * 1000; } catch { return 0; }
}

let session: Session | null = (() => { try { return JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch { return null; } })();
function setSession(s: Session | null) { session = s; if (s) localStorage.setItem(SKEY, JSON.stringify(s)); else localStorage.removeItem(SKEY); }
function fromTokens(access_token: string, refresh_token: string): Session {
  return { access_token, refresh_token, expires_at: expFromJwt(access_token) || Date.now() + 3600_000, email: emailFromJwt(access_token) };
}

export const isAuthed = () => !!session;
export const getEmail = () => session?.email ?? null;

function applyAuthResponse(data: { access_token?: string; refresh_token?: string }): boolean {
  if (data?.access_token && data?.refresh_token) { setSession(fromTokens(data.access_token, data.refresh_token)); return true; }
  return false; // e.g. email confirmation required
}
function authError(data: { error_description?: string; msg?: string; message?: string }, fallback: string): string {
  return data?.error_description || data?.msg || data?.message || fallback;
}

export async function signIn(email: string, password: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(authError(data, 'Sign-in failed'));
  if (!applyAuthResponse(data)) throw new Error('Sign-in did not return a session');
}

// Returns true if signed in immediately, false if email confirmation is required.
export async function signUp(email: string, password: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(authError(data, 'Sign-up failed'));
  return applyAuthResponse(data);
}

export async function signOut(): Promise<void> {
  try { await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session?.access_token}` } }); } catch { /* ignore */ }
  setSession(null);
}

async function ensureFresh(): Promise<void> {
  if (!session) return;
  if (Date.now() < session.expires_at - 60_000) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (res.ok) { const d = await res.json(); setSession(fromTokens(d.access_token, d.refresh_token)); }
    else setSession(null);
  } catch { /* keep session; request may still work or fail clearly */ }
}

async function authed(path: string, init: RequestInit = {}): Promise<Response> {
  await ensureFresh();
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session?.access_token ?? SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (res.status === 401) { setSession(null); throw new Error('Session expired — please sign in again'); }
  if (!res.ok) throw new Error(`Cloud error ${res.status}: ${await res.text()}`);
  return res;
}

export async function cloudList(): Promise<PostDoc[]> {
  const res = await authed('/rest/v1/posts?select=doc&order=updated_at.desc');
  return ((await res.json()) as { doc: PostDoc }[]).map((r) => r.doc);
}

export async function cloudUpsert(doc: PostDoc): Promise<void> {
  await authed('/rest/v1/posts?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: doc.id, doc, name: doc.name, layout_id: doc.layoutId, updated_at: new Date().toISOString() }),
  });
}

export async function cloudDelete(id: string): Promise<void> {
  await authed(`/rest/v1/posts?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
}
