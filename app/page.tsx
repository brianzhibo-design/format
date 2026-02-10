"use client";

import { useState, useCallback } from "react";
import type { Area } from "react-easy-crop";
import {
  Download,
  Loader2,
  Trash2,
  Globe,
  Wrench,
  Sparkles,
  FileImage,
  FileVideo,
} from "lucide-react";
import UploadZone from "@/app/components/UploadZone";
import ImageEditor from "@/app/components/ImageEditor";
import VideoEditor from "@/app/components/VideoEditor";
import PresetSelector from "@/app/components/PresetSelector";
import FormatSelector from "@/app/components/FormatSelector";
import DevicePreview from "@/app/components/DevicePreview";
import MaterialCrawler from "@/app/components/MaterialCrawler";
import GeneratePanel from "@/app/components/GeneratePanel";
import UserBadge from "@/app/components/UserBadge";
import { useImageProcess } from "@/app/hooks/useImageProcess";
import { useFFmpeg } from "@/app/hooks/useFFmpeg";
import type {
  WallpaperPreset,
  ImageFormat,
  VideoFormat,
} from "@/app/lib/presets";

type ActiveTab = "editor" | "crawl" | "generate";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const [preset, setPreset] = useState<WallpaperPreset | null>(null);
  const [imageFormat, setImageFormat] = useState<string>("jpeg");
  const [videoFormat, setVideoFormat] = useState<string>("mp4");
  const [quality, setQuality] = useState(85);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [videoCrop, setVideoCrop] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const {
    processImage,
    processing: imageProcessing,
    progress: imageProgress,
  } = useImageProcess();
  const {
    processVideo,
    loading: ffmpegLoading,
    processing: videoProcessing,
    progress: videoProgress,
    load: loadFFmpeg,
  } = useFFmpeg();

  const [activeTab, setActiveTab] = useState<ActiveTab>("editor");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (selectedFile: File, type: "image" | "video") => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setFileUrl(url);
      setMediaType(type);
      setPreviewUrl(url);
      setCroppedAreaPixels(null);
      setVideoCrop(null);

      if (type === "video") loadFFmpeg();
    },
    [fileUrl, previewUrl, loadFFmpeg]
  );

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixelsValue: Area) => {
      setCroppedAreaPixels(croppedAreaPixelsValue);
    },
    []
  );

  const handleVideoCropChange = useCallback(
    (crop: { x: number; y: number; width: number; height: number }) => {
      setVideoCrop(crop);
    },
    []
  );

  const handleClearFile = useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    if (previewUrl && previewUrl !== fileUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setFileUrl(null);
    setPreviewUrl(null);
    setCroppedAreaPixels(null);
    setVideoCrop(null);
  }, [fileUrl, previewUrl]);

  const handleExport = useCallback(async () => {
    if (!file || !preset) return;

    try {
      let blob: Blob;

      if (mediaType === "image") {
        blob = await processImage({
          file,
          preset,
          format: imageFormat as ImageFormat,
          quality,
          cropArea: croppedAreaPixels
            ? {
                x: croppedAreaPixels.x,
                y: croppedAreaPixels.y,
                width: croppedAreaPixels.width,
                height: croppedAreaPixels.height,
              }
            : undefined,
        });
      } else {
        blob = await processVideo({
          file,
          preset,
          format: videoFormat as VideoFormat,
          quality,
          cropX: videoCrop?.x,
          cropY: videoCrop?.y,
          cropW: videoCrop?.width,
          cropH: videoCrop?.height,
        });
      }

      const url = URL.createObjectURL(blob);
      const ext =
        mediaType === "image"
          ? imageFormat === "jpeg"
            ? "jpg"
            : imageFormat
          : videoFormat;
      const link = document.createElement("a");
      link.href = url;
      link.download = `wallpaper-${preset.id}-${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (previewUrl && previewUrl !== fileUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert(err instanceof Error ? err.message : "导出失败");
    }
  }, [
    file,
    preset,
    mediaType,
    imageFormat,
    videoFormat,
    quality,
    croppedAreaPixels,
    videoCrop,
    processImage,
    processVideo,
    fileUrl,
    previewUrl,
  ]);

  const handleSelectMaterial = useCallback(
    async (url: string, type: "image" | "video") => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const ext = type === "image" ? "jpg" : "mp4";
        const materialFile = new File([blob], `material.${ext}`, {
          type: blob.type,
        });
        handleFileSelect(materialFile, type);
        setActiveTab("editor");
      } catch {
        alert("素材下载失败，请尝试其他素材");
      }
    },
    [handleFileSelect]
  );

  const isProcessing = imageProcessing || videoProcessing;
  const progress = mediaType === "image" ? imageProgress : videoProgress;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-gray-800 tracking-tight leading-tight">
                WallCraft
              </h1>
              <p className="text-[11px] text-gray-400 leading-tight">
                壁纸格式转换工具
              </p>
            </div>
          </div>

          {/* Tab switch */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  activeTab === "editor"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
            >
              <Wrench size={14} />
              工作台
            </button>
            <button
              onClick={() => setActiveTab("crawl")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  activeTab === "crawl"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
            >
              <Globe size={14} />
              素材库
            </button>
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  activeTab === "generate"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
            >
              <Sparkles size={14} />
              动态壁纸
            </button>
          </div>

          {/* User badge */}
          <UserBadge />
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-8 py-6">
        {activeTab === "generate" ? (
          <GeneratePanel />
        ) : activeTab === "crawl" ? (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <MaterialCrawler onSelectMaterial={handleSelectMaterial} />
          </div>
        ) : (
          <div className="flex gap-6 h-[calc(100vh-100px)]">
            {/* Left - Editor */}
            <div className="flex-1 min-w-0 flex flex-col">
              {!file ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-xl">
                    <UploadZone onFileSelect={handleFileSelect} />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  {/* File info bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${mediaType === "image" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"}`}
                      >
                        {mediaType === "image" ? (
                          <FileImage size={14} />
                        ) : (
                          <FileVideo size={14} />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-600 truncate max-w-[300px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-300 bg-gray-50 px-2 py-0.5 rounded-md">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                    <button
                      onClick={handleClearFile}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="移除文件"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Editor */}
                  <div className="flex-1 min-h-0">
                    {mediaType === "image" ? (
                      <ImageEditor
                        imageUrl={fileUrl!}
                        preset={preset}
                        onCropComplete={handleCropComplete}
                      />
                    ) : (
                      <VideoEditor
                        videoUrl={fileUrl!}
                        preset={preset}
                        onCropChange={handleVideoCropChange}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right - Controls & Preview */}
            <div className="w-[340px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
              {/* Preset selector */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <PresetSelector selectedPreset={preset} onSelect={setPreset} />
              </div>

              {/* Format selector */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <FormatSelector
                  mode={mediaType}
                  selectedFormat={
                    mediaType === "image" ? imageFormat : videoFormat
                  }
                  quality={quality}
                  onFormatChange={
                    mediaType === "image" ? setImageFormat : setVideoFormat
                  }
                  onQualityChange={setQuality}
                />
              </div>

              {/* Device preview */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex-1 min-h-[280px]">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  设备预览
                </h3>
                <DevicePreview
                  imageUrl={previewUrl}
                  preset={preset}
                  mediaType={mediaType}
                />
              </div>

              {/* Export button */}
              <button
                onClick={handleExport}
                disabled={!file || !preset || isProcessing}
                className={`
                  w-full py-3.5 rounded-xl font-semibold text-sm
                  flex items-center justify-center gap-2
                  transition-all duration-300
                  ${
                    !file || !preset || isProcessing
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0"
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    处理中 {progress > 0 ? `${progress}%` : ""}
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    导出壁纸
                  </>
                )}
              </button>

              {ffmpegLoading && (
                <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5">
                  <Loader2 size={11} className="animate-spin" />
                  正在加载视频处理引擎...
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
