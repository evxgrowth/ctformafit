// Regras de agenda. Tudo no fuso de Natal/RN (UTC-3, sem horário de verão).
// Datas trafegam como texto "AAAA-MM-DD" para evitar confusão de fuso.

export type ScheduleRules = {
  weekdays: number[];
  start_hour: number;
  end_hour: number;
  min_lead_minutes: number;
  block_holidays: boolean;
  block_optional_holidays: boolean;
};

export type Override = { date: string; hour: number | null; kind: "block" | "open" };

export type DaySlots = {
  date: string;
  weekday: number;
  label: string; // "Quarta-feira (30/09)"
  short: string; // "Qua"
  dayMonth: string; // "30/09"
  relative: "hoje" | "amanhã" | null;
  hours: number[];
};

const OFFSET_MS = 3 * 60 * 60 * 1000;
export const WEEKDAY_NAMES = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** "Agora" em Natal: data (AAAA-MM-DD) e minutos desde a meia-noite. */
export function nowInNatal(now = new Date()) {
  const local = new Date(now.getTime() - OFFSET_MS);
  return { date: local.toISOString().slice(0, 10), minutes: local.getUTCHours() * 60 + local.getUTCMinutes() };
}

function toUtcDate(date: string) {
  return new Date(`${date}T00:00:00Z`);
}
export function addDays(date: string, n: number) {
  const d = toUtcDate(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function weekdayOf(date: string) {
  return toUtcDate(date).getUTCDay();
}
export function dayMonth(date: string) {
  return `${date.slice(8, 10)}/${date.slice(5, 7)}`;
}
export function dayLabel(date: string) {
  return `${WEEKDAY_NAMES[weekdayOf(date)]} (${dayMonth(date)})`;
}
export function hourLabel(h: number) {
  return `${String(h).padStart(2, "0")}h00`;
}

function easter(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Feriados nacionais (lei federal). */
export function nationalHolidays(year: number): Record<string, string> {
  const e = easter(year);
  return {
    [`${year}-01-01`]: "Confraternização Universal",
    [addDays(e, -2)]: "Sexta-feira Santa",
    [`${year}-04-21`]: "Tiradentes",
    [`${year}-05-01`]: "Dia do Trabalho",
    [`${year}-09-07`]: "Independência do Brasil",
    [`${year}-10-12`]: "Nossa Senhora Aparecida",
    [`${year}-11-02`]: "Finados",
    [`${year}-11-15`]: "Proclamação da República",
    [`${year}-11-20`]: "Dia da Consciência Negra",
    [`${year}-12-25`]: "Natal",
  };
}

/** Pontos facultativos nacionais mais comuns. */
export function optionalHolidays(year: number): Record<string, string> {
  const e = easter(year);
  return {
    [addDays(e, -48)]: "Carnaval (segunda)",
    [addDays(e, -47)]: "Carnaval (terça)",
    [addDays(e, 60)]: "Corpus Christi",
  };
}

export function holidayName(date: string, rules: Pick<ScheduleRules, "block_optional_holidays">) {
  const y = Number(date.slice(0, 4));
  return nationalHolidays(y)[date] || (rules.block_optional_holidays ? optionalHolidays(y)[date] : undefined);
}

/** Horários disponíveis de um dia, sem considerar "hoje". */
export function hoursForDate(date: string, rules: ScheduleRules, overrides: Override[]) {
  const mine = overrides.filter((o) => o.date === date);
  const dayOverride = mine.find((o) => o.hour === null);
  let open = rules.weekdays.includes(weekdayOf(date));
  if (open && rules.block_holidays && holidayName(date, rules)) open = false;
  if (dayOverride) open = dayOverride.kind === "open";

  const hourBlocks = new Set(mine.filter((o) => o.hour !== null && o.kind === "block").map((o) => o.hour));
  const hourOpens = mine.filter((o) => o.hour !== null && o.kind === "open").map((o) => o.hour as number);

  const hours: number[] = [];
  if (open) for (let h = rules.start_hour; h <= rules.end_hour; h++) if (!hourBlocks.has(h)) hours.push(h);
  for (const h of hourOpens) if (!hours.includes(h) && !hourBlocks.has(h)) hours.push(h);
  return hours.sort((a, b) => a - b);
}

/**
 * Dias que aparecem para o visitante.
 * - Sempre a semana corrente (a partir de hoje).
 * - De quinta-feira em diante (e no fim de semana), também a semana seguinte.
 * - Hoje só mostra horários com pelo menos `min_lead_minutes` de antecedência.
 * - Se nada estiver livre, estende semana a semana (até 4 semanas).
 */
export function availableDays(rules: ScheduleRules, overrides: Override[], now = new Date()): DaySlots[] {
  const { date: today, minutes } = nowInNatal(now);
  const dow = weekdayOf(today);
  let end = dow === 0 ? today : addDays(today, 7 - dow); // domingo desta semana
  if (dow >= 4 || dow === 0) end = addDays(end, 7);

  const build = (from: string, to: string) => {
    const out: DaySlots[] = [];
    for (let d = from; d <= to; d = addDays(d, 1)) {
      let hours = hoursForDate(d, rules, overrides);
      if (d === today) hours = hours.filter((h) => h * 60 >= minutes + rules.min_lead_minutes);
      if (!hours.length) continue;
      out.push({
        date: d,
        weekday: weekdayOf(d),
        label: dayLabel(d),
        short: WEEKDAY_SHORT[weekdayOf(d)],
        dayMonth: dayMonth(d),
        relative: d === today ? "hoje" : d === addDays(today, 1) ? "amanhã" : null,
        hours,
      });
    }
    return out;
  };

  let days = build(today, end);
  for (let i = 0; i < 4 && !days.length; i++) {
    const from = addDays(end, 1);
    end = addDays(end, 7);
    days = build(from, end);
  }
  return days;
}

export function isSlotAvailable(date: string, hour: number, rules: ScheduleRules, overrides: Override[], now = new Date()) {
  return availableDays(rules, overrides, now).some((d) => d.date === date && d.hours.includes(hour));
}

/** Timestamp ISO da visita em Natal. */
export function visitIso(date: string, hour: number) {
  return `${date}T${String(hour).padStart(2, "0")}:00:00-03:00`;
}
