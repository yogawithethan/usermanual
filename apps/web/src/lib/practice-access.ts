import { USER_MANUAL_PRODUCT_SLUG } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

export async function getCompletedLevelCount(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tutorial_progress")
    .select("level_number,status")
    .eq("user_id", userId)
    .eq("product_slug", USER_MANUAL_PRODUCT_SLUG);

  return contiguousCompletedLevelCount(data ?? []);
}

export function contiguousCompletedLevelCount(
  progress: Array<{ level_number: number; status: string }>,
) {
  const completed = new Set(
    progress
      .filter((item) => item.status === "completed")
      .map((item) => item.level_number),
  );
  let level = 1;
  while (completed.has(level)) level += 1;
  return level - 1;
}

export function canAccessPracticeUnlock(
  completedLevelCount: number,
  unlockLevel: number | null | undefined,
) {
  return completedLevelCount >= (unlockLevel ?? 1);
}
