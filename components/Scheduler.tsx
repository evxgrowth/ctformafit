"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IMG } from "./landing/content";
import { Icon } from "./landing/icons";
import { formatBrPhone, isValidBrPhone, onlyDigits } from "@/lib/phone";
import { hourLabel, type DaySlots } from "@/lib/schedule";
import { getAttribution, sendInternal, sessionId, trackLead, trackSchedule, uuid, withAttribution } from "@/lib/client-track";

const SLIDES = [
  { src: IMG.salao, alt: "Salão de musculação do CT Forma Fit" },
  { src: IMG.esteiras, alt: "Cardio com fileira de esteiras" },
  { src: IMG.noite, alt: "CT Forma Fit iluminado à noite" },
  { src: IMG.escada, alt: "Escada, bikes e esteiras" },
  { src: IMG.supino, alt: "Área de peso livre" },
];

const ease = [0.16, 1, 0.3, 1] as const;
const LS_ID = "ff_lead_id";
const LS_FORM = "ff_lead_form";

function ls(key: string, value?: string | null) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
  return null;
}

type Form = { name: string; phone: string; email: string };

export function Scheduler() {
  const [leadId, setLeadId] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<Form>({ name: "", phone: "", email: "" });
  const [touched, setTouched] = useState<Record<keyof Form, boolean>>({ name: false, phone: false, email: false });
  const [days, setDays] = useState<DaySlots[] | null>(null);
  const [day, setDay] = useState<string>("");
  const [hour, setHour] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [slide, setSlide] = useState(0);
  const [redirectUrl, setRedirectUrl] = useState("");

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);
  const sentOnce = useRef(false);
  const latest = useRef<{ form: Form; day: string; hour: number | null }>({ form, day, hour });
  latest.current = { form, day, hour };

  // Recupera o rascunho (se a pessoa voltou à página).
  useEffect(() => {
    let id = ls(LS_ID);
    if (!id) {
      id = uuid();
      ls(LS_ID, id);
    }
    setLeadId(id);
    try {
      const saved = JSON.parse(ls(LS_FORM) || "null");
      if (saved?.id === id) {
        setForm({ name: saved.name ?? "", phone: saved.phone ?? "", email: saved.email ?? "" });
        sentOnce.current = true;
      }
    } catch {}
  }, []);

  const loadDays = useCallback(async () => {
    try {
      const r = await fetch("/api/availability", { cache: "no-store" });
      const j = await r.json();
      setDays(j.days ?? []);
      return (j.days ?? []) as DaySlots[];
    } catch {
      setDays([]);
      return [];
    }
  }, []);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const nameOk = form.name.trim().length >= 2;
  const phoneOk = isValidBrPhone(form.phone);
  const emailOk = !form.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  // ---------------------------------------------------------------- captura ao digitar
  const payload = useCallback(
    (extra: Record<string, unknown> = {}) => {
      const { form: f, day: d, hour: h } = latest.current;
      return {
        id: leadId,
        name: f.name,
        phone: onlyDigits(f.phone),
        email: f.email,
        page: "/captura",
        url: window.location.href,
        sessionId: sessionId(),
        attribution: { ...getAttribution(), referrer: getAttribution().referrer || document.referrer || undefined },
        ...(d ? { visit_date: d, visit_hour: h } : {}),
        ...extra,
      };
    },
    [leadId],
  );

  const flushDraft = useCallback(
    (beacon = false) => {
      if (!leadId) return;
      const { form: f } = latest.current;
      const hasData = f.name.trim() || onlyDigits(f.phone) || f.email.trim();
      if (!hasData && !sentOnce.current) return;
      sentOnce.current = true;
      ls(LS_FORM, JSON.stringify({ id: leadId, ...f }));

      const extra: Record<string, unknown> = {};
      const leadKey = `ff_lead_evt_${leadId}`;
      if (f.name.trim().length >= 2 && isValidBrPhone(f.phone) && !ls(leadKey)) {
        const eventId = `lead-${leadId}`;
        ls(leadKey, "1");
        trackLead(eventId, { email: f.email.trim() || undefined, phone: onlyDigits(f.phone) });
        extra.leadEventId = eventId;
      }

      const body = JSON.stringify(payload(extra));
      if (beacon && navigator.sendBeacon) {
        navigator.sendBeacon("/api/leads/draft", new Blob([body], { type: "application/json" }));
        return;
      }
      fetch("/api/leads/draft", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
    },
    [leadId, payload],
  );

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flushDraft(), 650);
  }, [flushDraft]);

  useEffect(() => {
    const onHide = () => {
      if (status === "idle") flushDraft(true);
    };
    const onVis = () => document.visibilityState === "hidden" && onHide();
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [flushDraft, status]);

  const set = (k: keyof Form, v: string) => {
    if (!started.current) {
      started.current = true;
      sendInternal("form_start", { label: "agendamento" });
    }
    setForm((f) => ({ ...f, [k]: k === "phone" ? formatBrPhone(v) : v }));
    schedule();
  };

  // ---------------------------------------------------------------- etapas
  const next = () => {
    setTouched({ name: true, phone: true, email: true });
    if (!nameOk || !phoneOk || !emailOk) return;
    flushDraft();
    sendInternal("step_data", { label: "agendamento" });
    setStep(2);
    if (!day && days?.length) setDay(days[0].date);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (step === 2 && !day && days?.length) setDay(days[0].date);
  }, [step, day, days]);

  const selectedDay = useMemo(() => days?.find((d) => d.date === day) ?? null, [days, day]);

  const pickHour = (h: number) => {
    setHour(h);
    setError("");
    schedule();
  };

  const confirm = async () => {
    if (!day || hour === null || status !== "idle") return;
    setStatus("sending");
    setError("");
    const eventId = `schedule-${leadId}`;
    try {
      const r = await fetch("/api/leads/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload(), date: day, hour, eventId }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setStatus("idle");
        setError(j.error || "Não foi possível confirmar. Tente de novo.");
        if (r.status === 409) {
          const fresh = await loadDays();
          if (!fresh.some((d) => d.date === day)) setDay(fresh[0]?.date ?? "");
          setHour(null);
        }
        return;
      }
      trackSchedule(eventId);
      ls(LS_ID, null);
      ls(LS_FORM, null);
      setStatus("done");
      setRedirectUrl(j.whatsapp);
      setTimeout(() => {
        window.location.href = j.whatsapp;
      }, 1100);
    } catch {
      setStatus("idle");
      setError("Sem conexão. Verifique sua internet e tente de novo.");
    }
  };

  // ---------------------------------------------------------------- UI
  const inputCls =
    "peer w-full border-0 border-b-2 bg-transparent px-0 pb-3 pt-6 text-xl font-semibold text-white outline-none transition-colors placeholder:text-transparent focus:border-orange";

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, ok: boolean, msg: string) => (
    <label className="relative block">
      <input
        {...props}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        onBlur={() => {
          setTouched((t) => ({ ...t, [k]: true }));
          flushDraft();
        }}
        placeholder={label}
        className={`${inputCls} ${touched[k] && !ok ? "border-red-500" : "border-white/15"}`}
        aria-invalid={touched[k] && !ok}
      />
      <span className="pointer-events-none absolute left-0 top-6 font-display text-xl font-bold uppercase italic tracking-wide text-muted transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:tracking-[0.2em] peer-focus:text-orange peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:tracking-[0.2em]">
        {label}
      </span>
      {touched[k] && !ok && <span className="mt-2 block text-sm text-red-400">{msg}</span>}
    </label>
  );

  return (
    <div className="min-h-[100svh] bg-ink lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Fotos da estrutura */}
      <aside className="grain relative h-[38svh] min-h-[260px] overflow-hidden lg:sticky lg:top-0 lg:h-[100svh]">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.1 }, scale: { duration: 6, ease: "easeOut" } }}
          >
            <Image src={SLIDES[slide].src} alt={SLIDES[slide].alt} fill priority={slide === 0} sizes="(min-width:1024px) 52vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/60 lg:bg-gradient-to-r lg:from-ink/20 lg:via-ink/50 lg:to-ink" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
          <Link href={withAttribution("/captura")} className="relative block h-12 w-[112px]" aria-label="Voltar para a página do CT">
            <Image src={IMG.logo} alt="CT Forma Fit" fill sizes="112px" className="object-contain object-left" />
          </Link>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <span key={i} className={`h-1 transition-all duration-500 ${i === slide ? "w-7 bg-orange" : "w-3 bg-white/40"}`} />
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 hidden p-10 lg:block">
          <p className="eyebrow text-orange">Visita guiada</p>
          <p className="display mt-3 text-7xl text-white">
            Venha ver
            <br />
            <span className="text-orange">de perto.</span>
          </p>
          <ul className="mt-6 space-y-2 text-lg text-bone/85">
            {["Tour completo pela estrutura", "Conheça a bioimpedância e o botão de chamada", "Tire todas as dúvidas com a equipe"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <Icon.check className="h-5 w-5 text-orange" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Formulário */}
      <main className="relative -mt-10 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] bg-ink px-4 pb-16 pt-14 sm:px-8 lg:mt-0 lg:flex lg:min-h-[100svh] lg:items-center lg:px-14 lg:[clip-path:none]">
        <div className="mx-auto w-full max-w-lg">
          <div className="flex items-center gap-3">
            {[1, 2].map((n) => (
              <div key={n} className="flex flex-1 items-center gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center font-display text-lg font-black italic transition-colors [clip-path:polygon(10%_0,100%_6%,90%_100%,0_94%)] ${
                    step >= n ? "bg-orange text-ink" : "bg-white/10 text-muted"
                  }`}
                >
                  {step > n ? <Icon.check className="h-4 w-4" /> : n}
                </span>
                <span className={`font-display text-sm font-bold uppercase tracking-[0.18em] ${step >= n ? "text-white" : "text-muted"}`}>
                  {n === 1 ? "Seus dados" : "Dia e horário"}
                </span>
                {n === 1 && <span className="h-[2px] flex-1 bg-white/10"><span className={`block h-full bg-orange transition-all duration-700 ${step > 1 ? "w-full" : "w-0"}`} /></span>}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.5, ease }}
              >
                <h1 className="display mt-10 text-[3.2rem] text-white sm:text-6xl">
                  Agende sua <span className="text-orange">visita</span>
                </h1>
                <p className="mt-3 text-lg text-muted">Leva menos de 1 minuto. Primeiro, conta pra gente quem é você.</p>

                <form
                  className="mt-8 space-y-7"
                  onSubmit={(e) => {
                    e.preventDefault();
                    next();
                  }}
                  noValidate
                >
                  {field("name", "Seu nome", { type: "text", autoComplete: "name", autoCapitalize: "words", maxLength: 120, required: true }, nameOk, "Digite seu nome.")}
                  {field(
                    "phone",
                    "Seu WhatsApp",
                    { type: "tel", inputMode: "tel", autoComplete: "tel-national", maxLength: 16, required: true },
                    phoneOk,
                    "Digite um WhatsApp válido com DDD.",
                  )}
                  {field("email", "Seu e-mail", { type: "email", inputMode: "email", autoComplete: "email", maxLength: 200 }, emailOk, "E-mail inválido.")}

                  <button type="submit" className="btn btn-primary w-full !min-h-16 !text-xl">
                    <span>Escolher dia e horário</span>
                    <svg className="btn-arrow h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M4 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.6" />
                    </svg>
                  </button>
                  <p className="text-center text-xs text-muted">
                    Seus dados são usados só para confirmar sua visita. Veja a{" "}
                    <Link href="/privacidade" className="underline hover:text-white">
                      política de privacidade
                    </Link>
                    .
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.5, ease }}
              >
                <button type="button" onClick={() => setStep(1)} className="mt-8 flex items-center gap-2 text-sm font-semibold text-muted hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                    <path d="M20 12H6M11 6l-6 6 6 6" />
                  </svg>
                  Voltar e editar meus dados
                </button>
                <h1 className="display mt-4 text-[3rem] text-white sm:text-[3.6rem]">
                  {form.name.trim().split(/\s+/)[0] ? (
                    <>
                      Bora, <span className="text-orange">{form.name.trim().split(/\s+/)[0]}!</span>
                    </>
                  ) : (
                    <>Escolha o <span className="text-orange">dia</span></>
                  )}
                </h1>
                <p className="mt-2 text-lg text-muted">Escolha o dia e o horário que ficam melhor para você vir conhecer o CT.</p>

                <h2 className="eyebrow mt-8 text-orange">Dia</h2>
                {days === null ? (
                  <div className="mt-3 flex gap-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-20 w-36 animate-pulse bg-white/5" />
                    ))}
                  </div>
                ) : days.length === 0 ? (
                  <p className="mt-3 text-muted">No momento não há horários disponíveis. Tente novamente mais tarde.</p>
                ) : (
                  <div className="no-scrollbar -mx-4 mt-3 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="radiogroup" aria-label="Dia da visita">
                    {days.map((d) => {
                      const active = d.date === day;
                      return (
                        <button
                          key={d.date}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => {
                            setDay(d.date);
                            setHour(null);
                          }}
                          className={`relative shrink-0 snap-start px-4 py-3 text-left transition-all duration-300 [clip-path:polygon(4%_0,100%_3%,96%_100%,0_97%)] ${
                            active ? "bg-orange text-ink" : "bg-white/[0.06] text-white hover:bg-white/10"
                          }`}
                        >
                          <span className="block font-display text-lg font-extrabold uppercase italic leading-tight">{d.label.split(" (")[0]}</span>
                          <span className={`block text-sm font-semibold ${active ? "text-ink/75" : "text-muted"}`}>
                            ({d.dayMonth}){d.relative ? ` · ${d.relative}` : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedDay && (
                  <>
                    <h2 className="eyebrow mt-8 text-orange">Horário</h2>
                    <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Horário da visita">
                      {selectedDay.hours.map((h, i) => {
                        const active = h === hour;
                        return (
                          <motion.button
                            key={`${selectedDay.date}-${h}`}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => pickHour(h)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={`py-3.5 font-display text-lg font-extrabold italic transition-colors [clip-path:polygon(6%_0,100%_4%,94%_100%,0_96%)] ${
                              active ? "bg-orange text-ink" : "bg-white/[0.06] text-white hover:bg-white/10"
                            }`}
                          >
                            {hourLabel(h)}
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="mt-8 border border-line bg-white/[0.03] p-5">
                  <p className="text-sm text-muted">Sua visita</p>
                  <p className="mt-1 font-display text-2xl font-extrabold uppercase italic text-white">
                    {selectedDay && hour !== null ? (
                      <>
                        {selectedDay.label} <span className="text-orange">às {hourLabel(hour)}</span>
                      </>
                    ) : (
                      <span className="text-muted">Escolha um dia e um horário</span>
                    )}
                  </p>
                </div>

                {error && (
                  <p className="mt-4 border-l-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={confirm}
                  disabled={!selectedDay || hour === null || status !== "idle"}
                  className="btn btn-primary mt-6 w-full !min-h-16 !text-xl disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>{status === "sending" ? "Confirmando..." : "Confirmar agendamento"}</span>
                  {status === "idle" && <Icon.whatsapp className="h-6 w-6" />}
                </button>
                <p className="mt-3 text-center text-sm text-muted">Ao confirmar, você será levado ao nosso WhatsApp.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Sucesso */}
      <AnimatePresence>
        {status === "done" && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-orange p-6 text-ink"
            initial={{ clipPath: "circle(0% at 50% 100%)" }}
            animate={{ clipPath: "circle(150% at 50% 100%)" }}
            transition={{ duration: 0.8, ease }}
            role="status"
          >
            <div className="text-center">
              <motion.div
                className="mx-auto grid h-24 w-24 place-items-center bg-ink text-orange [clip-path:polygon(10%_0,100%_6%,90%_100%,0_94%)]"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 14 }}
              >
                <Icon.check className="h-12 w-12" />
              </motion.div>
              <p className="display mt-8 text-6xl">Visita agendada!</p>
              <p className="mt-3 text-lg font-semibold">
                {selectedDay?.label} às {hour !== null && hourLabel(hour)}
              </p>
              <p className="mt-6 text-ink/75">Abrindo o WhatsApp para você confirmar com a equipe...</p>
              {redirectUrl && (
                <a href={redirectUrl} className="btn btn-dark mt-6">
                  <span>Abrir o WhatsApp</span>
                  <Icon.whatsapp className="h-6 w-6" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
