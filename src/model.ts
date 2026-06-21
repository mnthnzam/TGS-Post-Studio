// Core data model for the multi-layout studio.

export type ColorwayId = 'A' | 'B' | 'C';
export type LayoutId = 'L1' | 'L2' | 'L3';

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
  bucket?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BuildOpts {
  photoHref?: string; // override (e.g. data URI for export)
  logoHref?: string;
  fontFaceCss?: string; // embed fonts for rasterization
}

export interface Rect { x: number; y: number; w: number; h: number; }

export interface LayoutModule {
  id: LayoutId;
  label: string;
  photoRegion: Rect; // draggable photo area in 1080-space (for pan/zoom overlay)
  newDoc(): PostDoc;
  build(doc: PostDoc, opts?: BuildOpts): string; // returns 1080×1350 SVG
}

export const uid = (): string =>
  (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);
