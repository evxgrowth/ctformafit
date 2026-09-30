import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { getOverrides } from "@/lib/overrides";
import { addDays, availableDays, nowInNatal } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSettings();
  const today = nowInNatal().date;
  const overrides = await getOverrides(today, addDays(today, 45));
  return NextResponse.json({ days: availableDays(s.schedule, overrides) }, { headers: { "Cache-Control": "no-store" } });
}
