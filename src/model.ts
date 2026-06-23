// Core data model for the multi-layout studio.

import type { FormatPreset, PresetId } from './presets/index';
import type { AnimMap } from './anim/types';

export type ColorwayId = 'A' | 'B' | 'C';
export type LayoutId = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export interface PhotoVal {
  src: string;
  w: number;
  h: number;
  scale: number;
  focalX: number;
  focalY: number;
}

export type HashtagSide = 'left' | 'right';
export interface ShapeTransform { x: number; y: number; rotate: number; scale: number; }

// A user-imported decorative shape (its own SVG), with placement/size/rotation.
export interface CustomShape {
  id: string;
  dataUri: string; // data:image/svg+xml;base64,...
  baseW: number;
  baseH: number;
  x: number; // centre position
  y: number;
  scale: number;
  rotate: number; // degrees
}

export interface PostDoc {
  id: string;
  name: string;
  layoutId: LayoutId;
  colorway: ColorwayId;
  headline: string;
  body: string;
  hashtag: string;
  headlineSize: number;
  bodySize: number;
  headlineDY: number; // vertical nudge (left margin unchanged)
  bodyDY: number;
  hashtagSide: HashtagSide;
  caption?: string; // full post caption for scheduling/text export
  shape?: ShapeTransform; // decorative shape transform (L3 flower)
  customShapes?: CustomShape[]; // user-imported shapes (L3)
  photo: PhotoVal | null;
  preset: PresetId; // active canvas format; default 'feed-portrait'
  // Per-preset focal points: panning the photo on one format does not move it on another.
  photoFocalPoints?: Partial<Record<PresetId, { focalX: number; focalY: number }>>;
  bucket?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BuildOpts {
  photoHref?: string; // override (e.g. data URI for export)
  logoHref?: string;
  fontFaceCss?: string; // embed fonts for rasterization
  anim?: AnimMap; // per-element animation state for a single video frame
}

export interface Rect { x: number; y: number; w: number; h: number; }

export interface LayoutModule {
  id: LayoutId;
  label: string;
  photoRegion(preset: FormatPreset): Rect; // draggable photo area in preset-space (for pan/zoom overlay)
  newDoc(): PostDoc;
  build(doc: PostDoc, preset: FormatPreset, opts?: BuildOpts): string; // returns preset.w×preset.h SVG
}

export const uid = (): string =>
  (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);
