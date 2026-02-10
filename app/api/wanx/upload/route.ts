import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

const DASHSCOPE_BASE = "https://dashscope.aliyuncs.com/api/v1";

/**
 * Upload an image to DashScope to get a temporary OSS URL.
 * Uses the DashScope upload API:
 *   1. GET upload policy (getPolicy) to get OSS credentials
 *   2. POST file to OSS with the returned credentials
 *   3. Return the oss:// URL (with correct bucket name)
 */
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const model = (formData.get("model") as string) || "wanx2.1-i2v-turbo";

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    // Step 1: Get upload policy
    const policyRes = await fetch(
      `${DASHSCOPE_BASE}/uploads?action=getPolicy&model=${encodeURIComponent(model)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!policyRes.ok) {
      const errText = await policyRes.text();
      console.error("Get upload policy failed:", errText);
      return NextResponse.json(
        { error: "获取上传凭证失败" },
        { status: 500 }
      );
    }

    const policy = await policyRes.json();
    const {
      data: {
        policy: ossPolicy,
        signature,
        upload_dir,
        upload_host,
        oss_access_key_id,
        x_oss_object_acl,
        x_oss_forbid_overwrite,
      },
    } = policy;

    // Step 2: Upload file to OSS
    // Ensure filename is safe (no spaces, special chars)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileKey = `${upload_dir}${Date.now()}_${safeName}`;

    const ossFormData = new FormData();
    ossFormData.append("OSSAccessKeyId", oss_access_key_id);
    ossFormData.append("Signature", signature);
    ossFormData.append("policy", ossPolicy);
    ossFormData.append("key", fileKey);
    ossFormData.append("x-oss-object-acl", x_oss_object_acl);
    ossFormData.append("x-oss-forbid-overwrite", x_oss_forbid_overwrite);
    ossFormData.append("success_action_status", "200");
    ossFormData.append("file", file);

    const ossRes = await fetch(upload_host, {
      method: "POST",
      body: ossFormData,
    });

    if (!ossRes.ok) {
      const errText = await ossRes.text();
      console.error("OSS upload failed:", errText);
      return NextResponse.json(
        { error: "图片上传失败" },
        { status: 500 }
      );
    }

    // Step 3: Construct the oss:// URL
    // Extract bucket name from upload_host (e.g. "https://dashscope-instant.oss-cn-beijing.aliyuncs.com")
    let bucketName = "dashscope-instant";
    try {
      const hostUrl = new URL(upload_host);
      const hostParts = hostUrl.hostname.split(".");
      if (hostParts.length > 0) {
        bucketName = hostParts[0];
      }
    } catch {
      // fallback to default bucket name
    }

    const ossUrl = `oss://${bucketName}/${fileKey}`;

    return NextResponse.json({ url: ossUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "上传失败" },
      { status: 500 }
    );
  }
}
