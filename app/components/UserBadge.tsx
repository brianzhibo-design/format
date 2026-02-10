"use client";

import { useState, useEffect, useCallback } from "react";
import { LogIn, LogOut, Crown, User, Loader2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import AuthModal from "./AuthModal";

interface UsageInfo {
  tier: string;
  usedToday: number;
  limit: number;
  remaining: number;
}

export default function UserBadge() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const supabase = createClient();

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsage();
      } else {
        setUsage(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchUsage]);

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user, fetchUsage]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUsage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-300">
        <Loader2 size={14} className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-100 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-all"
        >
          <LogIn size={13} />
          登录
        </button>
        <AuthModal
          open={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={fetchUsage}
        />
      </>
    );
  }

  const isPremium = usage?.tier === "premium";

  return (
    <div className="flex items-center gap-2.5">
      {/* Usage info */}
      {usage && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px]">
          {isPremium ? (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <Crown size={11} />
              高级版
            </span>
          ) : (
            <span className="text-gray-400">
              今日剩余{" "}
              <span className="text-gray-600 font-semibold">
                {usage.remaining}
              </span>{" "}
              次
            </span>
          )}
        </div>
      )}

      {/* User avatar & menu */}
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm shadow-indigo-200">
          <User size={13} className="text-white" />
        </div>
        <span className="text-xs text-gray-400 max-w-[100px] truncate hidden sm:block">
          {user.email}
        </span>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
          title="退出登录"
        >
          <LogOut size={12} />
        </button>
      </div>
    </div>
  );
}
