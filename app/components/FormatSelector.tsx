"use client";

import { IMAGE_FORMATS, VIDEO_FORMATS } from "@/app/lib/presets";

interface FormatSelectorProps {
  mode: "image" | "video";
  selectedFormat: string;
  quality: number;
  onFormatChange: (format: string) => void;
  onQualityChange: (quality: number) => void;
}

export default function FormatSelector({
  mode,
  selectedFormat,
  quality,
  onFormatChange,
  onQualityChange,
}: FormatSelectorProps) {
  const formats = mode === "image" ? IMAGE_FORMATS : VIDEO_FORMATS;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        输出格式
      </h3>

      <div className="flex gap-2 flex-wrap">
        {formats.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => onFormatChange(fmt.id)}
            className={`
              px-4 py-1.5 rounded-lg text-xs font-semibold
              transition-all duration-200 border
              ${
                selectedFormat === fmt.id
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
              }
            `}
          >
            {fmt.label}
          </button>
        ))}
      </div>

      {/* Quality slider */}
      {selectedFormat !== "png" && (
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">画质</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {quality}%
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={quality}
            onChange={(e) => onQualityChange(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
