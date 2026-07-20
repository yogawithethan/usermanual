import { proxyYweMemberApi } from "@/lib/ywe-member-api";

export async function GET(request: Request) {
  return proxyYweMemberApi(request, "/api/activity/user-manual");
}
