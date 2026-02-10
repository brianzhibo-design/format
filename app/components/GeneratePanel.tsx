"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  Download,
  Trash2,
  X,
  RotateCcw,
  Sparkles,
  Crown,
  Info,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { WanxTemplate } from "@/app/lib/wanx-templates";
import { useWanxGenerate } from "@/app/hooks/useWanxGenerate";
import EffectSelector from "./EffectSelector";
import AuthModal from "./AuthModal";

const ACCEPTED_IMAGE = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
];

const STATUS_LABELS: Record<string, string> = {
  idle: "",
  uploading: "正在上传图片...",
  generating: "正在创建生成任务...",
  polling: "视频生成中，请耐心等待...",
  done: "生成完成！",
  error: "生成失败",
};

export default function GeneratePanel() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WanxTemplate | null>(null);
  const [resolution, setResolution] = useState("720P");
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{
    tier: string;
    remaining: number;
  } | null>(null);

  // Generate hook
  const { status, videoUrl, error, startGenerate, reset } = useWanxGenerate();

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setUsageInfo(null);
      return;
    }
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsageInfo({ tier: data.tier, remaining: data.remaining });
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  useEffect(() => {
    if (status === "done") {
      fetchUsage();
    }
  }, [status, fetchUsage]);

  const handleFile = useCallback((f: File) => {
    setUploadError(null);
    if (!ACCEPTED_IMAGE.includes(f.type)) {
      setUploadError("不支持的格式，请上传 JPEG / PNG / WebP / BMP 图片");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setUploadError("图片大小不能超过 10MB");
      return;
    }
    setFile(f);
    setFileUrl(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleClearFile = useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(null);
    setFileUrl(null);
    setUploadError(null);
    reset();
  }, [fileUrl, reset]);

  const handleGenerate = useCallback(async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!file || !selectedTemplate) return;
    startGenerate(file, selectedTemplate, resolution);
  }, [user, file, selectedTemplate, resolution, startGenerate]);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `wallcraft-${selectedTemplate?.template || "video"}-${Date.now()}.mp4`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [videoUrl, selectedTemplate]);

  const isProcessing =
    status === "uploading" || status === "generating" || status === "polling";
  const canGenerate =
    file && selectedTemplate && !isProcessing && status !== "done";
  const isPremium = usageInfo?.tier === "premium";
  const hasQuota = isPremium || (usageInfo?.remaining ?? 1) > 0;

  let buttonLabel = "生成动态壁纸";
  let buttonDisabled = false;

  if (!user) {
    buttonLabel = "登录后使用";
    buttonDisabled = false;
  } else if (!hasQuota) {
    buttonLabel = "今日次数已用完";
    buttonDisabled = true;
  } else if (!file) {
    buttonLabel = "请先上传图片";
    buttonDisabled = true;
  } else if (!selectedTemplate) {
    buttonLabel = "请选择特效模板";
    buttonDisabled = true;
  } else if (isProcessing) {
    buttonLabel = STATUS_LABELS[status];
    buttonDisabled = true;
  } else if (status === "done") {
    buttonLabel = "重新生成";
    buttonDisabled = false;
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-100px)]">
      {/* Left Panel - Upload & Preview */}
      <div className="flex-1 min-w-0 flex flex-col">
        {!file ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-xl">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                className={`
                  relative flex flex-col items-center justify-center
                  w-full min-h-[300px] rounded-2xl border-2 border-dashed
                  transition-all duration-300 cursor-pointer bg-white
                  ${
                    dragActive
                      ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }
                `}
              >
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE.join(",")}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    dragActive
                      ? "bg-indigo-100 text-indigo-500"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Upload size={24} />
                </div>
                <p className="text-base font-semibold text-gray-600 mb-1">
                  {dragActive ? "释放以上传图片" : "上传一张图片"}
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  拖拽文件到此处，或点击选择
                </p>
                <span className="flex items-center gap-1.5 text-xs text-gray-300">
                  <ImageIcon size={12} />
                  JPEG / PNG / WebP / BMP（最大 10MB）
                </span>
              </div>

              {uploadError && (
                <div className="mt-3 flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                  <X size={14} />
                  {uploadError}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            {/* File info bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                  <ImageIcon size={14} />
                </div>
                <span className="text-sm font-medium text-gray-600 truncate max-w-[300px]">
                  {file.name}
                </span>
                <span className="text-xs text-gray-300 bg-gray-50 px-2 py-0.5 rounded-md">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <button
                onClick={handleClearFile}
                disabled={isProcessing}
                className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                title="移除文件"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 min-h-0 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
              {status === "done" && videoUrl ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="max-w-full max-h-full rounded-xl shadow-lg"
                  />
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fileUrl!}
                    alt="Preview"
                    className={`max-w-full max-h-full object-contain p-4 ${isProcessing ? "opacity-30" : ""}`}
                  />

                  {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin" />
                        <Sparkles
                          size={20}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {STATUS_LABELS[status]}
                        </p>
                        {status === "polling" && (
                          <p className="text-[11px] text-gray-400 mt-1">
                            视频生成通常需要 1-5 分钟
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {status === "error" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80">
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                        <X size={20} className="text-red-500" />
                      </div>
                      <p className="text-sm text-red-500 font-medium">
                        {error}
                      </p>
                      <button
                        onClick={reset}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 transition-all"
                      >
                        <RotateCcw size={12} />
                        重试
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Controls */}
      <div className="w-[340px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
        {/* Effect selector */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <EffectSelector
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        </div>

        {/* Resolution selector */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            视频分辨率
          </h3>
          <div className="flex gap-2">
            {["720P", "1080P"].map((res) => (
              <button
                key={res}
                onClick={() => setResolution(res)}
                className={`
                  flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border
                  ${
                    resolution === res
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"
                  }
                `}
              >
                {res}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2.5 flex items-start gap-1">
            <Info size={11} className="mt-0.5 flex-shrink-0" />
            1080P 生成时间更长，费用更高
          </p>
        </div>

        {/* Usage info card */}
        {user && usageInfo && (
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
              使用配额
            </h3>
            {isPremium ? (
              <div className="flex items-center gap-2 text-amber-600 text-xs font-medium">
                <Crown size={14} />
                <span>高级版 - 不限次数</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">今日剩余</span>
                  <span
                    className={`font-semibold ${
                      usageInfo.remaining > 0
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {usageInfo.remaining} 次
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${usageInfo.remaining > 0 ? "bg-green-500" : "bg-red-500"}`}
                    style={{
                      width: `${(usageInfo.remaining / 1) * 100}%`,
                    }}
                  />
                </div>
                {usageInfo.remaining <= 0 && (
                  <p className="text-[11px] text-gray-400">
                    免费次数已用完，明天将自动重置
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Generate / Download button */}
        {status === "done" && videoUrl ? (
          <div className="space-y-2">
            <button
              onClick={handleDownload}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-200 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Download size={16} />
              下载视频
            </button>
            <button
              onClick={reset}
              className="w-full py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
            >
              <RotateCcw size={14} />
              重新生成
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={
              buttonDisabled || (!!user && !canGenerate && status !== "error")
            }
            className={`
              w-full py-3.5 rounded-xl font-semibold text-sm
              flex items-center justify-center gap-2
              transition-all duration-300
              ${
                buttonDisabled || (!!user && !canGenerate && status !== "error")
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0"
              }
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {STATUS_LABELS[status]}
              </>
            ) : status === "error" ? (
              <>
                <RotateCcw size={16} />
                重试
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {buttonLabel}
              </>
            )}
          </button>
        )}

        {/* Selected template tip */}
        {selectedTemplate && (
          <div className="text-[11px] text-gray-400 bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-100">
            <span className="text-gray-600 font-medium">
              {selectedTemplate.name}
            </span>
            ：{selectedTemplate.inputTip}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          fetchUsage();
          setShowAuth(false);
        }}
      />
    </div>
  );
}
