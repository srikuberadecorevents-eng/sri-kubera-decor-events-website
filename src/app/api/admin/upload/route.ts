import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient, logActivity } from "@/lib/admin";
import sharp from "sharp";

function isValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }

  // WebP: RIFF (bytes 0-3) ... WEBP (bytes 8-11)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  // HEIC / AVIF: ftyp at bytes 4-7
  if (
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    // 2. Read multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Reject files over 6 MB (Netlify body limit safeguard)
    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 6 MB." },
        { status: 400 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // 3. Verify magic bytes (real MIME detection)
    if (!isValidImageMagicBytes(rawBuffer)) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed formats: JPEG, PNG, WebP, HEIC." },
        { status: 400 }
      );
    }

    // 4. Sharp: auto-rotate by EXIF, strip all metadata (including GPS), generate two WebP variants
    const imagePipeline = sharp(rawBuffer).rotate(); // auto-rotates by EXIF orientation tag and strips EXIF

    // Card variant: max 800px wide, quality 78
    const cardBuffer = await imagePipeline
      .clone()
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();

    // Full variant: max 1600px wide, quality 80
    const fullPipeline = imagePipeline
      .clone()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 });

    const [fullBuffer, metadata] = await Promise.all([
      fullPipeline.toBuffer(),
      fullPipeline.metadata(),
    ]);

    const totalBytes = cardBuffer.length + fullBuffer.length;
    const baseId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const pathCard = `designs/card_${baseId}.webp`;
    const pathFull = `designs/full_${baseId}.webp`;

    // 5. Upload both to Supabase Storage bucket 'design-images'
    // Use service role if available for reliable serverless admin upload, otherwise use user client
    const storageClient = getServiceRoleClient() || supabase;

    const [uploadCard, uploadFull] = await Promise.all([
      storageClient.storage.from("design-images").upload(pathCard, cardBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      }),
      storageClient.storage.from("design-images").upload(pathFull, fullBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      }),
    ]);

    if (uploadCard.error || uploadFull.error) {
      console.error(
        "Storage upload error:",
        uploadCard.error || uploadFull.error
      );
      return NextResponse.json(
        { error: "Failed to upload image variants to storage." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl: urlCard },
    } = storageClient.storage.from("design-images").getPublicUrl(pathCard);

    const {
      data: { publicUrl: urlFull },
    } = storageClient.storage.from("design-images").getPublicUrl(pathFull);

    // 6. Insert row into media table
    const { data: mediaRow, error: mediaError } = await supabase
      .from("media")
      .insert({
        path_card: pathCard,
        path_full: pathFull,
        url_card: urlCard,
        url_full: urlFull,
        width: metadata.width || null,
        height: metadata.height || null,
        bytes_total: totalBytes,
        original_name: file.name || "upload.webp",
      })
      .select()
      .single();

    if (mediaError) {
      console.error("Media table insert error:", mediaError);
      // Fallback: return URLs even if media row insert failed
      return NextResponse.json({
        id: baseId,
        url_card: urlCard,
        url_full: urlFull,
        url: urlFull, // backwards compatibility
        path_card: pathCard,
        path_full: pathFull,
        bytes_total: totalBytes,
      });
    }

    // Log admin activity
    await logActivity({
      actorId: user.id,
      action: "upload",
      entity: "media",
      entityId: mediaRow.id,
      summary: `Uploaded photo ${file.name} (${Math.round(totalBytes / 1024)} KB)`,
    });

    return NextResponse.json({
      id: mediaRow.id,
      url_card: mediaRow.url_card,
      url_full: mediaRow.url_full,
      url: mediaRow.url_full, // for backwards compatibility with any existing components
      path_card: mediaRow.path_card,
      path_full: mediaRow.path_full,
      bytes_total: mediaRow.bytes_total,
      width: mediaRow.width,
      height: mediaRow.height,
    });
  } catch (error) {
    console.error("Admin upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error during image processing." },
      { status: 500 }
    );
  }
}
