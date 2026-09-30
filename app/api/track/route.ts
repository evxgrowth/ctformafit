import { NextResponse, after, type NextRequest } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { sendConversions, gaClientIdFromCookie } from "@/lib/conversions";
import { clientInfo, str } from "@/lib/request";
import { syncPendingLeads } from "@/lib/crm";

const TYPES = new Set(["page_view", "cta_click", "form_start", "step_data"]);
let lastSync = 0;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const type = str(body.type, 30);
  if (!type || !TYPES.has(type) || !dbConfigured()) return NextResponse.json({ ok: true });

  const info = clientInfo(req);
  const ua = info.userAgent || "";
  if (/bot|crawl|spider|slurp|facebookexternalhit|lighthouse|headless/i.test(ua)) return NextResponse.json({ ok: true });

  await db().from("events").insert({
    type,
    page: str(body.page, 200),
    label: str(body.label, 120),
    session_id: str(body.sessionId, 64),
    device: /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop",
    referrer: str(body.referrer, 300),
    utm_source: str(body.utm_source, 120),
    utm_medium: str(body.utm_medium, 120),
    utm_campaign: str(body.utm_campaign, 120),
  });

  const eventId = str(body.eventId, 80);
  const metaEvent = type === "page_view" ? "PageView" : type === "cta_click" && body.whatsapp ? "Contact" : null;

  after(async () => {
    if (metaEvent && eventId) {
      const s = await getSettings();
      await sendConversions(s, {
        eventName: metaEvent,
        eventId,
        url: str(body.url, 500) ?? undefined,
        ip: info.ip,
        userAgent: info.userAgent,
        fbp: info.fbp,
        fbc: info.fbc,
        gaClientId: gaClientIdFromCookie(info.ga),
        sessionId: str(body.sessionId, 64) ?? undefined,
        custom: body.label ? { content_name: String(body.label).slice(0, 80) } : undefined,
      });
    }
    // Aproveita o tráfego do site para esvaziar a fila do CRM (no máximo a cada 3 min por instância).
    if (Date.now() - lastSync > 3 * 60_000) {
      lastSync = Date.now();
      await syncPendingLeads(10).catch((e) => console.error("[crm sync]", e));
    }
  });

  return NextResponse.json({ ok: true });
}
