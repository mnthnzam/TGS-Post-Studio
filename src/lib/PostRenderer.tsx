import { forwardRef } from 'react';
import { Stage } from './Stage';
import { Layout1 } from './Layout1';
import { Layout2 } from './Layout2';
import { Layout3 } from './Layout3';
import type { PostContent } from '../types';

interface PostRendererProps {
  content: PostContent;
  scale?: number;
}

const LAYOUTS = {
  L1: Layout1,
  L2: Layout2,
  L3: Layout3,
} as const;

/**
 * Single entry point used by both the generator and Storybook.
 * Wraps the selected layout in a colorway-scoped Stage. The forwarded ref
 * targets the true-size Stage node for image export.
 */
export const PostRenderer = forwardRef<HTMLDivElement, PostRendererProps>(
  function PostRenderer({ content, scale = 1 }, ref) {
    const LayoutComponent = LAYOUTS[content.layout];
    return (
      <Stage colorway={content.colorway} scale={scale} ref={ref}>
        <LayoutComponent content={content} />
      </Stage>
    );
  },
);
