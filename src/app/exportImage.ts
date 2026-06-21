import { toPng, toJpeg } from 'html-to-image';

export type ExportFormat = 'png' | 'jpg';

// Slugged, timestamped filename, e.g. tgs-values-based-1718900000000.png
export function buildFileName(label: string, format: ExportFormat): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `tgs-${slug || 'post'}-${Date.now()}.${format}`;
}

/**
 * Capture the TRUE-SIZE Stage node at 1080x1350 and trigger a download.
 * Waits for web fonts to settle first (Kalam/Poppins) to avoid fallback-font captures.
 */
export async function exportPost(
  stageEl: HTMLElement,
  format: ExportFormat,
  label: string,
): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    } catch {
      /* non-fatal */
    }
  }

  const options = {
    width: 1080,
    height: 1350,
    pixelRatio: 1,
    cacheBust: true,
    // Neutralise the on-screen preview scale during capture.
    style: { transform: 'scale(1)', transformOrigin: 'top left' },
  };

  const dataUrl =
    format === 'png' ? await toPng(stageEl, options) : await toJpeg(stageEl, { ...options, quality: 0.95 });

  const link = document.createElement('a');
  link.download = buildFileName(label, format);
  link.href = dataUrl;
  link.click();
}
