import { Logo } from './Logo';
import { HashtagPill } from './HashtagPill';
import { AccentText } from './AccentText';
import { Photo } from './Photo';
import { TYPE, FONT_BODY } from '../tokens/typography';
import type { PostContent } from '../types';

/**
 * Layout 3 — Beyond the Chalkboard (dynamic cutout). Source: §9.
 * Solid CW_PRIMARY bg, right photo cutout, 3 decorative shapes, left headline zone.
 * Logo is dark only on Amber (Colorway C) — §5.3.
 */
export function Layout3({ content }: { content: PostContent }) {
  const isAmber = content.colorway === 'C';
  const bodyColor = isAmber ? 'rgba(31,41,55,0.72)' : 'rgba(255,255,255,0.82)';

  return (
    <>
      {/* Solid colorway background */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--cw-primary)' }} />

      {/* Shape C — floating dot, below the photo */}
      <div
        style={{
          position: 'absolute',
          left: 400,
          top: 130,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'var(--cw-accent-shape)',
          opacity: 0.6,
          zIndex: 1,
        }}
      />

      {/* Photo cutout — right side */}
      <Photo
        photo={content.photo}
        placeholderBg="linear-gradient(135deg, #90CAF9 0%, #42A5F5 50%, #1565C0 100%)"
        placeholderLabel="Insert photo — 594×1140, subject centred"
        style={{ position: 'absolute', left: 486, top: 100, width: 594, height: 1140, zIndex: 2 }}
      />

      {/* Shape A — top-right accent (above photo) */}
      <div
        style={{
          position: 'absolute',
          left: 1010,
          top: 190,
          width: 68,
          height: 68,
          borderRadius: '50% 0 50% 50%',
          transform: 'rotate(35deg)',
          background: 'var(--cw-accent-shape)',
          zIndex: 3,
        }}
      />
      {/* Shape B — bottom-left accent */}
      <div
        style={{
          position: 'absolute',
          left: 18,
          top: 1145,
          width: 44,
          height: 44,
          borderRadius: '50% 50% 0 50%',
          transform: 'rotate(-25deg)',
          background: 'var(--cw-accent-shape)',
          zIndex: 3,
        }}
      />

      {/* Headline + body — left zone, constrained to max-width 420 */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 900,
          width: 420,
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <AccentText
          text={content.headline}
          accent={content.accent}
          preset={TYPE.displayL3}
          color="var(--cw-text-on-primary)"
          style={{ display: 'block' }}
        />
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: '11px',
            fontWeight: 400,
            lineHeight: 1.55,
            maxWidth: 400,
            color: bodyColor,
          }}
        >
          {content.body}
        </div>
      </div>

      <Logo variant={isAmber ? 'dark' : 'white'} />
      <HashtagPill hashtag={content.hashtag} boosted={content.boosted} ctaLine={content.ctaLine} />
    </>
  );
}
