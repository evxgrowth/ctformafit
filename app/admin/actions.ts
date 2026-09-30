"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { endSession, requireAdmin, startSession } from "@/lib/auth";
import { getSettings, saveSetting } from "@/lib/settings";
import { sendLeadToCrm, syncPendingLeads } from "@/lib/crm";
import { onlyDigits, toWhatsappNumber } from "@/lib/phone";

export type ActionState = { ok?: boolean; error?: string; message?: string } | undefined;

const txt = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
const list = (v: string) =>
  v
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

function refreshSite() {
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------ sessão

export async function loginAction(_: ActionState, f: FormData): Promise<ActionState> {
  const email = txt(f, "email", 200).toLowerCase();
  const password = String(f.get("password") ?? "");
  const { data: admin } = await db().from("admins").select("*").eq("email", email).maybeSingle();
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) return { error: "E-mail ou senha incorretos." };
  await db().from("admins").update({ last_login_at: new Date().toISOString() }).eq("id", admin.id);
  await startSession({ sub: admin.id, email: admin.email, name: admin.name });
  redirect("/admin");
}

export async function setupAction(_: ActionState, f: FormData): Promise<ActionState> {
  const { count } = await db().from("admins").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return { error: "O primeiro administrador já foi criado. Faça login." };
  const name = txt(f, "name", 120);
  const email = txt(f, "email", 200).toLowerCase();
  const password = String(f.get("password") ?? "");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Preencha nome e e-mail válidos." };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  const { data, error } = await db()
    .from("admins")
    .insert({ name, email, password_hash: await bcrypt.hash(password, 10) })
    .select()
    .single();
  if (error) return { error: error.message };
  await startSession({ sub: data.id, email: data.email, name: data.name });
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

// ------------------------------------------------------------------ WhatsApp

export async function saveWhatsappAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const digits = onlyDigits(txt(f, "number", 30));
  if (digits.length < 10) return { error: "Número inválido. Use DDD + número, ex.: 84 99840-6056." };
  const messages = {
    experimental: txt(f, "experimental", 600),
    matricula: txt(f, "matricula", 600),
    contato: txt(f, "contato", 600),
    conhecer: txt(f, "conhecer", 600),
    agendamento: txt(f, "agendamento", 600),
  };
  if (Object.values(messages).some((m) => !m)) return { error: "Nenhuma mensagem pode ficar vazia." };
  await saveSetting("whatsapp", { number: toWhatsappNumber(digits), messages });
  refreshSite();
  return { ok: true, message: "WhatsApp e mensagens salvos. O site já está usando os novos dados." };
}

// ------------------------------------------------------------------ Pixels / integrações

const KEEP = "__manter__";

export async function saveTrackingAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const s = await getSettings();
  const pixel = onlyDigits(txt(f, "meta_pixel_id", 30));
  const ga4 = txt(f, "ga4_id", 30).toUpperCase();
  const ads = txt(f, "google_ads_id", 30).toUpperCase();
  const gtm = txt(f, "gtm_id", 30).toUpperCase();
  if (ga4 && !/^G-[A-Z0-9]+$/.test(ga4)) return { error: "O ID do GA4 começa com G- (ex.: G-ABC123XYZ)." };
  if (ads && !/^AW-\d+$/.test(ads)) return { error: "O ID do Google Ads começa com AW- (ex.: AW-123456789)." };
  if (gtm && !/^GTM-[A-Z0-9]+$/.test(gtm)) return { error: "O ID do Tag Manager começa com GTM-." };

  await saveSetting("tracking", {
    meta_pixel_id: pixel,
    meta_test_event_code: txt(f, "meta_test_event_code", 40),
    ga4_id: ga4,
    gtm_id: gtm,
    google_ads_id: ads,
    google_ads_label_lead: txt(f, "google_ads_label_lead", 80),
    google_ads_label_schedule: txt(f, "google_ads_label_schedule", 80),
    google_ads_label_contact: txt(f, "google_ads_label_contact", 80),
  });

  const secret = (k: "meta_capi_token" | "ga4_api_secret") => {
    const v = txt(f, k, 1000);
    return v === KEEP ? s.secrets[k] : v;
  };
  await saveSetting("secrets", { ...s.secrets, meta_capi_token: secret("meta_capi_token"), ga4_api_secret: secret("ga4_api_secret") });
  refreshSite();
  return { ok: true, message: "Pixels e APIs de conversão salvos." };
}

