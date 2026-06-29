# TGS Studio — Expansion Plan

From a single Layout-1 editor → a multi-layout, multi-section app.

## Architecture

**Layout modules (registry pattern).** Each layout is a self-contained module:

```
LayoutModule {
  id: 'L1' | 'L2' | 'L3';
  label: string;
  schema: FieldSchema[];          // which content fields this layout uses
  defaults: Partial<PostDoc>;
  build(doc): string;             // returns the 1080×1350 SVG (preview == export)
  interaction?: { photoRegion };  // hints for the drag/zoom overlay
}
```

A `registry` maps `id → module`. The **Editor renders its controls from `schema`**, so a new layout = one new module, no editor changes.

**Shared primitives** (extracted from today's Layout 1 into `svg/common.ts`): logo placement, left-aligned auto-sized pill, canvas text-wrap + measure, photo cover/pan/zoom math, colorway styles, rounded-rect helpers, font embedding for export.

**Data model.**

```
PostDoc {
  id; name; layoutId; colorway;
  content: { headline; body; hashtag; attribution?; ... };
  style:   { headlineSize; bodySize; ... };
  photo:   { src; w; h; scale; focalX; focalY } | null;
  bucket?; createdAt; updatedAt;
}
```

**Persistence.** `localStorage` store (`list/get/save/delete/duplicate`). Works on `file://`, compatible with the single-file build. Per-browser only (no cloud sync yet).

**Navigation.** State-based section switch (no URL router → `file://` safe).

## Sections

| Section | Purpose |
|---|---|
| **Editor** | Today's studio, generalized to any layout via its schema. Live preview + Save + quick Export. |
| **Dashboard** | Grid of saved posts (SVG thumbnails) + 3 layout "start new" cards. Filter by bucket/colorway. Edit / duplicate / delete. |
| **Exports** | Select one or many posts → PNG/JPG. Plus colorway-variant export (Blue/Green/Amber at once) and batch export. |
| **Brand / Settings** | Manage logo variants + default hashtags per bucket. Fonts locked (Kalam + Poppins). |

## Extra features

1. **Bucket-driven new post** — pick a content bucket → auto-set layout + colorway + hashtag (design-system §11–12 mappings, already coded).
2. **Colorway-variant export** — one post, three colorways, exported together.
3. *(Deferred)* content calendar/scheduling, shared photo library, cloud sync.

## Milestones

- **M1 — Refactor + shell.** Extract shared primitives; wrap Layout 1 as a `LayoutModule`; add `PostDoc` + `localStorage` store; app shell with **Editor + Dashboard**. No visual change to Layout 1.
- **M2 — Layout 2** (Curiosity, full-bleed + overlay) as a module, geometry pulled from Figma node `2562:207`.
- **M3 — Layout 3** (Beyond, dynamic cutout) as a module, from Figma node `2562:212`.
- **M4 — Exports section** (single + colorway-variant + batch).
- **M5 — Bucket-driven creation + Brand/Settings.**
- **M6 — Polish, QC, regenerate standalone HTML.**

## Open decision

Sequencing: **refactor-first (M1)** then layouts, vs **layouts-first** (get all 3 working in the current single-screen editor) then build sections.
