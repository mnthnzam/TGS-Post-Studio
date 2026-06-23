/**
 * Generates a 200×200 thumbnail Blob from a File or Blob, and reports the
 * original's natural size. Uses an offscreen canvas (cover-crop, centred).
 * Always JPEG at 0.82 quality.
 */
export async function generateThumbnail(source: Blob): Promise<{ thumb: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      const THUMB_SIZE = 200;
      const canvas = document.createElement('canvas');
      canvas.width = THUMB_SIZE;
      canvas.height = THUMB_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      // Cover crop: centre the image in the 200×200 square.
      const scale = Math.max(THUMB_SIZE / img.width, THUMB_SIZE / img.height);
      const sw = THUMB_SIZE / scale;
      const sh = THUMB_SIZE / scale;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, THUMB_SIZE, THUMB_SIZE);

      const w = img.width;
      const h = img.height;
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('Thumbnail generation failed'));
            return;
          }
          resolve({ thumb: blob, width: w, height: h });
        },
        'image/jpeg',
        0.82,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

/** Read a Blob as a data URL (persists in localStorage, unlike object URLs). */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error ?? new Error('Read failed'));
    r.readAsDataURL(blob);
  });
}
