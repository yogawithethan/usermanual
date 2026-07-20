import { headers } from "next/headers";

import { getYweWorkerOrigin } from "@/lib/ywe-member-api";

export async function POST() {
  const incoming = await headers();
  const response = await fetch(`${getYweWorkerOrigin()}/auth/islands/logout`, {
    cache: "no-store",
    headers: incoming.get("cookie") ? { cookie: incoming.get("cookie")! } : undefined,
    method: "POST",
  });
  const outgoing = new Response(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) outgoing.headers.set("Set-Cookie", setCookie);
  return outgoing;
}
