import Link from "next/link";
import { db } from "@/lib/db";
import { addDays, nowInNatal } from "@/lib/schedule";
import { DailyChart, type DailyPoint } from "@/components/admin/DailyChart";

export const metadata = { title: "Painel" };

const PERIODS = [
  { d: 1, label: "Hoje" },
  { d: 7, label: "7 dias" },
  { d: 30, label: "30 dias" },
  { d: 90, label: "90 dias" },
];

type Daily = { day: string; type: string; events: number; sessions: number };
type Break = { dim: string; key: string; type: string; events: number; sessions: number };

function pct(a: number, b: number) {
  if (!b) return "—";
  return `${((a / b) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="border border-white/10 bg-[#111] p-5">
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-2 font-display text-5xl font-black italic leading-none text-white tabular-nums">
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </p>
      {note && <p className="mt-2 text-xs text-white/50">{note}</p>}
    </div>
  );
}

function RankTable({ title, rows, cols }: { title: string; rows: Record<string, string | number>[]; cols: { key: string; label: string }[] }) {
  return (
    <section className="border border-white/10 bg-[#111] p-5">
      <h2 className="font-display text-lg font-extrabold uppercase italic text-white">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-white/50">Sem dados no período.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50">
                {cols.map((c, i) => (
                  <th key={c.key} className={`py-1.5 font-medium ${i ? "text-right" : ""}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((r, idx) => (
                <tr key={idx} className="border-t border-white/5">
                  {cols.map((c, i) => (
                    <td key={c.key} className={`max-w-[260px] truncate py-2 ${i ? "text-right tabular-nums" : "text-white"}`} title={String(r[c.key])}>
                      {typeof r[c.key] === "number" ? (r[c.key] as number).toLocaleString("pt-BR") : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  const days = PERIODS.some((p) => String(p.d) === d) ? Number(d) : 30;
  const today = nowInNatal().date;
  const fromDate = addDays(today, -(days - 1));
  const from = `${fromDate}T00:00:00-03:00`;
  const to = `${addDays(today, 1)}T00:00:00-03:00`;

  const [dailyRes, breakRes, leadsTotal, leadsValid, schedules, pendingCrm] = await Promise.all([
    db().rpc("analytics_daily", { p_from: from, p_to: to }),
    db().rpc("analytics_breakdown", { p_from: from, p_to: to }),
    db().from("leads").select("id", { count: "exact", head: true }).gte("created_at", from).lt("created_at", to),
    db().from("leads").select("id", { count: "exact", head: true }).gte("created_at", from).lt("created_at", to).not("phone", "is", null).not("name", "is", null),
    db().from("leads").select("id", { count: "exact", head: true }).eq("completed", true).gte("completed_at", from).lt("completed_at", to),
    db().from("leads").select("id", { count: "exact", head: true }).eq("crm_status", "erro"),
  ]);

  const daily = (dailyRes.data ?? []) as Daily[];
  const br = (breakRes.data ?? []) as Break[];
  const rpcError = dailyRes.error || breakRes.error;

  const series: DailyPoint[] = [];
  for (let day = fromDate; day <= today; day = addDays(day, 1)) {
    const rows = daily.filter((r) => r.day === day);
    const get = (t: string, k: "events" | "sessions") => Number(rows.find((r) => r.type === t)?.[k] ?? 0);
    series.push({ day, visitors: get("page_view", "sessions"), clicks: get("cta_click", "events"), leads: get("lead", "events"), schedules: get("schedule", "events") });
  }
  const sum = (k: keyof Omit<DailyPoint, "day">) => series.reduce((a, p) => a + p[k], 0);
  const visitors = sum("visitors");

  // Funil da /captura
  const pageRow = (page: string, type: string) => br.find((r) => r.dim === "page" && r.key === page && r.type === type);
  const funnel = [
    { label: "Visitaram /captura", v: Number(pageRow("/captura", "page_view")?.sessions ?? 0) },
    { label: "Abriram o agendamento", v: Number(pageRow("/captura/agendar", "page_view")?.sessions ?? 0) },
    { label: "Começaram a digitar", v: Number(pageRow("/captura/agendar", "form_start")?.sessions ?? 0) },
    { label: "Deixaram nome e WhatsApp", v: Number(br.filter((r) => r.dim === "page" && r.type === "lead").reduce((a, r) => a + Number(r.events), 0)) },
    { label: "Confirmaram o agendamento", v: Number(br.filter((r) => r.dim === "page" && r.type === "schedule").reduce((a, r) => a + Number(r.events), 0)) },
  ];
  const fmax = Math.max(1, ...funnel.map((f) => f.v));

  const byDim = (dim: string) => {
    const map = new Map<string, { key: string; visitors: number; clicks: number; leads: number; schedules: number }>();
    for (const r of br.filter((x) => x.dim === dim)) {
      const m = map.get(r.key) ?? { key: r.key, visitors: 0, clicks: 0, leads: 0, schedules: 0 };
      if (r.type === "page_view") m.visitors += Number(r.sessions);
      if (r.type === "cta_click") m.clicks += Number(r.events);
      if (r.type === "lead") m.leads += Number(r.events);
      if (r.type === "schedule") m.schedules += Number(r.events);
      map.set(r.key, m);
    }
    return [...map.values()].sort((a, b) => b.visitors + b.leads * 10 - (a.visitors + a.leads * 10));
  };
  const ctas = br
    .filter((r) => r.dim === "cta")
    .map((r) => ({ key: r.key, clicks: Number(r.events) }))
    .sort((a, b) => b.clicks - a.clicks);
  const devices = byDim("device");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase italic text-white">Painel</h1>
          <p className="text-sm text-white/60">Visitas, cliques e conversões do site.</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Link
              key={p.d}
              href={`/admin?d=${p.d}`}
              className={`px-3 py-1.5 text-sm font-semibold ${days === p.d ? "bg-[#ff6a13] text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {rpcError && (
        <p className="border-l-2 border-amber-500 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          As funções de analytics não foram encontradas no banco. Rode novamente o arquivo supabase/schema.sql no Supabase.
        </p>
      )}
      {(pendingCrm.count ?? 0) > 0 && (
        <Link href="/admin/leads?crm=erro" className="block border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-100 hover:bg-red-500/15">
          {pendingCrm.count} lead(s) com erro no envio ao CRM. Clique para ver e reenviar.
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Visitantes" value={visitors} note="Sessões únicas no site" />
        <Stat label="Cliques no WhatsApp" value={sum("clicks")} note={`Taxa de clique: ${pct(sum("clicks"), visitors)}`} />
        <Stat label="Leads captados" value={leadsValid.count ?? 0} note={`${leadsTotal.count ?? 0} começaram a preencher`} />
        <Stat label="Agendamentos" value={schedules.count ?? 0} note={`Conversão da /captura: ${pct(schedules.count ?? 0, funnel[0].v)}`} />
      </div>

      <section className="border border-white/10 bg-[#111] p-5">
        <h2 className="font-display text-lg font-extrabold uppercase italic text-white">Evolução diária</h2>
        <div className="mt-4">
          <DailyChart data={series} />
        </div>
      </section>

      <section className="border border-white/10 bg-[#111] p-5">
        <h2 className="font-display text-lg font-extrabold uppercase italic text-white">Funil de agendamento (/captura)</h2>
        <ol className="mt-5 space-y-3">
          {funnel.map((f, i) => (
            <li key={f.label} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[220px_1fr_110px]">
              <span className="text-sm text-white/80">{f.label}</span>
              <span className="order-3 col-span-2 h-7 bg-white/[0.04] sm:order-none sm:col-span-1">
                <span className="block h-full rounded-r-[4px] bg-[#ff6a13]" style={{ width: `${(f.v / fmax) * 100}%` }} />
              </span>
              <span className="text-right text-sm tabular-nums text-white">
                {f.v.toLocaleString("pt-BR")}
                {i > 0 && <span className="ml-2 text-white/45">{pct(f.v, funnel[i - 1].v)}</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <RankTable
          title="Origem do tráfego"
          rows={byDim("source")}
          cols={[
            { key: "key", label: "Origem (utm_source)" },
            { key: "visitors", label: "Visitantes" },
            { key: "clicks", label: "Cliques" },
            { key: "leads", label: "Leads" },
            { key: "schedules", label: "Agend." },
          ]}
        />
        <RankTable
          title="Campanhas"
          rows={byDim("campaign")}
          cols={[
            { key: "key", label: "Campanha (utm_campaign)" },
            { key: "visitors", label: "Visitantes" },
            { key: "leads", label: "Leads" },
            { key: "schedules", label: "Agend." },
          ]}
        />
        <RankTable title="Botões mais clicados" rows={ctas} cols={[{ key: "key", label: "Botão" }, { key: "clicks", label: "Cliques" }]} />
        <RankTable title="Dispositivos" rows={devices} cols={[{ key: "key", label: "Dispositivo" }, { key: "visitors", label: "Visitantes" }]} />
      </div>
    </div>
  );
}
