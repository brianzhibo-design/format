"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Loader2,
  Download,
  ExternalLink,
  Key,
  Image as ImageIcon,
  Film,
} from "lucide-react";
import type { CrawlResult } from "@/app/lib/firecrawl";

interface MaterialCrawlerProps {
  onSelectMaterial: (url: string, type: "image" | "video") => void;
}

export default function MaterialCrawler({
  onSelectMaterial,
}: MaterialCrawlerProps) {
  const [query, setQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [results, setResults] = useState<CrawlResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    if (!apiKey.trim()) {
      setShowApiKey(true);
      setError("请先输入 Firecrawl API Key");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          apiKey: apiKey.trim(),
          limit: 20,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "搜索失败");
      }

      setResults(data.results || []);
      if (data.results?.length === 0) {
        setError("未找到相关素材，请尝试其他关键词");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜索失败");
    } finally {
      setLoading(false);
    }
  }, [query, apiKey]);

  const handleImport = useCallback(
    async (item: CrawlResult) => {
      onSelectMaterial(item.imageUrl, item.type);
    },
    [onSelectMaterial]
  );

  return (
    <div className="space-y-4">
      {/* API Key input */}
      <div className="space-y-2">
        <button
          onClick={() => setShowApiKey(!showApiKey)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <Key size={12} />
          {showApiKey ? "隐藏" : "设置"} API Key
        </button>

        {showApiKey && (
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入 Firecrawl API Key..."
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200
              text-sm text-gray-700 placeholder:text-gray-300
              focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100
              transition-all"
          />
        )}
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="搜索壁纸素材... (如: 4K 风景, 动漫壁纸)"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-gray-200
              text-sm text-gray-700 placeholder:text-gray-300
              focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100
              transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold
            hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
            transition-all flex items-center gap-1.5 shadow-sm"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}
          搜索
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {results.map((item, idx) => (
            <div
              key={`${item.url}-${idx}`}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 cursor-pointer border border-gray-100 hover:border-indigo-200 transition-all hover:shadow-md"
              onClick={() => handleImport(item)}
            >
              {item.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Film size={28} className="text-gray-300" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                    title="导入素材"
                  >
                    <Download size={14} />
                  </button>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white shadow"
                    title="查看来源"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Type badge */}
              <div className="absolute top-2 right-2 p-1 rounded-md bg-white/80 backdrop-blur-sm">
                {item.type === "image" ? (
                  <ImageIcon size={10} className="text-gray-500" />
                ) : (
                  <Film size={10} className="text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && !error && (
        <div className="text-center py-12 text-gray-300 text-sm">
          <Search size={32} className="mx-auto mb-3 text-gray-200" />
          输入关键词搜索壁纸素材
        </div>
      )}
    </div>
  );
}
