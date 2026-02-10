"use client";

import { useState, useCallback } from "react";
import type { WallpaperPreset, ImageFormat } from "@/app/lib/presets";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProcessOptions {
  file: File;
  preset: WallpaperPreset;
  format: ImageFormat;
  quality: number;
  cropArea?: CropArea;
}

export function useImageProcess() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processImage = useCallback(async (options: ProcessOptions) => {
    setProcessing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", options.file);
      formData.append("format", options.format);
      formData.append("quality", String(options.quality));
      formData.append("width", String(options.preset.width));
      formData.append("height", String(options.preset.height));

      if (options.cropArea) {
        formData.append("cropX", String(options.cropArea.x));
        formData.append("cropY", String(options.cropArea.y));
        formData.append("cropWidth", String(options.cropArea.width));
        formData.append("cropHeight", String(options.cropArea.height));
      }

      setProgress(40);

      const response = await fetch("/api/image", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "处理失败");
      }

      const blob = await response.blob();
      setProgress(100);

      return blob;
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, []);

  return { processImage, processing, progress };
}
