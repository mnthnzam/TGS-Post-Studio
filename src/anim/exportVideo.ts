// Orchestrates animated video export: render each frame → rasterize → encode → download.
// Browser-only. MP4 needs WebCodecs; both formats need their npm package installed.
import { fontFaceCss } from '../app/export';
import { ASSETS } from '../assets';
import { getLogoColor, getLogoWhite } from '../settings';
import { presetOf } from '../presets/index';
import { getModule } from '../layouts/registry';
import { getStyle } from './styles';
import { animMapAt, frameCount, timeAtFrame } from './engine';
import { svgToCanvas } from './rasterize';
import { createMp4Encoder, addMp4Frame, finishMp4, isMp4Supported } from './encodeMp4';
import { loadGif, createGif, addGifFrame, finishGif } from './encodeGif';
import type { PostDoc } from '../model';

export type VideoFormat = 'mp4' | 'gif';
export interface VideoOpts { fps?: number; onProgress?: (p: number) => void; }

async function urlToDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function resolveAssets(doc: PostDoc) {
  const css = await fontFaceCss();
  const photoHref = doc.photo ? await urlToDataUrl(doc.photo.src) : await urlToDataUrl(ASSETS.teacher.href);
  const useColor = doc.layoutId === 'L1' || (doc.layoutId === 'L3' && doc.colorway === 'C');
  const logoHref = await urlToDataUrl(useColor ? getLogoColor() : getLogoWhite());
  return { css, photoHref, logoHref };
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'post';
const even = (n: number) => Math.round(n / 2) * 2;

export async function exportVideo(doc: PostDoc, styleId: string, fmt: VideoFormat, o: VideoOpts = {}): Promise<void> {
  const fps = o.fps ?? (fmt === 'gif' ? 15 : 30);
  const style = getStyle(styleId);
  const preset = presetOf(doc.preset);
  const mod = getModule(doc.layoutId);

  if (fmt === 'mp4' && !isMp4Supported()) {
    throw new Error('MP4 export needs WebCodecs (Chrome/Edge, or Safari 16.4+). Try GIF instead.');
  }

  const { css, photoHref, logoHref } = await resolveAssets(doc);
  const total = frameCount(style.totalMs, fps);

  // GIF is downscaled (file size + speed); MP4 stays full-resolution.
  const gscale = fmt === 'gif' ? Math.min(1, 640 / Math.max(preset.w, preset.h)) : 1;
  const W = even(preset.w * gscale);
  const H = even(preset.h * gscale);

  const canvas = document.createElement('canvas');
  const mp4 = fmt === 'mp4' ? await createMp4Encoder(W, H, fps) : null;
  const gifMod = fmt === 'gif' ? await loadGif() : null;
  const gif = gifMod ? createGif(gifMod) : null;

  for (let i = 0; i < total; i++) {
    const anim = animMapAt(style, timeAtFrame(i, fps));
    const svg = mod.build(doc, preset, { photoHref, logoHref, fontFaceCss: css, anim });
    await svgToCanvas(svg, W, H, canvas);
    if (mp4) {
      addMp4Frame(mp4, canvas, i, fps);
    } else if (gif && gifMod) {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      addGifFrame(gifMod, gif, ctx.getImageData(0, 0, W, H), fps);
    }
    o.onProgress?.((i + 1) / total);
    // yield so the UI can paint the progress bar
    await new Promise((r) => setTimeout(r, 0));
  }

  const blob = mp4 ? await finishMp4(mp4) : finishGif(gif!);
  download(blob, `tgs-${slug(doc.name || doc.hashtag)}-${style.id}.${fmt}`);
}
