# TGS Post Studio

An in-browser studio for producing on-brand Tatva Global School social posts (1080×1350). Three Figma-faithful layouts, full editor (copy, type, photo pan/zoom, hashtag side, decorative shapes), saved-post library, exports (PNG/JPG, colorway variants, captions, project backup), a brand style-guide export (PDF/HTML/PNG), bucket-driven creation, and a Brand settings panel. Light/dark UI.

Built with React + TypeScript + Vite. No backend — data lives in the browser (`localStorage`).

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # type-checks (tsc) then builds to dist/
npm run preview  # serve the production build locally
```

## Deploy (Vercel)

This repo is a standard Vite app — Vercel auto-detects it.

1. Push this folder to a GitHub repo.
2. On vercel.com → **New Project** → import the repo.
3. Framework preset: **Vite** (auto). Build command `npm run build`, output `dist`. Deploy.
4. Every push to `main` redeploys automatically — that's the team update path.

## Team sync (Supabase)

Saved posts sync to a shared Supabase library; `localStorage` is a local cache so the app still works offline. Team members sign in with an email magic link (no password). Brand settings stay per-browser.

Connection lives in `src/cloud-config.ts` (the anon key is public by design — row-level security + auth protect the data).

Access is gated by an allow-list in the database (`team_members` table + row-level security): only listed emails can read or write the library. Anyone else who signs in is authenticated but can access nothing.

**Required setup in the Supabase dashboard** (project `tgs-post-studio`):

1. **Authentication → URL Configuration** (the only required dashboard step)
   - Site URL: your production URL (the Vercel domain).
   - Redirect URLs: add `http://localhost:5173/` (dev) and your Vercel domain. Magic-link redirects must be allow-listed or login fails.

**To add a team member:** add their email to the allow-list — either ask me (I can run it), or in **SQL Editor**:

```sql
insert into team_members (email) values ('person@zamstars.com') on conflict do nothing;
```

They then enter that email on the sign-in screen → magic link → access. (No need to pre-create users or toggle signup settings — the allow-list is the gate.)

Notes: free-tier email is rate-limited (a few/hour) and links can land in spam — fine for a small team; add custom SMTP later if needed. "Use offline on this device" on the login screen gives a local-only fallback (no shared library).

## Self-contained build (optional)

```bash
node scripts/build-standalone.mjs   # → TGS_Post_Studio.html (one offline file)
```

## Project shape

- `src/svg/` — pure SVG builders for each layout + the style guide (preview == export)
- `src/layouts/` — layout modules (registry) wrapping the builders
- `src/app/` — editor, dashboard, exports, brand UI + the app shell
- `src/ui/` — theme tokens (light/dark) and shared styles
- `src/assets.ts`, `src/settings.ts`, `src/store.ts`, `src/model.ts` — assets, brand settings, saved-post store, data model
