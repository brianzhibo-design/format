// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ffmpegInstance: any = null;
let loadPromise: Promise<void> | null = null;

// Load FFmpeg directly from CDN ESM to bypass Turbopack bundling issues
// The /* webpackIgnore: true */ comment prevents the bundler from processing these imports
async function loadFFmpegFromCDN() {
  const { FFmpeg } = await import(
    /* webpackIgnore: true */
    // @ts-expect-error - loading ESM from CDN URL at runtime
    "https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js"
  );
  const { toBlobURL } = await import(
    /* webpackIgnore: true */
    // @ts-expect-error - loading ESM from CDN URL at runtime
    "https://unpkg.com/@ffmpeg/util@0.12.2/dist/esm/index.js"
  );
  return { FFmpeg, toBlobURL };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getFFmpeg(): Promise<any> {
  if (ffmpegInstance?.loaded) {
    return ffmpegInstance;
  }

  if (loadPromise) {
    await loadPromise;
    return ffmpegInstance;
  }

  const { FFmpeg, toBlobURL } = await loadFFmpegFromCDN();
  ffmpegInstance = new FFmpeg();

  loadPromise = (async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
  })();

  await loadPromise;
  return ffmpegInstance;
}

// Also export a CDN-based fetchFile
export async function cdnFetchFile(file: File | string): Promise<Uint8Array> {
  const { fetchFile } = await import(
    /* webpackIgnore: true */
    // @ts-expect-error - loading ESM from CDN URL at runtime
    "https://unpkg.com/@ffmpeg/util@0.12.2/dist/esm/index.js"
  );
  return fetchFile(file);
}
