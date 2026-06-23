// H.264 MP4 encoding via WebCodecs + `mp4-muxer` (install: npm i mp4-muxer).
// Browser-only; WebCodecs is available in Chrome/Edge and Safari 16.4+.
// `mp4-muxer` is imported lazily so the app runs fine before it's installed.

// WebCodecs globals aren't always in TS's DOM lib, so reach them dynamically.
const VEnc = (globalThis as unknown as { VideoEncoder?: unknown }).VideoEncoder as
  | (new (init: { output: (c: unknown, m: unknown) => void; error: (e: unknown) => void }) => {
      configure: (cfg: Record<string, unknown>) => void;
      encode: (frame: unknown, opts?: { keyFrame?: boolean }) => void;
      flush: () => Promise<void>;
    })
  | undefined;
const VFrame = (globalThis as unknown as { VideoFrame?: unknown }).VideoFrame as
  | (new (src: CanvasImageSource, init: { timestamp: number; duration: number }) => { close: () => void })
  | undefined;

export function isMp4Supported(): boolean {
  return typeof VEnc !== 'undefined' && typeof VFrame !== 'undefined';
}

export interface Mp4Session {
  encoder: InstanceType<NonNullable<typeof VEnc>>;
  muxer: { addVideoChunk: (c: unknown, m: unknown) => void; finalize: () => void };
  target: { buffer: ArrayBuffer };
}

export async function createMp4Encoder(width: number, height: number, fps: number): Promise<Mp4Session> {
  if (!VEnc) throw new Error('WebCodecs VideoEncoder unavailable');
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: 'avc', width, height }, fastStart: 'in-memory' });
  const encoder = new VEnc({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error('VideoEncoder error', e),
  });
  // High profile, level 5.2 — supports up to 1080×1920 frames.
  encoder.configure({ codec: 'avc1.640034', width, height, bitrate: 8_000_000, framerate: fps });
  return { encoder, muxer, target };
}

export function addMp4Frame(session: Mp4Session, canvas: HTMLCanvasElement, frameIndex: number, fps: number): void {
  if (!VFrame) throw new Error('WebCodecs VideoFrame unavailable');
  const frame = new VFrame(canvas, {
    timestamp: Math.round((frameIndex * 1e6) / fps),
    duration: Math.round(1e6 / fps),
  });
  // keyframe every ~2 seconds
  session.encoder.encode(frame, { keyFrame: frameIndex % (fps * 2) === 0 });
  frame.close();
}

export async function finishMp4(session: Mp4Session): Promise<Blob> {
  await session.encoder.flush();
  session.muxer.finalize();
  return new Blob([session.target.buffer], { type: 'video/mp4' });
}
