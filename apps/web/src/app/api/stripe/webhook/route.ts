import { getYweWorkerOrigin } from "@/lib/ywe-member-api";

export async function POST(request: Request) {
  const payload = await request.text();
  const response = await fetch(`${getYweWorkerOrigin()}/api/stripe/user-manual/webhook`, {
    body: payload,
    cache: "no-store",
    headers: {
      "content-type": request.headers.get("content-type") ?? "application/json",
      "stripe-signature": request.headers.get("stripe-signature") ?? "",
    },
    method: "POST",
  });
  return new Response(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
