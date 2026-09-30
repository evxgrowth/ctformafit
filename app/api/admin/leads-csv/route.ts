import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { fmtDateTime, leadsQuery, type LeadListRow } from "@/lib/leads-query";
import { dayLabel, hourLabel } from "@/lib/schedule";
import { formatBrPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

const esc = (v: unknown) => {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // evita fórmulas no Excel
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  if (!(await getAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const f = Object.fromEntries(req.nextUrl.searchParams.entries());

  const rows: LeadListRow[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    const { data, error } = await leadsQuery(f).range(from, from + 999);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    rows.push(...((data ?? []) as LeadListRow[]));
    if (!data || data.length < 1000) break;
  }

  const header = ["Nome", "WhatsApp", "E-mail", "Visita (dia)", "Visita (hora)", "Agendou em", "Primeiro contato", "Completou agendamento", "utm_source", "utm_medium", "utm_campaign", "utm_content", "Status CRM", "Erro CRM"];
  const lines = rows.map((l) =>
    [
      l.name,
      l.phone ? formatBrPhone(l.phone) : "",
      l.email,
      l.visit_date ? dayLabel(l.visit_date) : "",
      l.visit_hour !== null ? hourLabel(l.visit_hour) : "",
      fmtDateTime(l.completed_at),
      fmtDateTime(l.created_at),
      l.completed ? "Sim" : "Não",
      l.utm_source,
      l.utm_medium,
      l.utm_campaign,
      l.utm_content,
      l.crm_status,
      l.crm_error,
    ]
      .map(esc)
      .join(";"),
  );
  const csv = "﻿" + [header.map(esc).join(";"), ...lines].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-ctformafit-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
