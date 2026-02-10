"use client";

import { useState, useCallback, useRef } from "react";
import { getFFmpeg } from "@/app/lib/ffmpeg";
import type { WallpaperPreset, VideoFormat } from "@/app/lib/presets";

interface VideoProcessOptions {
  file: File;
  preset: WallpaperPreset;
  format: VideoFormat;
  quality: number;
  /** Crop region in pixels of the source video */
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
}

export function useFFmpeg() {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const ffmpegRef = useRef<Awaited<ReturnType<typeof getFFmpeg>> | null>(null);

  const load = useCallback(async () => {
    if (ready) return;
    setLoading(true);
    try {
      const ffmpeg = await getFFmpeg();
      ffmpegRef.current = ffmpeg;
      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });
      setReady(true);
    } catch (err) {
      console.error("FFmpeg load failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ready]);

  const processVideo = useCallback(
    async (options: VideoProcessOptions): Promise<Blob> => {
      if (!ffmpegRef.current) {
        await load();
      }
      const ffmpeg = ffmpegRef.current!;

      setProcessing(true);
      setProgress(0);

      try {
        const inputExt = options.file.name.split(".").pop() || "mp4";
        const inputName = `input.${inputExt}`;

        // Determine output extension
        let outputExt = options.format;
        if (options.format === "gif") outputExt = "gif";
        const outputName = `output.${outputExt}`;

        // Write input file (dynamic import to avoid server-side bundling)
        const { fetchFile } = await import("@ffmpeg/util");
        await ffmpeg.writeFile(inputName, await fetchFile(options.file));

        // Build FFmpeg command
        const args: string[] = ["-i", inputName];

        // Video filter chain
        const filters: string[] = [];

        // Crop if specified
        if (
          options.cropX !== undefined &&
          options.cropY !== undefined &&
          options.cropW &&
          options.cropH
        ) {
          filters.push(
            `crop=${options.cropW}:${options.cropH}:${options.cropX}:${options.cropY}`
          );
        }

        // Scale to target size
        filters.push(
          `scale=${options.preset.width}:${options.preset.height}:force_original_aspect_ratio=decrease,pad=${options.preset.width}:${options.preset.height}:(ow-iw)/2:(oh-ih)/2`
        );

        if (filters.length > 0) {
          args.push("-vf", filters.join(","));
        }

        // Format-specific options
        if (options.format === "mp4") {
          args.push("-c:v", "libx264");
          args.push("-crf", String(Math.round(51 - (options.quality / 100) * 41)));
          args.push("-preset", "fast");
          args.push("-movflags", "+faststart");
          args.push("-c:a", "aac", "-b:a", "128k");
        } else if (options.format === "webm") {
          args.push("-c:v", "libvpx-vp9");
          args.push("-crf", String(Math.round(63 - (options.quality / 100) * 53)));
          args.push("-b:v", "0");
          args.push("-c:a", "libopus", "-b:a", "128k");
        } else if (options.format === "gif") {
          // Two-pass GIF for better quality
          args.push("-loop", "0");
        }

        args.push("-y", outputName);

        await ffmpeg.exec(args);

        // Read output
        const data = await ffmpeg.readFile(outputName);
        const uint8 = data as Uint8Array;

        // Determine mime type
        let mime = "video/mp4";
        if (options.format === "webm") mime = "video/webm";
        if (options.format === "gif") mime = "image/gif";

        const blob = new Blob([new Uint8Array(uint8)], { type: mime });

        // Cleanup
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);

        return blob;
      } finally {
        setProcessing(false);
        setProgress(0);
      }
    },
    [load]
  );

  return { load, processVideo, loading, processing, progress, ready };
}
