import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

const DASHSCOPE_BASE = "https://dashscope.aliyuncs.com/api/v1";
const VIDEO_SYNTHESIS_URL = `${DASHSCOPE_BASE}/services/aigc/video-generation/video-synthesis`;
const FREE_DAILY_LIMIT = 1;

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "服务端未配置 DASHSCOPE_API_KEY" },
        { status: 500 }
      );
    }

    // Quota pre-check
    const { data: tierData } = await supabase
      .from("user_tiers")
      .select("tier")
      .eq("user_id", user.id)
      .single();

    const tier = tierData?.tier || "free";

    if (tier !== "premium") {
      const today = new Date().toISOString().split("T")[0];
      const { data: usageData } = await supabase
        .from("usage_records")
        .select("count")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      const usedToday = usageData?.count || 0;
      if (usedToday >= FREE_DAILY_LIMIT) {
        return NextResponse.json(
          { error: "今日免费次数已用完，请升级高级版" },
          { status: 429 }
        );
      }
    }

    // Parse request body
    const body = await request.json();
    const { img_url, template, model, resolution } = body;

    if (!img_url || !template) {
      return NextResponse.json(
        { error: "缺少 img_url 或 template 参数" },
        { status: 400 }
      );
    }

    const selectedModel = model || "wanx2.1-i2v-turbo";
    const selectedResolution = resolution || "720P";

    // Build request body for DashScope
    const dashscopeBody: Record<string, unknown> = {
      model: selectedModel,
      input: {
        img_url,
        template,
      },
      parameters: {
        resolution: selectedResolution,
      },
    };

    // Call DashScope API
    const res = await fetch(VIDEO_SYNTHESIS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify(dashscopeBody),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("DashScope generate error:", JSON.stringify(data));
      console.error("DashScope request body:", JSON.stringify(dashscopeBody));
      return NextResponse.json(
        {
          error: data.message || "视频生成任务创建失败",
          code: data.code,
          detail: data,
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      taskId: data.output?.task_id,
      taskStatus: data.output?.task_status,
      requestId: data.request_id,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "创建任务失败" },
      { status: 500 }
    );
  }
}
