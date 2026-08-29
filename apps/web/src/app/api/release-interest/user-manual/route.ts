import { proxyYweMemberApi } from "@/lib/ywe-member-api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = `/api/release-interest/user-manual?${url.searchParams.toString()}`;
  return proxyYweMemberApi(request, path);
}

export async function PATCH(request: Request) {
  return proxyYweMemberApi(request, "/api/release-interest/user-manual");
}

// Anonymous launch-interest capture from the Coming Soon gate.
export async function POST(request: Request) {
  return proxyYweMemberApi(request, "/api/release-interest/user-manual");
}
