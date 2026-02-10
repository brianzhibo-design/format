"use client";

import { useState } from "react";
import { Smartphone, Monitor, Circle, MonitorDot } from "lucide-react";
import type { DeviceCategory, WallpaperPreset } from "@/app/lib/presets";

interface DevicePreviewProps {
  imageUrl: string | null;
  preset: WallpaperPreset | null;
  mediaType: "image" | "video";
}

type PreviewDevice = DeviceCategory;

const DEVICE_OPTIONS: {
  id: PreviewDevice;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "phone", label: "手机", icon: <Smartphone size={13} /> },
  { id: "desktop", label: "桌面", icon: <Monitor size={13} /> },
  { id: "cooler", label: "水冷头", icon: <Circle size={13} /> },
  { id: "ultrawide", label: "带鱼屏", icon: <MonitorDot size={13} /> },
];

export default function DevicePreview({
  imageUrl,
  preset,
  mediaType,
}: DevicePreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>(
    preset?.category ?? "phone"
  );

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-full text-gray-300 text-sm">
        上传文件后可预览
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 h-full">
      {/* Device toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg self-center">
        {DEVICE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setDevice(opt.id)}
            className={`
              flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium
              transition-all duration-200
              ${
                device === opt.id
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }
            `}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      {/* Device frame */}
      <div className="flex-1 flex items-center justify-center w-full">
        {device === "phone" && (
          <PhoneFrame imageUrl={imageUrl} mediaType={mediaType} />
        )}
        {device === "desktop" && (
          <DesktopFrame imageUrl={imageUrl} mediaType={mediaType} />
        )}
        {device === "cooler" && (
          <CoolerFrame imageUrl={imageUrl} mediaType={mediaType} />
        )}
        {device === "ultrawide" && (
          <UltrawideFrame imageUrl={imageUrl} mediaType={mediaType} />
        )}
      </div>

      {/* Info */}
      {preset && (
        <div className="text-[10px] text-gray-400 text-center">
          {preset.label} &middot; {preset.description}
        </div>
      )}
    </div>
  );
}

function MediaContent({
  url,
  type,
}: {
  url: string;
  type: "image" | "video";
}) {
  if (type === "video") {
    return (
      <video
        src={url}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="preview" className="w-full h-full object-cover" />
  );
}

function PhoneFrame({
  imageUrl,
  mediaType,
}: {
  imageUrl: string;
  mediaType: "image" | "video";
}) {
  return (
    <div className="relative drop-shadow-xl">
      <div className="relative w-[130px] h-[270px] bg-gray-800 rounded-[26px] border-[3px] border-gray-700 overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4.5 bg-gray-800 rounded-b-xl z-10" />
        {/* Screen */}
        <div className="absolute inset-[3px] rounded-[22px] overflow-hidden bg-gray-900">
          <MediaContent url={imageUrl} type={mediaType} />
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-9 h-1 bg-white/40 rounded-full z-10" />
      </div>
    </div>
  );
}

function DesktopFrame({
  imageUrl,
  mediaType,
}: {
  imageUrl: string;
  mediaType: "image" | "video";
}) {
  return (
    <div className="flex flex-col items-center drop-shadow-xl">
      <div className="relative w-[260px] h-[162px] bg-gray-800 rounded-lg border-[3px] border-gray-700 overflow-hidden">
        <div className="absolute inset-[3px] rounded-[4px] overflow-hidden bg-gray-900">
          <MediaContent url={imageUrl} type={mediaType} />
        </div>
      </div>
      <div className="w-16 h-4 bg-gradient-to-b from-gray-600 to-gray-700" />
      <div className="w-24 h-1.5 bg-gray-600 rounded-full" />
    </div>
  );
}

function CoolerFrame({
  imageUrl,
  mediaType,
}: {
  imageUrl: string;
  mediaType: "image" | "video";
}) {
  return (
    <div className="relative drop-shadow-xl">
      <div className="w-[150px] h-[150px] rounded-full bg-gradient-to-br from-gray-600 to-gray-800 p-[5px]">
        <div className="w-full h-full rounded-full bg-gray-700 p-[3px]">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
            <MediaContent url={imageUrl} type={mediaType} />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-gray-400 font-mono tracking-widest">
        AIO LCD
      </div>
    </div>
  );
}

function UltrawideFrame({
  imageUrl,
  mediaType,
}: {
  imageUrl: string;
  mediaType: "image" | "video";
}) {
  return (
    <div className="flex flex-col items-center drop-shadow-xl">
      <div className="relative w-[300px] h-[120px] bg-gray-800 rounded-lg border-[3px] border-gray-700 overflow-hidden">
        <div className="absolute inset-[3px] rounded-[4px] overflow-hidden bg-gray-900">
          <MediaContent url={imageUrl} type={mediaType} />
        </div>
      </div>
      <div className="w-12 h-5 bg-gradient-to-b from-gray-600 to-gray-700" />
      <div className="w-20 h-1.5 bg-gray-600 rounded-full" />
    </div>
  );
}
