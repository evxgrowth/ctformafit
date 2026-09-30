import Link from "next/link";
import { fmtDateTime, leadsQuery, type LeadFilters, type LeadListRow } from "@/lib/leads-query";
import { dayLabel, hourLabel } from "@/lib/schedule";
import { formatBrPhone, isValidBrPhone, toWhatsappNumber } from "@/lib/phone";
import { LeadActions, SyncNow } from "@/components/admin/LeadActions";
import { inputCls } from "@/components/admin/styles";

export const metadata = { title: "Leads" };

const PAGE_SIZE = 50;

function Status({ l }: { l: LeadListRow }) {
  if (l.completed) return <span className="inline-block bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">✓ Agendou</span>;
  if (l.visit_date)
    return <span className="inline-block bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-200">Escolheu horário, não confirmou</span>;
  if (l.phone && isValidBrPhone(l.phone))
    return <span className="inline-block bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-200">Só deixou os dados</span>;
  return <span className="inline-block bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/60">Incompleto</span>;
}

const CRM_LABEL: Record<string, { t: string; c: string }> = {
  enviado: { t: "Enviado", c: "text-emerald-300" },
  pendente: { t: "Pendente", c: "text-white/60" },
  erro: { t: "Erro", c: "text-red-300" },
  ignorado: { t: "Não enviado", c: "text-white/40" },
};

export default async function LeadsPage({ searchParams }: { searchParams: Promise<LeadFilters> }) {
  const f = await searchParams;
  const page = Math.max(1, Number(f.page) || 1);
  const { data, count, error } = await leadsQuery(f, { count: true }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const leads = (data ?? []) as LeadListRow[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const qs = (extra: Record<string, string | number>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...f, ...extra })) if (v !== undefined && v !== "") p.set(k, String(v));
    return p.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase italic text-white">Leads</h1>
          <p className="text-sm text-white/60">
            Quem preencheu o agendamento em /captura. Os dados são salvos enquanto a pessoa digita, mesmo sem confirmar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SyncNow />
          <a href={`/api/admin/leads-csv?${qs({})}`} className="bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-[#ff6a13]">
            Exportar CSV
          </a>
        </div>
      </div>

      <form className="grid gap-3 border border-white/10 bg-[#111] p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]" method="get">
        <input name="q" defaultValue={f.q} placeholder="Buscar nome, e-mail ou WhatsApp" className={inputCls} />
        <select name="status" defaultValue={f.status ?? ""} className={inputCls}>
          <option value="">Todos os status</option>
          <option value="agendado">Agendou</option>
          <option value="incompleto">Não completou</option>
        </select>
        <select name="crm" defaultValue={f.crm ?? ""} className={inputCls}>
          <option value="">CRM: todos</option>
          <option value="enviado">Enviado</option>
          <option value="pendente">Pendente</option>
          <option value="erro">Erro</option>
          <option value="ignorado">Não enviado</option>
        </select>
        <input type="date" name="from" defaultValue={f.from} className={inputCls} aria-label="Cadastro a partir de" />
        <input type="date" name="to" defaultValue={f.to} className={inputCls} aria-label="Cadastro até" />
        <button className="bg-[#ff6a13] px-4 py-2 font-semibold text-black hover:bg-white">Filtrar</button>
      </form>

      {error && <p className="text-sm text-red-300">Erro ao carregar: {error.message}</p>}

      <p className="text-sm text-white/60">
        {(count ?? 0).toLocaleString("pt-BR")} lead(s){" "}
        {(f.q || f.status || f.crm || f.from || f.to) && (
          <Link href="/admin/leads" className="ml-2 text-[#ff8a3d] underline">
            limpar filtros
          </Link>
        )}
      </p>

      <div className="overflow-x-auto border border-white/10">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-3 py-3 font-semibold">Nome</th>
              <th className="px-3 py-3 font-semibold">WhatsApp</th>
              <th className="px-3 py-3 font-semibold">E-mail</th>
              <th className="px-3 py-3 font-semibold">Visita agendada</th>
              <th className="px-3 py-3 font-semibold">Agendou em</th>
              <th className="px-3 py-3 font-semibold">Primeiro contato</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Origem</th>
              <th className="px-3 py-3 font-semibold">CRM</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-10 text-center text-white/50">
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
            {leads.map((l) => {
              const crm = CRM_LABEL[l.crm_status] ?? CRM_LABEL.pendente;
              return (
                <tr key={l.id} className="border-t border-white/5 align-top hover:bg-white/[0.02]">
                  <td className="px-3 py-3 font-semibold text-white">{l.name || <span className="text-white/35">—</span>}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {l.phone ? (
                      <a
                        href={`https://api.whatsapp.com/send/?phone=${toWhatsappNumber(l.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={isValidBrPhone(l.phone) ? "text-[#ff8a3d] hover:underline" : "text-white/50"}
                      >
                        {formatBrPhone(l.phone)}
                      </a>
                    ) : (
                      <span className="text-white/35">—</span>
                    )}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-3 text-white/80" title={l.email ?? ""}>
                    {l.email || <span className="text-white/35">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {l.visit_date ? (
                      <>
                        <span className="text-white">{dayLabel(l.visit_date)}</span>
                        <br />
                        <span className="text-white/60">{l.visit_hour !== null ? hourLabel(l.visit_hour) : "sem horário"}</span>
                      </>
                    ) : (
                      <span className="text-white/35">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-white/80">{fmtDateTime(l.completed_at) || <span className="text-white/35">—</span>}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-white/60">
                    {fmtDateTime(l.created_at)}
                    {l.updated_at !== l.created_at && !l.completed && <span className="block text-[11px] text-white/40">editou {fmtDateTime(l.updated_at)}</span>}
                  </td>
                  <td className="px-3 py-3">
                    <Status l={l} />
                  </td>
                  <td className="max-w-[170px] px-3 py-3 text-xs text-white/60">
                    {l.utm_source || l.utm_campaign ? (
                      <>
                        {l.utm_source}
                        {l.utm_medium ? ` / ${l.utm_medium}` : ""}
                        {l.utm_campaign && <span className="block truncate text-white/40" title={l.utm_campaign}>{l.utm_campaign}</span>}
                      </>
                    ) : (
                      "direto"
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <span className={`font-semibold ${crm.c}`}>{crm.t}</span>
                    {l.crm_error && l.crm_status !== "enviado" && (
                      <span className="mt-0.5 block max-w-[180px] text-[11px] leading-snug text-white/45" title={l.crm_error}>
                        {l.crm_error.slice(0, 90)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <LeadActions id={l.id} name={l.name ?? ""} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <Link href={`/admin/leads?${qs({ page: page - 1 })}`} className="bg-white/5 px-3 py-1.5 hover:bg-white/10">
              ← Anterior
            </Link>
          )}
          <span className="text-white/60">
            Página {page} de {pages}
          </span>
          {page < pages && (
            <Link href={`/admin/leads?${qs({ page: page + 1 })}`} className="bg-white/5 px-3 py-1.5 hover:bg-white/10">
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
