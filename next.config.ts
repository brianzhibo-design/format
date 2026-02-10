import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent @ffmpeg packages from being bundled on the server side
  // They are client-only and load WASM from CDN
  serverExternalPackages: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
