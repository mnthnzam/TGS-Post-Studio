import type { ChoreographyStyle } from './types';

// Curated choreography styles. Each animates the elements independently with its own
// timing, so this is true per-element choreography — driven by presets rather than a
// manual keyframe editor. The photo gets a continuous Ken Burns push-in throughout.

export const ANIM_STYLES: ChoreographyStyle[] = [
  {
    id: 'editorial',
    label: 'Editorial',
    totalMs: 4000,
    steps: {
      photo: { effect: 'kenBurns', delayMs: 0, durMs: 4000, easing: 'easeInOut' },
      logo: { effect: 'fade', delayMs: 0, durMs: 450, easing: 'easeOut' },
      headline: { effect: 'rise', delayMs: 150, durMs: 650, easing: 'easeOut' },
      body: { effect: 'rise', delayMs: 350, durMs: 650, easing: 'easeOut' },
      pill: { effect: 'pop', delayMs: 600, durMs: 500, easing: 'easeOutBack' },
    },
  },
  {
    id: 'punchy',
    label: 'Punchy',
    totalMs: 3500,
    steps: {
      photo: { effect: 'kenBurns', delayMs: 0, durMs: 3500, easing: 'linear' },
      logo: { effect: 'fade', delayMs: 0, durMs: 300, easing: 'easeOut' },
      headline: { effect: 'pop', delayMs: 0, durMs: 450, easing: 'easeOutBack' },
      body: { effect: 'fade', delayMs: 250, durMs: 400, easing: 'easeOut' },
      pill: { effect: 'pop', delayMs: 500, durMs: 450, easing: 'easeOutBack' },
    },
  },
  {
    id: 'calm',
    label: 'Calm',
    totalMs: 5000,
    steps: {
      photo: { effect: 'kenBurns', delayMs: 0, durMs: 5000, easing: 'easeInOut' },
      logo: { effect: 'fade', delayMs: 0, durMs: 700, easing: 'easeOut' },
      headline: { effect: 'fade', delayMs: 300, durMs: 900, easing: 'easeOut' },
      body: { effect: 'fade', delayMs: 700, durMs: 900, easing: 'easeOut' },
      pill: { effect: 'fade', delayMs: 1100, durMs: 700, easing: 'easeOut' },
    },
  },
];

export const DEFAULT_STYLE_ID = 'editorial';

export function getStyle(id: string): ChoreographyStyle {
  return ANIM_STYLES.find((s) => s.id === id) ?? ANIM_STYLES[0];
}
