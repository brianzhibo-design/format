"use client";

import { useState, useCallback, useRef } from "react";
import type { WanxTemplate } from "@/app/lib/wanx-templates";
import { getDefaultModel } from "@/app/lib/wanx-templates";
import { compressImage } from "@/app/lib/image-utils";

export type GenerateStatus =
  | "idle"
  | "uploading"
  | "generating"
  | "polling"
  | "done"
  | "error";

interface GenerateState {
  status: GenerateStatus;
  videoUrl: string | null;
  error: string | null;
  taskId: string | null;
}

const POLL_INTERVAL = 15_000; // 15 seconds
const MAX_POLL_TIME = 5 * 60_000; // 5 minutes

export function useWanxGenerate() {
  const [state, setState] = useState<GenerateState>({
    status: "idle",
    videoUrl: null,
    error: null,
    taskId: null,
  });

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);

  const clearPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollTaskStatus = useCallback(
    async (taskId: string, startTime: number) => {
      if (abortRef.current) return;

      // Check timeout
      if (Date.now() - startTime > MAX_POLL_TIME) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "生成超时（超过5分钟），请稍后重试",
        }));
        return;
      }

      try {
        const res = await fetch(`/api/wanx/status/${taskId}`);
        const data = await res.json();

        if (!res.ok) {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: data.error || "查询状态失败",
          }));
          return;
        }

        const { taskStatus, videoUrl } = data;

        if (taskStatus === "SUCCEEDED" && videoUrl) {
          // Consume usage quota
          try {
            await fetch("/api/usage/consume", { method: "POST" });
          } catch {
            // Don't fail the whole flow if quota tracking fails
          }

          setState({
            status: "done",
            videoUrl,
            error: null,
            taskId,
          });
          return;
        }

        if (taskStatus === "FAILED") {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: data.errorMessage || "视频生成失败",
          }));
          return;
        }

        if (taskStatus === "CANCELED") {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: "任务已被取消",
          }));
          return;
        }

        // PENDING or RUNNING - continue polling
        if (!abortRef.current) {
          pollTimerRef.current = setTimeout(() => {
            pollTaskStatus(taskId, startTime);
          }, POLL_INTERVAL);
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "网络错误",
        }));
      }
    },
    []
  );

  const startGenerate = useCallback(
    async (
      file: File,
      template: WanxTemplate,
      resolution: string = "720P"
    ) => {
      abortRef.current = false;
      clearPolling();

      const model = getDefaultModel(template);

      // Step 1: Compress & upload image
      setState({
        status: "uploading",
        videoUrl: null,
        error: null,
        taskId: null,
      });

      try {
        // Compress image client-side before uploading (max 2048px, JPEG 85%)
        const compressedFile = await compressImage(file, 2048, 0.85);

        const uploadForm = new FormData();
        uploadForm.append("file", compressedFile);
        uploadForm.append("model", model);

        const uploadRes = await fetch("/api/wanx/upload", {
          method: "POST",
          body: uploadForm,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setState({
            status: "error",
            videoUrl: null,
            error: uploadData.error || "图片上传失败",
            taskId: null,
          });
          return;
        }

        const imgUrl = uploadData.url;

        // Step 2: Create generation task
        setState((prev) => ({ ...prev, status: "generating" }));

        const genRes = await fetch("/api/wanx/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            img_url: imgUrl,
            template: template.template,
            model,
            resolution,
          }),
        });

        const genData = await genRes.json();

        if (!genRes.ok) {
          setState({
            status: "error",
            videoUrl: null,
            error: genData.error || "创建任务失败",
            taskId: null,
          });
          return;
        }

        const taskId = genData.taskId;

        // Step 3: Start polling
        setState((prev) => ({
          ...prev,
          status: "polling",
          taskId,
        }));

        pollTaskStatus(taskId, Date.now());
      } catch (err) {
        setState({
          status: "error",
          videoUrl: null,
          error: err instanceof Error ? err.message : "操作失败",
          taskId: null,
        });
      }
    },
    [clearPolling, pollTaskStatus]
  );

  const reset = useCallback(() => {
    abortRef.current = true;
    clearPolling();
    setState({
      status: "idle",
      videoUrl: null,
      error: null,
      taskId: null,
    });
  }, [clearPolling]);

  const cancel = useCallback(() => {
    abortRef.current = true;
    clearPolling();
    setState((prev) => ({
      ...prev,
      status: "idle",
      error: null,
    }));
  }, [clearPolling]);

  return {
    ...state,
    startGenerate,
    reset,
    cancel,
  };
}
