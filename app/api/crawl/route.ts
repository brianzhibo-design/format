import { NextRequest, NextResponse } from "next/server";
import { crawlWallpapers } from "@/app/lib/firecrawl";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, apiKey, limit } = body;

    if (!query) {
      return NextResponse.json({ error: "请输入搜索关键词" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "请提供 Firecrawl API Key" },
        { status: 400 }
      );
    }

    const results = await crawlWallpapers(apiKey, { query, limit });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "素材爬取失败",
      },
      { status: 500 }
    );
  }
}
