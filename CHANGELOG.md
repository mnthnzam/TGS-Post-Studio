# Changelog

All notable changes to TGS Studio are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned — v1.1.0 · Content Calendar & Scheduling
- Content calendar view — plan posts by date and content bucket
- Draft / scheduled / published status per post
- Monthly value auto-prompt (pulls from brand context for the active month)
- WhatsApp-adapted copy export alongside caption

### Planned — v1.2.0 · Format Expansion
- Instagram Stories format (1080×1920, 9:16)
- LinkedIn single-image format (1200×627, 1.91:1)
- Square format (1080×1080, 1:1)
- Format switcher in the editor — one post, multiple format exports at once

### Planned — v1.3.0 · Collaboration & Cloud
- Shared post library visible to all team members in real time
- Post approval workflow (Draft → Review → Approved)
- Comment thread per post
- Version history — restore any previous save of a post

### Planned — v2.0.0 · Multi-Brand Studio
- Tatva Kids (TK) brand support with its own layouts, colorways, and tone rules
- Brand switcher in the shell (TGS ↔ TK)
- Per-brand saved-post libraries and brand settings
- Unified export queue across both brands

---

## [1.0.0] — 2026-06-30

First stable release of TGS Studio (formerly TGS Post Studio).

### Layouts
- **L1 — Statement** — Bold headline + body copy + decorative bottom zone
- **L2 — Curiosity** — Full-bleed photo with gradient overlay and headline
- **L3 — Beyond** — Dynamic photo cutout with headline panel
- **L4 — Aurora** — Gradient background with large display headline
- **L5 — Gradient Panel** — Split gradient with photo and text panel

### Colorways
- **A — Tatva Blue** (primary brand navy)
- **B — Forest Green**
- **C — Amber**

### Brand System (Brand Master July 2026)
- **Typography**: DM Serif Display (400 regular + italic) + DM Sans (300/400/500/700) — replaces Kalam + Poppins
- **Grid**: 54 px safe margins (≈5 % of 1080 px canvas); 5-column reference grid
- **Hashtag pill**: Anchored bottom-left across all layouts
- **Framework**: Four Cs (Cognition, Curiosity, Compassion, Character) — replaces 3Cs
- **Colors**: Added Warm Orange (#F17833) and Lavender Grey (#E9E7EF); corrected Hashtag Coral spelling

### Editor
- Live 1080×1350 SVG preview (what you see = what exports)
- Headline, body, hashtag, attribution, and accent-word fields
- Font size sliders per field
- Photo pan, zoom, and focal-point controls
- Bucket-driven creation (auto-sets layout + colorway + hashtag from content type)
- Light / dark UI

### Exports
- PNG and JPG (full resolution)
- Colorway-variant batch export (one post → all 3 colorways at once)
- Caption text export
- Animated MP4 and GIF (entrance choreography + Ken Burns photo)
- Self-contained offline HTML build

### Data & Sync
- Saved-post library with edit, duplicate, and delete
- Supabase shared library (team-wide, open access)
- `localStorage` cache for offline use
- Project backup / restore

### Brand Tools
- Brand settings panel (logo variants, default hashtags per bucket)
- Style-guide export (PDF / HTML / PNG)

---

[Unreleased]: https://github.com/mnthnzam/tgs-post-studio/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mnthnzam/tgs-post-studio/releases/tag/v1.0.0
