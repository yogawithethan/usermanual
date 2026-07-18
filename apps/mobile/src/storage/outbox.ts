import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createLessonComment,
  createNote,
  patchLevelProgress,
  patchPracticeProgress,
} from "@/api/userManual";

const outboxKey = "um.outbox.v1";

export type OutboxItem =
  | {
      body: { levelNumber: number; status: "not_started" | "in_progress" | "completed" };
      createdAt: string;
      id: string;
      type: "level-progress";
    }
  | {
      body: { practiceId: string; status: "not_started" | "in_progress" | "completed" };
      createdAt: string;
      id: string;
      type: "practice-progress";
    }
  | {
      body: { body: string; practiceId?: string | null; tutorialLevel?: number | null };
      createdAt: string;
      id: string;
      type: "note";
    }
  | {
      body: { body: string; levelNumber: number };
      createdAt: string;
      id: string;
      type: "lesson-comment";
    };

function outboxId(type: OutboxItem["type"]) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function readOutbox() {
  const raw = await AsyncStorage.getItem(outboxKey);
  if (!raw) return [];

  return JSON.parse(raw) as OutboxItem[];
}

async function writeOutbox(items: OutboxItem[]) {
  await AsyncStorage.setItem(outboxKey, JSON.stringify(items));
}

export async function clearOutbox() {
  await AsyncStorage.removeItem(outboxKey);
}

export async function enqueueOutboxItem(item: Omit<OutboxItem, "createdAt" | "id">) {
  const current = await readOutbox();
  await writeOutbox([
    ...current,
    {
      ...item,
      createdAt: new Date().toISOString(),
      id: outboxId(item.type),
    } as OutboxItem,
  ]);
}

async function sendOutboxItem(accessToken: string, item: OutboxItem) {
  if (item.type === "level-progress") {
    await patchLevelProgress(accessToken, item.body);
    return;
  }

  if (item.type === "practice-progress") {
    await patchPracticeProgress(accessToken, item.body);
    return;
  }

  if (item.type === "note") {
    await createNote(accessToken, item.body);
    return;
  }

  await createLessonComment(accessToken, item.body.levelNumber, {
    body: item.body.body,
  });
}

export async function flushOutbox(accessToken: string) {
  const current = await readOutbox();
  const remaining: OutboxItem[] = [];
  let flushed = 0;

  for (const item of current) {
    try {
      await sendOutboxItem(accessToken, item);
      flushed += 1;
    } catch {
      remaining.push(item);
    }
  }

  if (remaining.length !== current.length) {
    await writeOutbox(remaining);
  }

  return {
    flushed,
    remaining: remaining.length,
  };
}

export function outboxLabel(item: OutboxItem) {
  if (item.type === "level-progress") return `Level ${item.body.levelNumber} progress`;
  if (item.type === "practice-progress") return "Practice progress";
  if (item.type === "note") return "Private note";
  return `Level ${item.body.levelNumber} question`;
}
