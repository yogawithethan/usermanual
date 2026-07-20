import { proxyYweMemberApi } from "@/lib/ywe-member-api";

export async function GET(request: Request) {
  return proxyYweMemberApi(request, "/api/progress/levels");
}

export async function PATCH(request: Request) {
  return proxyYweMemberApi(request, "/api/progress/levels");
}
