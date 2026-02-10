"use client";

import { useState, useCallback, useMemo } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { WallpaperPreset } from "@/app/lib/presets";

interface ImageEditorProps {
  imageUrl: string;
  preset: WallpaperPreset | null;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
}

export default function ImageEditor({
  imageUrl,
  preset,
  onCropComplete,
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const aspect = useMemo(() => {
    if (!preset) return 16 / 9;
    return preset.width / preset.height;
  }, [preset]);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete(_croppedArea, croppedAreaPixels);
    },
    [onCropComplete]
  );

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Crop area */}
      <div className="relative flex-1 min-h-[300px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          cropShape={preset?.category === "cooler" ? "round" : "rect"}
          showGrid={true}
          style={{
            containerStyle: { borderRadius: "1rem" },
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-5 mt-4 px-2">
        {/* Zoom */}
        <div className="flex items-center gap-2 flex-1">
          <ZoomOut size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <ZoomIn size={15} className="text-gray-400 flex-shrink-0" />
          <span className="text-[10px] text-gray-400 w-8 text-right font-mono">
            {zoom.toFixed(1)}x
          </span>
        </div>

        {/* Rotation */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-[10px] text-gray-400 w-7 font-mono">
            {rotation}°
          </span>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          title="重置"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
}
