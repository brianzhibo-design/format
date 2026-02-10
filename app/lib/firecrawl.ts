export interface CrawlResult {
  title: string;
  url: string;
  imageUrl: string;
  sourceUrl: string;
  type: "image" | "video";
}

export interface CrawlRequest {
  query: string;
  limit?: number;
}

export async function crawlWallpapers(
  apiKey: string,
  request: CrawlRequest
): Promise<CrawlResult[]> {
  // Use Firecrawl search endpoint to find wallpaper-related content
  const response = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: `${request.query} wallpaper high resolution`,
      limit: request.limit || 20,
      scrapeOptions: {
        formats: ["markdown"],
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Firecrawl API error: ${response.status}`);
  }

  const data = await response.json();

  // Parse results to extract image/video URLs
  const results: CrawlResult[] = [];

  if (data.data && Array.isArray(data.data)) {
    for (const item of data.data) {
      // Extract image URLs from markdown content
      const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|webp|gif))\)/gi;
      const content = item.markdown || "";
      let match;

      while ((match = imageRegex.exec(content)) !== null) {
        results.push({
          title: item.title || "Wallpaper",
          url: match[1],
          imageUrl: match[1],
          sourceUrl: item.url || "",
          type: "image",
        });
      }

      // Extract video URLs
      const videoRegex = /(https?:\/\/[^\s"']+\.(mp4|webm))/gi;
      while ((match = videoRegex.exec(content)) !== null) {
        results.push({
          title: item.title || "Video Wallpaper",
          url: match[1],
          imageUrl: match[1],
          sourceUrl: item.url || "",
          type: "video",
        });
      }

      // If item has metadata images
      if (item.metadata?.ogImage) {
        results.push({
          title: item.title || item.metadata?.title || "Wallpaper",
          url: item.metadata.ogImage,
          imageUrl: item.metadata.ogImage,
          sourceUrl: item.url || "",
          type: "image",
        });
      }
    }
  }

  return results;
}
