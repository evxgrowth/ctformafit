"use client";

import { useMemo, useState } from "react";

export type DailyPoint = { day: string; visitors: number; clicks: number; leads: number; schedules: number };

const METRICS = [
  { key: "visitors", label: "Visitantes" },
  { key: "clicks", label: "Cliques no WhatsApp" },
  { key: "leads", label: "Leads" },
  { key: "schedules", label: "Agendamentos" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

const W = 760;
const H = 240;
const PAD = { top: 16, right: 8, bottom: 28, left: 36 };

function niceMax(v: number) {
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

const fmtDay = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

export function DailyChart({ data }: { data: DailyPoint[] }) {
  const [metric, setMetric] = useState<MetricKey>("visitors");
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);

  const values = data.map((d) => d[metric]);
  const max = niceMax(Math.max(0, ...values));
  const total = values.reduce((a, b) => a + b, 0);
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const slot = iw / Math.max(1, data.length);
  const bw = Math.max(2, slot - 2); // 2px de respiro entre barras
  const labelEvery = Math.ceil(data.length / 8);
  const ticks = useMemo(() => [0, max / 2, max], [max]);
  const current = METRICS.find((m) => m.key === metric)!;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Métrica do gráfico">
          {METRICS.map((m) => (
            <button
              key={m.key}
              role="tab"
              aria-selected={metric === m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1.5 text-sm font-semibold transition ${
                metric === m.key ? "bg-white text-black" : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button onClick={() => setTable((t) => !t)} className="text-sm text-white/60 underline hover:text-white">
          {table ? "Ver gráfico" : "Ver tabela"}
        </button>
      </div>

      <p className="mt-4 text-sm text-white/60">
        {current.label} no período: <span className="font-semibold text-white">{total.toLocaleString("pt-BR")}</span>
      </p>

      {table ? (
        <div className="mt-3 max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/50">
              <tr>
                <th className="py-1.5 font-medium">Dia</th>
                {METRICS.map((m) => (
                  <th key={m.key} className="py-1.5 text-right font-medium">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.day} className="border-t border-white/5">
                  <td className="py-1.5">{fmtDay(d.day)}</td>
                  {METRICS.map((m) => (
                    <td key={m.key} className="py-1.5 text-right tabular-nums">
                      {d[m.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${current.label} por dia`}>
            {ticks.map((t) => {
              const y = PAD.top + ih - (t / max) * ih;
              return (
                <g key={t}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,.08)" />
                  <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,.45)">
                    {t.toLocaleString("pt-BR")}
                  </text>
                </g>
              );
            })}
            {data.map((d, i) => {
              const v = d[metric];
              const h = (v / max) * ih;
              const x = PAD.left + i * slot + 1;
              const y = PAD.top + ih - h;
              const r = Math.min(4, bw / 2, h);
              return (
                <g key={d.day}>
                  {v > 0 && (
                    <path
                      d={`M${x},${PAD.top + ih} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${PAD.top + ih} Z`}
                      fill="#ff6a13"
                      opacity={hover === null || hover === i ? 1 : 0.45}
                    />
                  )}
                  {i % labelEvery === 0 && (
                    <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,.45)">
                      {fmtDay(d.day)}
                    </text>
                  )}
                  <rect
                    x={PAD.left + i * slot}
                    y={PAD.top}
                    width={slot}
                    height={ih}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onTouchStart={() => setHover(i)}
                  />
                </g>
              );
            })}
            <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + ih} y2={PAD.top + ih} stroke="rgba(255,255,255,.25)" />
          </svg>
          {hover !== null && data[hover] && (
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2 border border-white/15 bg-black/90 px-3 py-2 text-sm shadow-lg"
              style={{ left: `${((PAD.left + hover * slot + slot / 2) / W) * 100}%` }}
            >
              <p className="text-white/60">{fmtDay(data[hover].day)}</p>
              <p className="font-semibold text-white">
                {data[hover][metric].toLocaleString("pt-BR")} {current.label.toLowerCase()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
