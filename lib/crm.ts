import "server-only";
import { db } from "./db";
import { getSettings, type AllSettings } from "./settings";
import { isValidBrPhone } from "./phone";
import { dayLabel, hourLabel } from "./schedule";

export type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  completed: boolean;
  completed_at: string | null;
  visit_date: string | null;
  visit_hour: number | null;
  source_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  crm_status: string;
  crm_stage: string | null;
  crm_attempts: number;
  created_at: string;
  updated_at: string;
};

const RETRY_MINUTES = [1, 5, 15, 60, 240];

function clip(v: string | null | undefined, max: number) {
  if (!v) return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
}

function cleanTags(tags: string[]) {
  return [...new Set(tags.map((t) => t.trim().slice(0, 40)).filter(Boolean))].slice(0, 20);
}

function buildPayload(lead: LeadRow, s: AllSettings) {
  const stage = lead.completed ? "agendado" : "incompleto";
  const slot = lead.visit_date && lead.visit_hour !== null ? `${dayLabel(lead.visit_date)} às ${hourLabel(lead.visit_hour)}` : null;
  const message = lead.completed
    ? `Visita agendada pelo site para ${slot}.`
    : slot
      ? `Preencheu os dados e escolheu ${slot}, mas não confirmou o agendamento.`
      : "Preencheu nome e WhatsApp no site, mas não concluiu o agendamento.";

  const extra: Record<string, string> = {
    agendamento_status: stage,
    pagina_origem: lead.source_page || "/captura",
  };
  if (lead.visit_date) extra.visita_data = lead.visit_date;
  if (lead.visit_hour !== null) extra.visita_hora = `${String(lead.visit_hour).padStart(2, "0")}:00`;
  if (lead.utm_content) extra.utm_content = lead.utm_content;
  if (lead.utm_term) extra.utm_term = lead.utm_term;

  return {
    stage,
    body: {
      name: clip(lead.name, 120) || "Lead do site",
      phone: lead.phone!,
      email: clip(lead.email, 200),
      tags: cleanTags(lead.completed ? s.crm.tags_completed : s.crm.tags_incomplete),
      interest: clip(s.crm.interest, 120),
      unit: clip(s.crm.unit, 120),
      message: message.slice(0, 1000),
      utm_source: clip(lead.utm_source, 120),
      utm_medium: clip(lead.utm_medium, 120),
      utm_campaign: clip(lead.utm_campaign, 120),
      extra,
    },
  };
}

/** Envia um lead ao EVX CRM e grava o resultado (crm_status / crm_error). */
export async function sendLeadToCrm(leadId: string, settings?: AllSettings) {
  const s = settings ?? (await getSettings());
  const { data: lead } = await db().from("leads").select("*").eq("id", leadId).maybeSingle<LeadRow>();
  if (!lead) return { ok: false, error: "Lead não encontrado" };

  const update = (fields: Record<string, unknown>) => db().from("leads").update(fields).eq("id", leadId);

  if (!s.crm.enabled) return { ok: false, error: "Integração com o CRM desativada" };
  const token = s.secrets.crm_token.trim();
  if (!token) {
    await update({ crm_status: "erro", crm_error: "Token do CRM não configurado" });
    return { ok: false, error: "Token do CRM não configurado" };
  }
  if (!lead.name?.trim() || !lead.phone || !isValidBrPhone(lead.phone)) {
    await update({ crm_status: "ignorado", crm_error: "Sem nome ou WhatsApp válido" });
    return { ok: false, error: "Sem nome ou WhatsApp válido" };
  }

  const { stage, body } = buildPayload(lead, s);
  const attempts = (lead.crm_attempts ?? 0) + 1;
  const retryAt = new Date(Date.now() + RETRY_MINUTES[Math.min(attempts - 1, RETRY_MINUTES.length - 1)] * 60_000).toISOString();

  try {
    const res = await fetch(s.crm.endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try {
      json = JSON.parse(text);
    } catch {}

    if (res.ok) {
      // O CRM ignora o mesmo telefone por 10 min. Se a etapa mudou (incompleto -> agendado),
      // reenviamos depois para o CRM receber o agendamento.
      if (json.duplicate && lead.crm_stage && lead.crm_stage !== stage) {
        await update({
          crm_status: "pendente",
          crm_error: "CRM recebeu este telefone há menos de 10 min; reenvio automático agendado",
          crm_attempts: attempts,
          crm_next_try_at: new Date(Date.now() + 11 * 60_000).toISOString(),
        });
        return { ok: true, duplicate: true };
      }
      await update({
        crm_status: "enviado",
        crm_stage: stage,
        crm_error: null,
        crm_attempts: attempts,
        crm_next_try_at: null,
        crm_sent_at: new Date().toISOString(),
        crm_lead_id: typeof json.lead_id === "string" ? json.lead_id : null,
      });
      return { ok: true };
    }

    const detail = (typeof json.error === "string" && json.error) || text.slice(0, 300) || res.statusText;
    const error = `HTTP ${res.status}: ${detail}`;
    const retryable = res.status === 429 || res.status >= 500;
    await update({
      crm_status: "erro",
      crm_error: error,
      crm_attempts: attempts,
      crm_next_try_at: retryable && attempts < 6 ? retryAt : null,
    });
    return { ok: false, error };
  } catch (e) {
    const error = `Falha de rede: ${e instanceof Error ? e.message : String(e)}`;
    await update({ crm_status: "erro", crm_error: error, crm_attempts: attempts, crm_next_try_at: attempts < 6 ? retryAt : null });
    return { ok: false, error };
  }
}

/**
 * Processa a fila: agendamentos ainda não entregues, falhas temporárias
 * e leads que pararam no meio do formulário há mais de X minutos.
 */
export async function syncPendingLeads(limit = 25) {
  const s = await getSettings();
  if (!s.crm.enabled || !s.secrets.crm_token) return { processed: 0 };
  const now = new Date().toISOString();
  const staleBefore = new Date(Date.now() - s.crm.incomplete_delay_min * 60_000).toISOString();

  const ids = new Set<string>();

  const completed = await db()
    .from("leads")
    .select("id, crm_next_try_at")
    .eq("completed", true)
    .in("crm_status", ["pendente", "erro"])
    .lt("crm_attempts", 6)
    .or(`crm_next_try_at.is.null,crm_next_try_at.lte."${now}"`)
    .order("updated_at", { ascending: true })
    .limit(limit);
  completed.data?.forEach((r) => ids.add(r.id));

  if (s.crm.send_incomplete) {
    const incomplete = await db()
      .from("leads")
      .select("id")
      .eq("completed", false)
      .in("crm_status", ["pendente", "erro"])
      .lt("crm_attempts", 6)
      .lte("updated_at", staleBefore)
      .or(`crm_next_try_at.is.null,crm_next_try_at.lte."${now}"`)
      .not("phone", "is", null)
      .order("updated_at", { ascending: true })
      .limit(limit);
    incomplete.data?.forEach((r) => ids.add(r.id));
  }

  let processed = 0;
  for (const id of [...ids].slice(0, limit)) {
    await sendLeadToCrm(id, s);
    processed++;
  }
  return { processed };
}
