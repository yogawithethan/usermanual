"use client";

import { useEffect } from "react";

interface ProgressActivityBeaconProps {
  id: number | string;
  kind: "level" | "tutorial";
}

export function ProgressActivityBeacon({ id, kind }: ProgressActivityBeaconProps) {
  useEffect(() => {
    const controller = new AbortController();
    const body = kind === "level"
      ? { levelNumber: Number(id), status: "in_progress" }
      : { practiceId: String(id), status: "in_progress" };

    void fetch(kind === "level" ? "/api/progress/levels" : "/api/progress/practices", {
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
      method: "PATCH",
      signal: controller.signal,
    }).catch(() => undefined);

    return () => controller.abort();
  }, [id, kind]);

  return null;
}
