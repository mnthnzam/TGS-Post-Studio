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

// Parse magic-link return (#access_token=…). Returns true if a session was set.
export function consumeAuthRedirect(): boolean {
  const h = window.location.hash;
  if (!h || !h.includes('access_token=')) return false;
  const p = new URLSearchParams(h.slice(1));
  const at = p.get('access_token'); const rt = p.get('refresh_token');
  history.replaceState(null, '', window.location.pathname + window.location.search);
  if (at && rt) { setSession(fromTokens(at, rt)); return true; }
  return false;
}

export async function requestMagicLink(email: string): Promise<void> {
  const redirect = encodeURIComponent(window.location.origin + window.location.pathname);
  const res = await fetch(`${SUPABASE_URL}/auth/v1/otp?redirect_to=${redirect}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    // create_user true: an allow-listed email can sign in on first use. Access to
    // the library is gated in Postgres (team_members allow-list + RLS), so a
    // non-listed sign-in is authenticated but can read/write nothing.
    body: JSON.stringify({ email, create_user: true }),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Could not send the link');
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
