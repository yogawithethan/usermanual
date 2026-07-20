import { getYweWorkerOrigin } from "@/lib/ywe-member-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const response = await fetch(`${getYweWorkerOrigin()}/api/member/session?health=checkout`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  return new Response(await response.text(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
    status: response.status,
  });
}
