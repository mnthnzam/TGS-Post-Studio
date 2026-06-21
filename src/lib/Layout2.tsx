import { Logo } from './Logo';
import { HashtagPill } from './HashtagPill';
import { AccentText } from './AccentText';
import { Photo } from './Photo';
import { TYPE, presetToStyle } from '../tokens/typography';
import type { PostContent } from '../types';

/**
 * Layout 2 — Curiosity Labs (full-bleed + overlay). Source: §8.
 * Full-bleed photo, gradient overlay from y=540 (h=810), Kalam headline at y≈1020.
 * Overlay height follows the spec (§8.3), not the prototype's 58%.
 */
export function Layout2({ content }: { content: PostContent }) {
  return (
    <>
      <Photo
        photo={content.photo}
        placeholderBg="linear-gradient(160deg, #2D4A7A 0%, #1E3A4A 45%, #0F1F2E 100%)"
        placeholderLabel="Insert photo — full bleed 1080×1350, subject in upper half"
        defaultObjectPosition="50% 35%"
        style={{ position: 'absolute', inset: 0, width: 1080, height: 1350 }}
      />

      {/* Gradient overlay — bottom to top, CW_OVERLAY → transparent */}
      <div
        data-testid="overlay"
        style={{
          position: 'absolute',
          left: 0,
          top: 540,
          width: 1080,
          height: 810,
          background: 'linear-gradient(to top, var(--cw-overlay) 0%, rgba(0,0,0,0) 100%)',
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 1020,
          width: 900,
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <AccentText
          text={content.headline}
          accent={content.accent}
          preset={TYPE.displayL2}
          color="#FFFFFF"
          style={{ display: 'block' }}
        />
        <div
          style={{
            ...presetToStyle(TYPE.bodyDark),
            color: 'rgba(255,255,255,0.88)',
            maxWidth: 860,
          }}
        >
          {content.body}
        </div>
      </div>

      <Logo variant="white" />
      <HashtagPill hashtag={content.hashtag} boosted={content.boosted} ctaLine={content.ctaLine} />
    </>
  );
}
