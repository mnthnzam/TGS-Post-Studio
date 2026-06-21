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

## Data & sharing

Posts and brand settings are stored per-browser in `localStorage`. Hosting makes **app updates** seamless for the team; it does **not** sync the post library between people. To move a library between machines, use **Exports → Project backup** (download/import `.json`). A shared cloud library would require adding a backend (e.g. Supabase) — a future step.

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
