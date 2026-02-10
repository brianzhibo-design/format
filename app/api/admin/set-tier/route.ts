import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Verify admin secret
    const adminSecret = request.headers.get("X-Admin-Secret");
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "未授权" }, { status: 403 });
    }

    const { userId, tier } = await request.json();

    if (!userId || !tier) {
      return NextResponse.json(
        { error: "缺少 userId 或 tier 参数" },
        { status: 400 }
      );
    }

    if (!["free", "premium"].includes(tier)) {
      return NextResponse.json(
        { error: "tier 必须为 free 或 premium" },
        { status: 400 }
      );
    }

    const adminClient = createServiceClient();

    const { data, error } = await adminClient
      .from("user_tiers")
      .upsert(
        {
          user_id: userId,
          tier,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Set tier error:", error);
      return NextResponse.json({ error: "设置用户等级失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin set-tier error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
