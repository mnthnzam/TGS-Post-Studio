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

**No login** — the shared library is open: anyone who opens the app reads/writes the same posts. The database policies allow the public (anon) key full access to the `posts` table; the client uses that key directly. If no internet, the app falls back to the local cache.

> Note: this is intentionally open — anyone with the URL can edit or delete any post. To re-introduce access control later, restore the allow-list/RLS policies and the email+password login (kept in `src/cloud.ts` and `src/app/Login.tsx`).

## Animated video export (MP4 / GIF)

The editor's **Animation** panel plays a choreography preview and exports the post as a
short video (per-element entrance + Ken Burns photo push-in). This needs two browser-only
packages — install once:

```bash
npm install mp4-muxer gifenc
```

The live preview and everything else work without them; only the **Export MP4 / Export GIF**
buttons require the install. MP4 uses WebCodecs (Chrome/Edge, or Safari 16.4+); GIF works
everywhere but is downscaled for size. Choreography styles live in `src/anim/styles.ts`.

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