export async function saveCrmAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const s = await getSettings();
  const endpoint = txt(f, "endpoint", 300);
  if (!/^https:\/\//.test(endpoint)) return { error: "O endereço do CRM precisa começar com https://" };
  const token = txt(f, "crm_token", 1000);
  await saveSetting("crm", {
    enabled: f.get("enabled") === "on",
    endpoint,
    interest: txt(f, "interest", 120),
    unit: txt(f, "unit", 120),
    tags_completed: list(txt(f, "tags_completed", 800)),
    tags_incomplete: list(txt(f, "tags_incomplete", 800)),
    send_incomplete: f.get("send_incomplete") === "on",
    incomplete_delay_min: Math.min(240, Math.max(5, Number(txt(f, "incomplete_delay_min", 5)) || 15)),
  });
  if (token !== KEEP) await saveSetting("secrets", { ...s.secrets, crm_token: token });
  return { ok: true, message: "Integração com o CRM salva." };
}

export async function syncCrmNowAction(): Promise<ActionState> {
  await requireAdmin();
  const r = await syncPendingLeads(40);
  revalidatePath("/admin/leads");
  return { ok: true, message: `${r.processed} lead(s) processado(s).` };
}

// ------------------------------------------------------------------ Agenda

export async function saveScheduleAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const weekdays = f.getAll("weekdays").map(Number).filter((n) => n >= 0 && n <= 6);
  const start = Number(f.get("start_hour"));
  const end = Number(f.get("end_hour"));
  const lead = Number(f.get("min_lead_minutes"));
  if (!(start >= 0 && end <= 23 && start <= end)) return { error: "Horário inicial precisa ser menor que o final." };
  await saveSetting("schedule", {
    weekdays,
    start_hour: start,
    end_hour: end,
    min_lead_minutes: Math.max(0, Math.min(1440, lead || 0)),
    block_holidays: f.get("block_holidays") === "on",
    block_optional_holidays: f.get("block_optional_holidays") === "on",
  });
  revalidatePath("/admin/agenda");
  return { ok: true, message: "Regras da agenda salvas." };
}

/** kind = null remove a exceção e volta à regra padrão. */
export async function setOverrideAction(date: string, hour: number | null, kind: "block" | "open" | null) {
  await requireAdmin();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  let del = db().from("availability_overrides").delete().eq("date", date);
  del = hour === null ? del.is("hour", null) : del.eq("hour", hour);
  await del;
  if (kind) await db().from("availability_overrides").insert({ date, hour, kind });
  revalidatePath("/admin/agenda");
}

// ------------------------------------------------------------------ Leads

export async function resendLeadAction(id: string): Promise<ActionState> {
  await requireAdmin();
  await db().from("leads").update({ crm_attempts: 0 }).eq("id", id);
  const r = await sendLeadToCrm(id);
  revalidatePath("/admin/leads");
  return r.ok ? { ok: true, message: "Enviado ao CRM." } : { error: r.error };
}

export async function deleteLeadAction(id: string) {
  await requireAdmin();
  await db().from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
}

// ------------------------------------------------------------------ Admins

export async function addAdminAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = txt(f, "name", 120);
  const email = txt(f, "email", 200).toLowerCase();
  const password = String(f.get("password") ?? "");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Preencha nome e e-mail válidos." };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  const { error } = await db().from("admins").insert({ name, email, password_hash: await bcrypt.hash(password, 10) });
  if (error) return { error: error.code === "23505" ? "Já existe um administrador com esse e-mail." : error.message };
  revalidatePath("/admin/usuarios");
  return { ok: true, message: `${name} agora é administrador. Envie o e-mail e a senha por um canal seguro.` };
}

export async function removeAdminAction(id: string): Promise<ActionState> {
  const me = await requireAdmin();
  if (id === me.sub) return { error: "Você não pode remover a si mesmo." };
  const { count } = await db().from("admins").select("id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) return { error: "Precisa existir pelo menos um administrador." };
  await db().from("admins").delete().eq("id", id);
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function changePasswordAction(_: ActionState, f: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const current = String(f.get("current") ?? "");
  const next = String(f.get("next") ?? "");
  if (next.length < 8) return { error: "A nova senha precisa ter pelo menos 8 caracteres." };
  const { data } = await db().from("admins").select("password_hash").eq("id", me.sub).single();
  if (!data || !(await bcrypt.compare(current, data.password_hash))) return { error: "Senha atual incorreta." };
  await db().from("admins").update({ password_hash: await bcrypt.hash(next, 10) }).eq("id", me.sub);
  return { ok: true, message: "Senha alterada." };
}
