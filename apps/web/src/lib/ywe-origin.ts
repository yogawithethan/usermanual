const DEFAULT_WORKER_ORIGIN = "https://auth.yogawithethan.com";

export function getYweWorkerOrigin() {
  const configured = typeof window === "undefined"
    ? process.env.YWE_WORKER_ORIGIN
    : process.env.NEXT_PUBLIC_YWE_WORKER_ORIGIN;
  return (configured ?? DEFAULT_WORKER_ORIGIN).replace(/\/+$/, "");
}
