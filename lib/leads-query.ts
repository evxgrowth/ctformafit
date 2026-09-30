import "server-only";
import { db } from "./db";

export type LeadFilters = { q?: string; status?: string; crm?: string; from?: string; to?: string; page?: string };

export const LEAD_COLUMNS =
  "id, name, phone, email, completed, completed_at, visit_date, visit_hour, created_at, updated_at, source_page, utm_source, utm_medium, utm_campaign, utm_content, crm_status, crm_error, crm_sent_at";

export function leadsQuery(f: LeadFilters, opts: { count?: boolean } = {}) {
  let q = db()
    .from("leads")
    .select(LEAD_COLUMNS, opts.count ? { count: "exact" } : undefined)
    .order("created_at", { ascending: false });

  const term = (f.q ?? "").replace(/[,()%*]/g, " ").trim();
  if (term) {
    const digits = term.replace(/\D/g, "");
    const parts = [`name.ilike.%${term}%`, `email.ilike.%${term}%`];
    if (digits.length >= 3) parts.push(`phone.ilike.%${digits}%`);
    q = q.or(parts.join(","));
  }
  if (f.status === "agendado") q = q.eq("completed", true);
  if (f.status === "incompleto") q = q.eq("completed", false);
  if (f.crm && ["pendente", "enviado", "erro", "ignorado"].includes(f.crm)) q = q.eq("crm_status", f.crm);
  if (f.from && /^\d{4}-\d{2}-\d{2}$/.test(f.from)) q = q.gte("created_at", `${f.from}T00:00:00-03:00`);
  if (f.to && /^\d{4}-\d{2}-\d{2}$/.test(f.to)) q = q.lte("created_at", `${f.to}T23:59:59-03:00`);
  return q;
}

export type LeadListRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  completed: boolean;
  completed_at: string | null;
  visit_date: string | null;
  visit_hour: number | null;
  created_at: string;
  updated_at: string;
  source_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  crm_status: string;
  crm_error: string | null;
  crm_sent_at: string | null;
};

const dtf = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Fortaleza",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
export const fmtDateTime = (iso: string | null) => (iso ? dtf.format(new Date(iso)).replace(",", "") : "");
