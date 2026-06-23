// Rasterize an SVG frame string to a canvas at the target pixel size.
// Reuses one canvas across frames for performance.

export async function svgToCanvas(
  svg: string,
  w: number,
  h: number,
  canvas: HTMLCanvasElement,
): Promise<HTMLCanvasElement> {
  const url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Frame render failed'));
    img.src = url;
  });
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}
