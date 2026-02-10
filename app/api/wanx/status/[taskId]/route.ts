import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

const DASHSCOPE_BASE = "https://dashscope.aliyuncs.com/api/v1";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
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

    const { taskId } = await params;

    const res = await fetch(`${DASHSCOPE_BASE}/tasks/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("DashScope status error:", data);
      return NextResponse.json(
        {
          error: data.message || "查询任务状态失败",
          code: data.code,
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      taskId: data.output?.task_id,
      taskStatus: data.output?.task_status,
      videoUrl: data.output?.video_url || null,
      submitTime: data.output?.submit_time || null,
      endTime: data.output?.end_time || null,
      errorCode: data.output?.code || null,
      errorMessage: data.output?.message || null,
      usage: data.usage || null,
    });
  } catch (error) {
    console.error("Status query error:", error);
    return NextResponse.json(
      { error: "查询失败" },
      { status: 500 }
    );
  }
}
