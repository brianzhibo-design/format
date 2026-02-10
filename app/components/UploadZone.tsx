"use client";

import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, Film, X } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File, type: "image" | "video") => void;
}

const ACCEPTED_IMAGE = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];
const ACCEPTED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

function getFileType(file: File): "image" | "video" | null {
  if (ACCEPTED_IMAGE.includes(file.type)) return "image";
  if (ACCEPTED_VIDEO.includes(file.type)) return "video";
  return null;
}

export default function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const type = getFileType(file);
      if (!type) {
        setError(
          "不支持的文件格式，请上传图片 (JPEG/PNG/WebP/AVIF/GIF) 或视频 (MP4/WebM/MOV)"
        );
        return;
      }
      onFileSelect(file, type);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center
          w-full min-h-[320px] rounded-2xl border-2 border-dashed
          transition-all duration-300 cursor-pointer
          ${
            dragActive
              ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
              : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30"
          }
        `}
      >
        <input
          type="file"
          accept={[...ACCEPTED_IMAGE, ...ACCEPTED_VIDEO].join(",")}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
            dragActive
              ? "bg-indigo-100 text-indigo-600 scale-110"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <Upload size={28} strokeWidth={1.5} />
        </div>

        <p className="text-base font-semibold text-gray-700 mb-1">
          {dragActive ? "释放以上传文件" : "拖拽文件到此处"}
        </p>
        <p className="text-sm text-gray-400 mb-5">或点击选择文件上传</p>

        <div className="flex items-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <ImageIcon size={13} />
            JPEG / PNG / WebP / AVIF / GIF
          </span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1.5">
            <Film size={13} />
            MP4 / WebM / MOV
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
          <X size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
