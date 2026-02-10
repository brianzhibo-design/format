import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/app/lib/supabase/server";

const FREE_DAILY_LIMIT = 1;

export async function POST() {
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
    const today = new Date().toISOString().split("T")[0];

    // Check current usage
    const { data: usageData } = await supabase
      .from("usage_records")
      .select("count")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    const usedToday = usageData?.count || 0;

    // Check quota for free users
    if (tier !== "premium" && usedToday >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: "今日免费次数已用完",
          tier,
          usedToday,
          limit: FREE_DAILY_LIMIT,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Use service role client to write (bypasses RLS)
    const adminClient = createServiceClient();

    // Upsert usage record
    const newCount = usedToday + 1;
    const { error: upsertError } = await adminClient
      .from("usage_records")
      .upsert(
        {
          user_id: user.id,
          date: today,
          count: newCount,
        },
        { onConflict: "user_id,date" }
      );

    if (upsertError) {
      console.error("Usage upsert error:", upsertError);
      return NextResponse.json({ error: "更新使用记录失败" }, { status: 500 });
    }

    const remaining = tier === "premium" ? -1 : Math.max(0, FREE_DAILY_LIMIT - newCount);

    return NextResponse.json({
      tier,
      usedToday: newCount,
      limit: tier === "premium" ? -1 : FREE_DAILY_LIMIT,
      remaining,
    });
  } catch (error) {
    console.error("Usage consume error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
