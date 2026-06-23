// GIF encoding via `gifenc` (install: npm i gifenc). Browser-only.
// The package is imported lazily so the app runs fine before it's installed —
// only an actual GIF export needs it.

type GifMod = { GIFEncoder: () => GifHandle; quantize: (d: Uint8ClampedArray, n: number) => unknown; applyPalette: (d: Uint8ClampedArray, p: unknown) => unknown };
type GifHandle = {
  writeFrame: (index: unknown, w: number, h: number, opts: { palette: unknown; delay: number }) => void;
  finish: () => void;
  bytes: () => Uint8Array;
};

export async function loadGif(): Promise<GifMod> {
  return (await import('gifenc')) as unknown as GifMod;
}

export function createGif(mod: GifMod): GifHandle {
  return mod.GIFEncoder();
}

export function addGifFrame(mod: GifMod, gif: GifHandle, imageData: ImageData, fps: number): void {
  const { data, width, height } = imageData;
  const palette = mod.quantize(data, 256);
  const index = mod.applyPalette(data, palette);
  gif.writeFrame(index, width, height, { palette, delay: Math.round(1000 / fps) });
}

export function finishGif(gif: GifHandle): Blob {
  gif.finish();
  return new Blob([gif.bytes() as unknown as BlobPart], { type: 'image/gif' });
}
