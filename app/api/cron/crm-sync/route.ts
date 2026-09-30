import { NextResponse, type NextRequest } from "next/server";
import { syncPendingLeads } from "@/lib/crm";
import { dbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: "db" }, { status: 503 });
  const result = await syncPendingLeads(40);
  return NextResponse.json({ ok: true, ...result });
}
