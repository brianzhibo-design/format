export type DeviceCategory = "phone" | "desktop" | "cooler" | "ultrawide";

export interface WallpaperPreset {
  id: string;
  category: DeviceCategory;
  label: string;
  width: number;
  height: number;
  description: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  // --- 手机 ---
  {
    id: "iphone-15-pro-max",
    category: "phone",
    label: "iPhone 15 Pro Max",
    width: 1290,
    height: 2796,
    description: "1290 x 2796",
  },
  {
    id: "iphone-15",
    category: "phone",
    label: "iPhone 15 / 14",
    width: 1179,
    height: 2556,
    description: "1179 x 2556",
  },
  {
    id: "android-fhd",
    category: "phone",
    label: "Android FHD+",
    width: 1080,
    height: 1920,
    description: "1080 x 1920",
  },
  {
    id: "android-2k",
    category: "phone",
    label: "Android 2K",
    width: 1440,
    height: 3200,
    description: "1440 x 3200",
  },

  // --- 桌面 ---
  {
    id: "desktop-1080p",
    category: "desktop",
    label: "1080p",
    width: 1920,
    height: 1080,
    description: "1920 x 1080",
  },
  {
    id: "desktop-2k",
    category: "desktop",
    label: "2K",
    width: 2560,
    height: 1440,
    description: "2560 x 1440",
  },
  {
    id: "desktop-4k",
    category: "desktop",
    label: "4K",
    width: 3840,
    height: 2160,
    description: "3840 x 2160",
  },

  // --- 水冷头 ---
  {
    id: "corsair-lcd",
    category: "cooler",
    label: "CORSAIR iCUE LCD",
    width: 480,
    height: 480,
    description: "480 x 480",
  },
  {
    id: "nzxt-kraken-lcd",
    category: "cooler",
    label: "NZXT Kraken LCD",
    width: 640,
    height: 640,
    description: "640 x 640",
  },

  // --- 带鱼屏 ---
  {
    id: "ultrawide-1080",
    category: "ultrawide",
    label: "21:9 1080p",
    width: 2560,
    height: 1080,
    description: "2560 x 1080",
  },
  {
    id: "ultrawide-1440",
    category: "ultrawide",
    label: "21:9 1440p",
    width: 3440,
    height: 1440,
    description: "3440 x 1440",
  },
  {
    id: "superwide-1440",
    category: "ultrawide",
    label: "32:9 超宽",
    width: 5120,
    height: 1440,
    description: "5120 x 1440",
  },
];

export const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  phone: "手机",
  desktop: "桌面",
  cooler: "水冷头",
  ultrawide: "带鱼屏",
};

export const IMAGE_FORMATS = [
  { id: "jpeg", label: "JPEG", mime: "image/jpeg", ext: ".jpg" },
  { id: "png", label: "PNG", mime: "image/png", ext: ".png" },
  { id: "webp", label: "WebP", mime: "image/webp", ext: ".webp" },
  { id: "avif", label: "AVIF", mime: "image/avif", ext: ".avif" },
] as const;

export const VIDEO_FORMATS = [
  { id: "mp4", label: "MP4", mime: "video/mp4", ext: ".mp4" },
  { id: "webm", label: "WebM", mime: "video/webm", ext: ".webm" },
  { id: "gif", label: "GIF", mime: "image/gif", ext: ".gif" },
] as const;

export type ImageFormat = (typeof IMAGE_FORMATS)[number]["id"];
export type VideoFormat = (typeof VIDEO_FORMATS)[number]["id"];
