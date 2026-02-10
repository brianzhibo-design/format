import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const format = (formData.get("format") as string) || "jpeg";
    const quality = Number(formData.get("quality") || 80);
    const width = Number(formData.get("width") || 0);
    const height = Number(formData.get("height") || 0);

    // Crop area from react-easy-crop
    const cropX = Number(formData.get("cropX") || 0);
    const cropY = Number(formData.get("cropY") || 0);
    const cropWidth = Number(formData.get("cropWidth") || 0);
    const cropHeight = Number(formData.get("cropHeight") || 0);

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(buffer);

    // Extract (crop) if crop area is provided
    if (cropWidth > 0 && cropHeight > 0) {
      pipeline = pipeline.extract({
        left: Math.round(cropX),
        top: Math.round(cropY),
        width: Math.round(cropWidth),
        height: Math.round(cropHeight),
      });
    }

    // Resize to target wallpaper dimensions
    if (width > 0 && height > 0) {
      pipeline = pipeline.resize(width, height, {
        fit: "cover",
        position: "center",
      });
    }

    // Output format conversion
    let outputMime = "image/jpeg";
    switch (format) {
      case "jpeg":
        pipeline = pipeline.jpeg({ quality });
        outputMime = "image/jpeg";
        break;
      case "png":
        pipeline = pipeline.png({ compressionLevel: 6 });
        outputMime = "image/png";
        break;
      case "webp":
        pipeline = pipeline.webp({ quality });
        outputMime = "image/webp";
        break;
      case "avif":
        pipeline = pipeline.avif({ quality });
        outputMime = "image/avif";
        break;
      default:
        pipeline = pipeline.jpeg({ quality });
    }

    const outputBuffer = await pipeline.toBuffer();

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": outputMime,
        "Content-Disposition": `attachment; filename="wallpaper.${format === "jpeg" ? "jpg" : format}"`,
      },
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return NextResponse.json(
      { error: "图片处理失败" },
      { status: 500 }
    );
  }
}
