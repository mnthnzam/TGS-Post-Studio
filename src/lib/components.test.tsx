import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';
import { HashtagPill } from './HashtagPill';
import { AccentText } from './AccentText';
import { Stage } from './Stage';
import { PostRenderer } from './PostRenderer';
import { TYPE } from '../tokens/typography';
import type { PostContent } from '../types';

describe('Stage', () => {
  it('is a true 1080x1350 relative, clipped canvas', () => {
    render(<Stage colorway="A">x</Stage>);
    const stage = screen.getByTestId('stage');
    expect(stage).toHaveStyle({
      width: '1080px',
      height: '1350px',
      position: 'relative',
      overflow: 'hidden',
    });
    expect(stage).toHaveAttribute('data-cw', 'A');
  });
});

describe('Logo (non-negotiable §5)', () => {
  it('sits fixed top-left at 50,50, topmost', () => {
    render(<Logo variant="white" />);
    const logo = screen.getByTestId('logo');
    expect(logo).toHaveStyle({ position: 'absolute', left: '50px', top: '50px', zIndex: '20' });
  });
  it('dark variant renders TATVA in Tatva Blue', () => {
    render(<Logo variant="dark" />);
    expect(screen.getByText('TATVA')).toHaveStyle({ color: '#1E3A8A' });
  });
});

describe('HashtagPill (non-negotiable §6)', () => {
  it('organic pill is a full pill anchored bottom-right', () => {
    render(<HashtagPill hashtag="#TatvaPulse" />);
    const pill = screen.getByTestId('pill');
    expect(pill).toHaveStyle({ position: 'absolute', right: '50px', bottom: '50px', borderRadius: '999px' });
  });
  it('boosted pill adds the spec CTA line and squares to radius 12', () => {
    render(<HashtagPill hashtag="#TatvaPulse" boosted />);
    expect(screen.getByText(/tatvaglobalschool\.com/)).toBeInTheDocument();
    expect(screen.getByTestId('pill')).toHaveStyle({ borderRadius: '12px' });
  });
});

describe('AccentText', () => {
  it('wraps the accent run in its own span', () => {
    render(<AccentText text="Just give it a shot!" accent="a shot!" preset={TYPE.displayL3} />);
    expect(screen.getByTestId('accent')).toHaveTextContent('a shot!');
  });
  it('renders plain when no accent matches', () => {
    render(<AccentText text="No accent here" accent="missing" preset={TYPE.displayL1} />);
    expect(screen.queryByTestId('accent')).toBeNull();
  });
});

describe('PostRenderer', () => {
  const base: PostContent = {
    layout: 'L2',
    colorway: 'A',
    headline: 'Small experiments.\nBig learning.',
    accent: 'Big learning.',
    body: 'Exploring ideas, testing theories, discovering more.',
    hashtag: '#TheCuriosityLab',
  };

  it('renders Layout 2 with overlay + logo + pill', () => {
    render(<PostRenderer content={base} />);
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('pill')).toBeInTheDocument();
  });

  it('switches layout component by content.layout', () => {
    const { rerender } = render(<PostRenderer content={base} />);
    expect(screen.getByTestId('overlay')).toBeInTheDocument(); // L2 has overlay
    rerender(<PostRenderer content={{ ...base, layout: 'L1' }} />);
    expect(screen.queryByTestId('overlay')).toBeNull(); // L1 has none
    expect(screen.getByTestId('bottom-zone')).toBeInTheDocument();
  });

  it('Layout 3 on Amber uses the dark logo', () => {
    render(<PostRenderer content={{ ...base, layout: 'L3', colorway: 'C' }} />);
    expect(screen.getByText('TATVA')).toHaveStyle({ color: '#1E3A8A' });
  });
});
