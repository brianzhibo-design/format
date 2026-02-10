"use client";

import { useState } from "react";
import { Smartphone, Monitor, Circle, MonitorDot } from "lucide-react";
import {
  WALLPAPER_PRESETS,
  CATEGORY_LABELS,
  type DeviceCategory,
  type WallpaperPreset,
} from "@/app/lib/presets";

interface PresetSelectorProps {
  selectedPreset: WallpaperPreset | null;
  onSelect: (preset: WallpaperPreset) => void;
}

const CATEGORY_ICONS: Record<DeviceCategory, React.ReactNode> = {
  phone: <Smartphone size={15} />,
  desktop: <Monitor size={15} />,
  cooler: <Circle size={15} />,
  ultrawide: <MonitorDot size={15} />,
};

const CATEGORIES: DeviceCategory[] = ["phone", "desktop", "cooler", "ultrawide"];

export default function PresetSelector({
  selectedPreset,
  onSelect,
}: PresetSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<DeviceCategory>("phone");

  const filteredPresets = WALLPAPER_PRESETS.filter(
    (p) => p.category === activeCategory
  );

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        壁纸尺寸
      </h3>

      {/* Category tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg
              text-xs font-medium transition-all duration-200
              ${
                activeCategory === cat
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }
            `}
          >
            {CATEGORY_ICONS[cat]}
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Preset list */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: filteredPresets.length <= 2 ? "1fr" : "1fr 1fr",
        }}
      >
        {filteredPresets.map((preset) => {
          const isSelected = selectedPreset?.id === preset.id;
          const ratio = preset.width / preset.height;
          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                transition-all duration-200 border
                ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200"
                    : "bg-white border-gray-150 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }
              `}
            >
              {/* Aspect ratio indicator */}
              <div
                className={`
                  rounded flex-shrink-0 border
                  ${isSelected ? "border-indigo-300 bg-indigo-100" : "border-gray-200 bg-gray-100"}
                `}
                style={{
                  width: ratio >= 1 ? 26 : 26 * ratio,
                  height: ratio >= 1 ? 26 / ratio : 26,
                  minWidth: 10,
                  minHeight: 10,
                }}
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">
                  {preset.label}
                </div>
                <div
                  className={`text-[10px] ${isSelected ? "text-indigo-400" : "text-gray-400"}`}
                >
                  {preset.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
