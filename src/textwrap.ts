// Browser canvas text measurement + word wrapping (honors manual \n as hard breaks).
let _ctx: CanvasRenderingContext2D | null = null;
function ctx(): CanvasRenderingContext2D {
  if (!_ctx) _ctx = document.createElement('canvas').getContext('2d')!;
  return _ctx;
}

export function measure(text: string, font: string): number {
  const c = ctx();
  c.font = font;
  return c.measureText(text).width;
}

export function wrap(text: string, font: string, maxW: number): string[] {
  const c = ctx();
  c.font = font;
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(' ');
    let cur = '';
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (cur && c.measureText(t).width > maxW) {
        out.push(cur);
        cur = w;
      } else cur = t;
    }
    out.push(cur);
  }
  return out;
}
