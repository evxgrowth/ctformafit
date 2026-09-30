import "server-only";
import { db, dbConfigured } from "./db";
import type { Override } from "./schedule";

export async function getOverrides(from: string, to: string): Promise<Override[]> {
  if (!dbConfigured()) return [];
  const { data, error } = await db()
    .from("availability_overrides")
    .select("date, hour, kind")
    .gte("date", from)
    .lte("date", to);
  if (error) {
    console.error("[overrides]", error);
    return [];
  }
  return (data ?? []) as Override[];
}
