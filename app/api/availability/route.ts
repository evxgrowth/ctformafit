import { NextResponse, type NextRequest } from "next/server";
import { CAMPAIGNS, parseCampaign } from "@/lib/campaigns";
import { getSettings } from "@/lib/settings";
import { getOverrides } from "@/lib/overrides";
import { addDays, availableDays, nowInNatal } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const s = await getSettings();
  const today = nowInNatal().date;
  const overrides = await getOverrides(today, addDays(today, 45));
  const camp = parseCampaign(req.nextUrl.searchParams.get("campaign"));
  const rules = camp ? { ...s.schedule, min_lead_minutes: Math.max(s.schedule.min_lead_minutes, CAMPAIGNS[camp].minLeadMinutes) } : s.schedule;
  let days = availableDays(rules, overrides);
  // Campanha com prazo (Black): só mostra dias até o fim do voucher.
  if (camp) days = days.filter((d) => d.date <= CAMPAIGNS[camp].lastDay);
  return NextResponse.json({ days }, { headers: { "Cache-Control": "no-store" } });
}
