// Animation model for video export. Each animatable element has a state at time t,
// computed from a choreography style (per-element effect + timing). The state is
// applied by the SVG builders as opacity + a pivot-aware transform.

export type ElementId = 'photo' | 'headline' | 'body' | 'pill' | 'logo';

export type EasingId = 'linear' | 'easeOut' | 'easeInOut' | 'easeOutBack';

// How an element evolves over its local progress p ∈ [0,1].
export type AnimEffect =
  | 'none'      // identity (visible, static)
  | 'fade'      // opacity 0 → 1
  | 'rise'      // opacity 0 → 1, translateY from +OFFSET → 0
  | 'fall'      // opacity 0 → 1, translateY from -OFFSET → 0
  | 'pop'       // opacity 0 → 1, scale from 0.86 → 1
  | 'slideL'    // opacity 0 → 1, translateX from +OFFSET → 0
  | 'slideR'    // opacity 0 → 1, translateX from -OFFSET → 0
  | 'kenBurns'; // opacity 1, scale 1 → 1.08 across the whole step (continuous push-in)

export interface AnimStep {
  effect: AnimEffect;
  delayMs: number;
  durMs: number;
  easing: EasingId;
}

// Resolved state for one element at a moment in time, in base (1080) space.
// Builders scale dx/dy to the active preset and apply scale about the element pivot.
export interface ElementState {
  opacity: number;
  scale: number;
  dx: number; // base-space px
  dy: number; // base-space px
}

export const IDENTITY: ElementState = { opacity: 1, scale: 1, dx: 0, dy: 0 };

export interface ChoreographyStyle {
  id: string;
  label: string;
  totalMs: number;
  steps: Partial<Record<ElementId, AnimStep>>;
}

// Per-element state map passed into a builder to render one animated frame.
export type AnimMap = Partial<Record<ElementId, ElementState>>;
