import "server-only";
import type { NextRequest } from "next/server";

export function clientInfo(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || undefined;
  return {
    ip,
    userAgent: req.headers.get("user-agent") || undefined,
    fbp: req.cookies.get("_fbp")?.value,
    fbc: req.cookies.get("_fbc")?.value,
    ga: req.cookies.get("_ga")?.value,
  };
}

export function str(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t || null;
}
