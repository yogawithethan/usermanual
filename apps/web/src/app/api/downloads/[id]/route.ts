import { NextResponse } from "next/server";

import { USER_MANUAL_PRODUCT_SLUG, getUserManualEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const SIGNED_DOWNLOAD_TTL_SECONDS = 5 * 60;

function wantsJson(request: Request) {
  const url = new URL(request.url);
  return (
    url.searchParams.get("format") === "json" ||
    request.headers.get("accept")?.includes("application/json")
  );
}

function downloadResponse(request: Request, url: string) {
  if (wantsJson(request)) {
    return NextResponse.json({
      expiresIn: SIGNED_DOWNLOAD_TTL_SECONDS,
      url,
    });
  }

  return NextResponse.redirect(url);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const entitlement = await getUserManualEntitlement();

  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!entitlement.entitled) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const db = supabase as any;
  const { data: download, error } = await db
    .from("product_downloads")
    .select("id,title,file_url,storage_bucket,storage_path")
    .eq("id", id)
    .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!download) {
    return NextResponse.json({ error: "Download not found" }, { status: 404 });
  }

  if (download.file_url) {
    return downloadResponse(request, new URL(download.file_url, request.url).toString());
  }

  if (!download.storage_bucket || !download.storage_path) {
    return NextResponse.json({ error: "Download file is not configured" }, { status: 404 });
  }

  const service = createServiceClient();
  const { data: signed, error: signedError } = await service.storage
    .from(download.storage_bucket)
    .createSignedUrl(download.storage_path, SIGNED_DOWNLOAD_TTL_SECONDS, {
      download: download.title || true,
    });

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json(
      { error: signedError?.message ?? "Could not create signed URL" },
      { status: 500 },
    );
  }

  return downloadResponse(request, signed.signedUrl);
}
