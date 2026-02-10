"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, ZoomIn, ZoomOut, Move } from "lucide-react";
import type { WallpaperPreset } from "@/app/lib/presets";

interface VideoEditorProps {
  videoUrl: string;
  preset: WallpaperPreset | null;
  onCropChange: (crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

export default function VideoEditor({
  videoUrl,
  preset,
  onCropChange,
}: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      setVideoSize({ width: video.videoWidth, height: video.videoHeight });
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (!preset || videoSize.width === 0) return;

    const targetAspect = preset.width / preset.height;
    const videoAspect = videoSize.width / videoSize.height;

    let cropW: number, cropH: number;
    if (targetAspect > videoAspect) {
      cropW = videoSize.width / zoom;
      cropH = cropW / targetAspect;
    } else {
      cropH = videoSize.height / zoom;
      cropW = cropH * targetAspect;
    }

    const maxX = videoSize.width - cropW;
    const maxY = videoSize.height - cropH;
    const cx = Math.max(
      0,
      Math.min(maxX, (videoSize.width - cropW) / 2 + offset.x)
    );
    const cy = Math.max(
      0,
      Math.min(maxY, (videoSize.height - cropH) / 2 + offset.y)
    );

    onCropChange({
      x: Math.round(cx),
      y: Math.round(cy),
      width: Math.round(cropW),
      height: Math.round(cropH),
    });
  }, [preset, videoSize, zoom, offset, onCropChange]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!playing);
  }, [playing]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = Number(e.target.value);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
      setCurrentTime(time);
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        ox: offset.x,
        oy: offset.y,
      };
    },
    [offset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = videoSize.width / rect.width;
      const scaleY = videoSize.height / rect.height;
      const dx = (e.clientX - dragStart.current.x) * scaleX;
      const dy = (e.clientY - dragStart.current.y) * scaleY;
      setOffset({
        x: dragStart.current.ox - dx,
        y: dragStart.current.oy - dy,
      });
    },
    [dragging, videoSize]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getOverlayStyle = () => {
    if (!preset || videoSize.width === 0 || !containerRef.current) return {};

    const rect = containerRef.current.getBoundingClientRect();
    const targetAspect = preset.width / preset.height;
    const videoAspect = videoSize.width / videoSize.height;

    let cropW: number, cropH: number;
    if (targetAspect > videoAspect) {
      cropW = videoSize.width / zoom;
      cropH = cropW / targetAspect;
    } else {
      cropH = videoSize.height / zoom;
      cropW = cropH * targetAspect;
    }

    const maxX = videoSize.width - cropW;
    const maxY = videoSize.height - cropH;
    const cx = Math.max(
      0,
      Math.min(maxX, (videoSize.width - cropW) / 2 + offset.x)
    );
    const cy = Math.max(
      0,
      Math.min(maxY, (videoSize.height - cropH) / 2 + offset.y)
    );

    const scaleX = rect.width / videoSize.width;
    const scaleY = rect.height / videoSize.height;

    return {
      left: `${cx * scaleX}px`,
      top: `${cy * scaleY}px`,
      width: `${cropW * scaleX}px`,
      height: `${cropH * scaleY}px`,
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Video area */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[300px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          loop
          playsInline
          muted
        />

        {/* Crop overlay */}
        {preset && (
          <>
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            <div
              className="absolute border-2 border-indigo-500 pointer-events-none"
              style={{
                ...getOverlayStyle(),
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
              }}
            >
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/15" />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Pan hint */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-white/70 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
          <Move size={10} />
          拖拽调整位置
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3 mt-4 px-2">
        <button
          onClick={togglePlay}
          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <span className="text-[11px] text-gray-400 w-10 text-right font-mono">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1"
        />

        <span className="text-[11px] text-gray-400 w-10 font-mono">
          {formatTime(duration)}
        </span>

        <div className="flex items-center gap-1 ml-2">
          <ZoomOut size={13} className="text-gray-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-16"
          />
          <ZoomIn size={13} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
