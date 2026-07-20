import { getYweMemberSession } from "@/lib/ywe-member-api";

export async function getCompletedLevelCount(_userId?: string) {
  const session = await getYweMemberSession();
  return session.access?.completedLevels.length ?? 0;
}

export function canAccessPracticeUnlock(
  completedLevelCount: number,
  unlockLevel: number | null | undefined,
) {
  return completedLevelCount >= (unlockLevel ?? 1);
}
