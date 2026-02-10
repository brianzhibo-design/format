import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

const FREE_DAILY_LIMIT = 1;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // Get user tier
    const { data: tierData } = await supabase
      .from("user_tiers")
      .select("tier")
      .eq("user_id", user.id)
      .single();

    const tier = tierData?.tier || "free";

    // Get today's usage
    const today = new Date().toISOString().split("T")[0];
    const { data: usageData } = await supabase
      .from("usage_records")
      .select("count")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    const usedToday = usageData?.count || 0;
    const limit = tier === "premium" ? -1 : FREE_DAILY_LIMIT;
    const remaining = tier === "premium" ? -1 : Math.max(0, FREE_DAILY_LIMIT - usedToday);

    return NextResponse.json({
      tier,
      usedToday,
      limit,
      remaining,
    });
  } catch (error) {
    console.error("Usage query error:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
