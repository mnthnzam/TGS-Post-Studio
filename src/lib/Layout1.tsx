import { Logo } from './Logo';
import { HashtagPill } from './HashtagPill';
import { AccentText } from './AccentText';
import { Photo } from './Photo';
import { TYPE, presetToStyle } from '../tokens/typography';
import type { PostContent } from '../types';

/**
 * Layout 1 — Teacher-Centric Story Frame. Source: §7.
 * Photo top 58% (1080x783), bottom content zone 42%, left accent border, Kalam quote.
 * Logo is always white on Layout 1 (dark variant is Layout-3/Amber only — §5.3).
 */
export function Layout1({ content }: { content: PostContent }) {
  return (
    <>
      <Photo
        photo={content.photo}
        placeholderBg="#B0B8C5"
        placeholderLabel="Insert photo — 1080×783 min, cover fit"
        defaultObjectPosition="50% 20%"
        style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 783 }}
      />

      {/* Kalam display quote — anchored near the bottom of the photo zone (~y760) */}
      <div style={{ position: 'absolute', left: 50, width: 980, bottom: 590, zIndex: 5 }}>
        <AccentText
          text={content.headline}
          accent={content.accent}
          preset={TYPE.displayL1}
          color="#FFFFFF"
          style={{
            display: 'block',
            textShadow: '0 2px 12px rgba(0,0,0,0.40), 0 0 40px rgba(0,0,0,0.20)',
          }}
        />
      </div>

      {/* Bottom content zone */}
      <div
        data-testid="bottom-zone"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 1080,
          height: 567,
          background: 'var(--cw-bottom-bg)',
          borderLeft: '5px solid var(--cw-border)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 55,
          top: 825,
          width: 925,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          zIndex: 6,
        }}
      >
        <div style={{ ...presetToStyle(TYPE.bodyLong), color: 'var(--cw-bottom-text)' }}>
          {content.body}
        </div>
        {content.attribution && (
          <div style={{ ...presetToStyle(TYPE.attribution), color: 'var(--cw-primary)' }}>
            {content.attribution}
          </div>
        )}
      </div>

      <Logo variant="white" />
      <HashtagPill hashtag={content.hashtag} boosted={content.boosted} ctaLine={content.ctaLine} />
    </>
  );
}
