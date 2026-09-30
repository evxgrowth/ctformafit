import { NextResponse, after, type NextRequest } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getOverrides } from "@/lib/overrides";
import { addDays, dayLabel, hourLabel, isSlotAvailable, nowInNatal, visitIso } from "@/lib/schedule";
import { sendConversions, gaClientIdFromCookie } from "@/lib/conversions";
import { sendLeadToCrm } from "@/lib/crm";
import { clientInfo, str } from "@/lib/request";
import { isValidBrPhone, nationalDigits } from "@/lib/phone";
import { fillMessage, whatsappUrl } from "@/lib/whatsapp";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, error: "Sistema indisponível" }, { status: 503 });
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const id = str(b.id, 36);
  const name = str(b.name, 120);
  const phone = nationalDigits(String(b.phone ?? ""));
  const email = str(b.email, 200);
  const date = str(b.date, 10);
  const hour = Number(b.hour);

  if (!id || !UUID.test(id)) return NextResponse.json({ ok: false, error: "Sessão inválida, recarregue a página." }, { status: 400 });
  if (!name || name.length < 2) return NextResponse.json({ ok: false, error: "Informe seu nome." }, { status: 400 });
  if (!isValidBrPhone(phone)) return NextResponse.json({ ok: false, error: "Informe um WhatsApp válido com DDD." }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, error: "E-mail inválido." }, { status: 400 });

  const s = await getSettings();
  const today = nowInNatal().date;
  const overrides = await getOverrides(today, addDays(today, 45));
  if (!date || !Number.isInteger(hour) || !isSlotAvailable(date, hour, s.schedule, overrides)) {
    return NextResponse.json({ ok: false, error: "Esse horário não está mais disponível. Escolha outro, por favor." }, { status: 409 });
  }

  const info = clientInfo(req);
  const a = (b.attribution ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();

  const { data: existing } = await db().from("leads").select("id, completed").eq("id", id).maybeSingle();
  const fields = {
    name,
    phone,
    email,
    completed: true,
    completed_at: now,
    visit_date: date,
    visit_hour: hour,
    visit_at: visitIso(date, hour),
    updated_at: now,
    crm_status: "pendente",
    crm_attempts: 0,
    crm_next_try_at: null,
    fbp: info.fbp ?? null,
    fbc: info.fbc ?? null,
    ga_client_id: gaClientIdFromCookie(info.ga) ?? null,
  };
  const res = existing
    ? await db().from("leads").update(fields).eq("id", id)
    : await db().from("leads").insert({
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
  if (res.error) {
    console.error("[confirm]", res.error);
    return NextResponse.json({ ok: false, error: "Não conseguimos salvar agora. Tente de novo." }, { status: 500 });
  }

  if (!existing?.completed) {
    await db().from("events").insert({
      type: "schedule",
      page: str(b.page, 200),
      session_id: str(b.sessionId, 64),
      utm_source: str(a.utm_source, 120),
      utm_medium: str(a.utm_medium, 120),
      utm_campaign: str(a.utm_campaign, 120),
    });
  }

  const eventId = str(b.eventId, 80) ?? `schedule-${id}`;
  after(async () => {
    await Promise.all([
      sendLeadToCrm(id, s),
      sendConversions(s, {
        eventName: "Schedule",
        eventId,
        url: str(b.url, 500) ?? undefined,
        ip: info.ip,
        userAgent: info.userAgent,
        fbp: info.fbp,
        fbc: info.fbc,
        gaClientId: gaClientIdFromCookie(info.ga),
        name,
        phone,
        email: email ?? undefined,
        externalId: id,
        custom: { content_name: "Visita agendada", visit_date: date, visit_hour: hour },
      }),
    ]);
  });

  const text = fillMessage(s.whatsapp.messages.agendamento, {
    nome: name.split(/\s+/)[0],
    dia: dayLabel(date),
    hora: hourLabel(hour),
  });
  return NextResponse.json({ ok: true, whatsapp: whatsappUrl(s.whatsapp.number, text), label: `${dayLabel(date)} às ${hourLabel(hour)}` });
}
