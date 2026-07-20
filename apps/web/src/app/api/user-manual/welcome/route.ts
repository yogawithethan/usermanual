import { proxyYweMemberApi } from "@/lib/ywe-member-api";

export async function PATCH(request: Request) {
  return proxyYweMemberApi(request, "/api/user-manual/welcome");
}
