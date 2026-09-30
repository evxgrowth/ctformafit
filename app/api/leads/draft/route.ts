import { NextResponse, after, type NextRequest } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { sendConversions, gaClientIdFromCookie } from "@/lib/conversions";
import { clientInfo, str } from "@/lib/request";
import { isValidBrPhone, nationalDigits } from "@/lib/phone";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Captura "ao digitar": o formulário chama esta rota a cada alteração (com debounce),
 * mesmo que a pessoa nunca clique em confirmar.
 */
export async function POST(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: "db" }, { status: 503 });
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const id = str(b.id, 36);
  if (!id || !UUID.test(id)) return NextResponse.json({ ok: false }, { status: 400 });

  const name = str(b.name, 120);
  const phone = nationalDigits(String(b.phone ?? "")).slice(0, 13) || null;
  const email = str(b.email, 200);
  const visitDate = typeof b.visit_date === "string" && DATE.test(b.visit_date) ? b.visit_date : null;
  const visitHour = Number.isInteger(b.visit_hour) && (b.visit_hour as number) >= 0 && (b.visit_hour as number) <= 23 ? (b.visit_hour as number) : null;
  const a = (b.attribution ?? {}) as Record<string, unknown>;
  const info = clientInfo(req);

  const { data: existing } = await db()
    .from("leads")
    .select("id, completed, lead_event_sent, crm_stage, crm_status, name, phone")
    .eq("id", id)
    .maybeSingle();

  if (existing?.completed) return NextResponse.json({ ok: true, completed: true });

  const fields: Record<string, unknown> = {
    name,
    phone,
    email,
    updated_at: new Date().toISOString(),
    fbp: info.fbp ?? null,
    fbc: info.fbc ?? null,
    ga_client_id: gaClientIdFromCookie(info.ga) ?? null,
  };
  if ("visit_date" in b) {
    fields.visit_date = visitDate;
    fields.visit_hour = visitDate ? visitHour : null;
  }

  // Dados mudaram depois de já ter ido ao CRM como "incompleto": manda de novo.
  if (existing && existing.crm_stage === "incompleto" && (existing.phone !== phone || existing.name !== name)) {
    fields.crm_status = "pendente";
    fields.crm_attempts = 0;
    fields.crm_next_try_at = null;
  }

  if (!existing) {
    const { error } = await db()
      .from("leads")
      .insert({
        id,
        ...fields,
        source_page: str(b.page, 200) ?? "/captura",
        session_id: str(b.sessionId, 64),
        utm_source: str(a.utm_source, 120),
        utm_medium: str(a.utm_medium, 120),
        utm_campaign: str(a.utm_campaign, 120),
        utm_content: str(a.utm_content, 120),
        utm_term: str(a.utm_term, 120),
        fbclid: str(a.fbclid, 300),
        gclid: str(a.gclid, 300),
        referrer: str(a.referrer, 300),
        user_agent: info.userAgent?.slice(0, 300) ?? null,
        ip: info.ip ?? null,
      });
    if (error) {
      console.error("[draft insert]", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  } else {
    const { error } = await db().from("leads").update(fields).eq("id", id);
    if (error) {
      console.error("[draft update]", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }

  // Primeira vez com nome + WhatsApp válidos = evento "Lead".
  const leadEventId = str(b.leadEventId, 80);
  const isLead = Boolean(name && phone && isValidBrPhone(phone));
  if (isLead && leadEventId && !existing?.lead_event_sent) {
    await db().from("leads").update({ lead_event_sent: true }).eq("id", id);
    await db().from("events").insert({
      type: "lead",
      page: str(b.page, 200),
      session_id: str(b.sessionId, 64),
      utm_source: str(a.utm_source, 120),
      utm_medium: str(a.utm_medium, 120),
      utm_campaign: str(a.utm_campaign, 120),
    });
    after(async () => {
      const s = await getSettings();
      await sendConversions(s, {
        eventName: "Lead",
        eventId: leadEventId,
        url: str(b.url, 500) ?? undefined,
        ip: info.ip,
        userAgent: info.userAgent,
        fbp: info.fbp,
        fbc: info.fbc,
        gaClientId: gaClientIdFromCookie(info.ga),
        name: name ?? undefined,
        phone: phone ?? undefined,
        email: email ?? undefined,
        externalId: id,
        custom: { content_name: "Agendamento de visita" },
      });
    });
  }

  return NextResponse.json({ ok: true });
}
