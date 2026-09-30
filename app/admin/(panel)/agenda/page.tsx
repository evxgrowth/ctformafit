import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getOverrides } from "@/lib/overrides";
import { addDays, nowInNatal, weekdayOf, WEEKDAY_NAMES } from "@/lib/schedule";
import { AgendaCalendar } from "@/components/admin/AgendaCalendar";
import { ActionForm, Card, Field, Toggle } from "@/components/admin/ui";
import { inputCls } from "@/components/admin/styles";
import { saveScheduleAction } from "../../actions";

export const metadata = { title: "Agenda" };

const WEEKS = 9;

export default async function AgendaPage() {
  const s = await getSettings();
  const today = nowInNatal().date;
  const first = addDays(today, -weekdayOf(today));
  const last = addDays(first, WEEKS * 7 - 1);
  const overrides = await getOverrides(first, last);

  const { data: booked } = await db()
    .from("leads")
    .select("visit_date, visit_hour")
    .eq("completed", true)
    .gte("visit_date", first)
    .lte("visit_date", last)
    .limit(5000);
  const visits: Record<string, Record<number, number>> = {};
  for (const b of booked ?? []) {
    if (!b.visit_date || b.visit_hour === null) continue;
    visits[b.visit_date] ??= {};
    visits[b.visit_date][b.visit_hour] = (visits[b.visit_date][b.visit_hour] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black uppercase italic text-white">Agenda de visitas</h1>
        <p className="text-sm text-white/60">
          Controle os dias e horários que aparecem em /captura. As visitas não ocupam vaga: vários visitantes podem escolher o mesmo horário.
        </p>
      </div>

      <Card title="Calendário" desc="Clique num dia para ver os horários. Bloqueios e liberações valem só para aquele dia.">
        <AgendaCalendar today={today} rules={s.schedule} overrides={overrides} visits={visits} weeks={WEEKS} />
      </Card>

      <Card
        title="Regra padrão"
        desc="Vale para todos os dias, exceto os ajustados no calendário. Na tela de agendamento aparece a semana atual e, de quinta-feira em diante, também a semana seguinte."
      >
        <ActionForm action={saveScheduleAction} submitLabel="Salvar regra">
          <fieldset>
            <legend className="text-sm font-semibold text-white">Dias da semana abertos para visita</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {WEEKDAY_NAMES.map((w, i) => (
                <label key={w} className="flex cursor-pointer items-center gap-2 border border-white/15 px-3 py-2 text-sm has-[:checked]:border-[#ff6a13] has-[:checked]:bg-[#ff6a13]/10">
                  <input type="checkbox" name="weekdays" value={i} defaultChecked={s.schedule.weekdays.includes(i)} className="accent-[#ff6a13]" />
                  {w}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Primeiro horário">
              <select name="start_hour" defaultValue={s.schedule.start_hour} className={inputCls}>
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}h00
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Último horário">
              <select name="end_hour" defaultValue={s.schedule.end_hour} className={inputCls}>
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}h00
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Antecedência mínima (minutos)" hint="60 = hoje às 14h, o primeiro horário livre é 15h00.">
              <input name="min_lead_minutes" type="number" min={0} max={1440} step={15} defaultValue={s.schedule.min_lead_minutes} className={inputCls} />
            </Field>
          </div>
          <Toggle name="block_holidays" defaultChecked={s.schedule.block_holidays} label="Bloquear feriados nacionais" hint="Confraternização, Sexta-feira Santa, Tiradentes, Trabalho, Independência, Aparecida, Finados, República, Consciência Negra e Natal." />
          <Toggle name="block_optional_holidays" defaultChecked={s.schedule.block_optional_holidays} label="Bloquear também Carnaval e Corpus Christi" hint="São pontos facultativos, não feriados nacionais." />
        </ActionForm>
      </Card>
    </div>
  );
}
