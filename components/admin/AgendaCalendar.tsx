"use client";

import { useMemo, useState, useTransition } from "react";
import { setOverrideAction } from "@/app/admin/actions";
import {
  WEEKDAY_NAMES,
  addDays,
  dayMonth,
  holidayName,
  hourLabel,
  hoursForDate,
  weekdayOf,
  type Override,
  type ScheduleRules,
} from "@/lib/schedule";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function AgendaCalendar({
  today,
  rules,
  overrides: initial,
  visits,
  weeks = 9,
}: {
  today: string;
  rules: ScheduleRules;
  overrides: Override[];
  visits: Record<string, Record<number, number>>;
  weeks?: number;
}) {
  const [overrides, setOverrides] = useState(initial);
  const [selected, setSelected] = useState(today);
  const [pending, start] = useTransition();

  const first = addDays(today, -weekdayOf(today)); // domingo desta semana
  const days = useMemo(() => Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i)), [first, weeks]);

  const baseOpen = (d: string) => rules.weekdays.includes(weekdayOf(d)) && !(rules.block_holidays && holidayName(d, rules));

  const apply = (date: string, hour: number | null, kind: "block" | "open" | null) => {
    setOverrides((prev) => {
      const rest = prev.filter((o) => !(o.date === date && o.hour === hour));
      return kind ? [...rest, { date, hour, kind }] : rest;
    });
    start(() => setOverrideAction(date, hour, kind));
  };

  const toggleDay = (d: string) => {
    const open = hoursForDate(d, rules, overrides.filter((o) => o.hour === null)).length > 0;
    const wantOpen = !open;
    apply(d, null, wantOpen === baseOpen(d) ? null : wantOpen ? "open" : "block");
  };

  const toggleHour = (d: string, h: number) => {
    const dayOverride = overrides.find((o) => o.date === d && o.hour === null);
    const dayOpen = dayOverride ? dayOverride.kind === "open" : baseOpen(d);
    const inRange = dayOpen && h >= rules.start_hour && h <= rules.end_hour;
    const current = overrides.find((o) => o.date === d && o.hour === h);
    const available = hoursForDate(d, rules, overrides).includes(h);
    if (available) apply(d, h, inRange ? "block" : null);
    else if (current?.kind === "block") apply(d, h, null);
    else apply(d, h, "open");
  };

  const sel = selected;
  const selHours = hoursForDate(sel, rules, overrides);
  const selHoliday = holidayName(sel, rules);
  const past = (d: string) => d < today;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      <div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-white/40">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((w) => (
            <span key={w} className="py-1">
              {w}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const hours = hoursForDate(d, rules, overrides);
            const open = hours.length > 0;
            const custom = overrides.some((o) => o.date === d);
            const hol = holidayName(d, { block_optional_holidays: true });
            const count = Object.values(visits[d] ?? {}).reduce((a, b) => a + b, 0);
            const isSel = d === sel;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelected(d)}
                disabled={past(d)}
                className={`relative flex min-h-[64px] flex-col items-start justify-between border p-1.5 text-left transition sm:min-h-[78px] sm:p-2 ${
                  isSel ? "border-[#ff6a13] ring-1 ring-[#ff6a13]" : "border-white/10"
                } ${past(d) ? "opacity-25" : open ? "bg-emerald-500/10 hover:bg-emerald-500/15" : "bg-white/[0.02] hover:bg-white/[0.05]"}`}
                aria-label={`${WEEKDAY_NAMES[weekdayOf(d)]} ${dayMonth(d)}: ${open ? `${hours.length} horários` : "fechado"}`}
              >
                <span className="flex w-full items-center justify-between">
                  <span className={`text-sm font-bold ${d === today ? "text-[#ff8a3d]" : "text-white"}`}>
                    {Number(d.slice(8))}
                    {d.slice(8) === "01" && <span className="ml-0.5 text-[10px] font-normal text-white/50">{MONTHS[Number(d.slice(5, 7)) - 1]}</span>}
                  </span>
                  {custom && <span className="h-1.5 w-1.5 bg-[#ff6a13]" title="Tem ajuste manual" />}
                </span>
                <span className="w-full text-[10px] leading-tight text-white/55">
                  {hol ? <span className="block truncate text-amber-200/80" title={hol}>Feriado</span> : null}
                  {open ? `${hours.length}h livres` : "Fechado"}
                </span>
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center bg-[#ff6a13] px-1 text-[10px] font-bold text-black">{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-white/50">
          Verde = aberto para visitas. Ponto laranja = ajuste manual. Número laranja = visitas agendadas no dia.
        </p>
      </div>

      <div className="border border-white/10 bg-[#111] p-5">
        <p className="text-sm text-white/50">Dia selecionado</p>
        <h3 className="font-display text-3xl font-black uppercase italic text-white">
          {WEEKDAY_NAMES[weekdayOf(sel)]} ({dayMonth(sel)})
        </h3>
        {selHoliday && <p className="mt-1 text-sm text-amber-200">Feriado: {selHoliday}</p>}

        {!past(sel) && (
          <button
            type="button"
            onClick={() => toggleDay(sel)}
            disabled={pending}
            className={`mt-4 w-full px-4 py-2.5 font-semibold transition ${
              selHours.length ? "bg-red-500/15 text-red-200 hover:bg-red-500/25" : "bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
            }`}
          >
            {selHours.length ? "Bloquear o dia inteiro" : `Liberar o dia (${hourLabel(rules.start_hour)} às ${hourLabel(rules.end_hour)})`}
          </button>
        )}

        <p className="mt-5 text-sm text-white/60">Clique num horário para bloquear ou liberar:</p>
        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {Array.from({ length: 18 }, (_, i) => i + 5).map((h) => {
            const on = selHours.includes(h);
            const n = visits[sel]?.[h] ?? 0;
            return (
              <button
                key={h}
                type="button"
                disabled={past(sel) || pending}
                onClick={() => toggleHour(sel, h)}
                className={`relative py-2 text-sm font-semibold transition ${
                  on ? "bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" : "bg-white/[0.04] text-white/35 line-through hover:bg-white/10"
                }`}
              >
                {hourLabel(h)}
                {n > 0 && <span className="absolute -right-1 -top-1 bg-[#ff6a13] px-1 text-[10px] font-bold text-black no-underline">{n}</span>}
              </button>
            );
          })}
        </div>
        {overrides.some((o) => o.date === sel) && !past(sel) && (
          <button
            type="button"
            onClick={() => {
              overrides.filter((o) => o.date === sel).forEach((o) => apply(sel, o.hour, null));
            }}
            className="mt-4 text-sm text-[#ff8a3d] underline"
          >
            Desfazer ajustes deste dia (voltar à regra padrão)
          </button>
        )}
        {pending && <p className="mt-3 text-xs text-white/50">Salvando...</p>}
      </div>
    </div>
  );
}
