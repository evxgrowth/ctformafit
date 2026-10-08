"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSite } from "./SiteProvider";
import { whatsappUrl } from "@/lib/whatsapp";
import { trackWhatsappClick } from "@/lib/client-track";
import { Icon } from "./landing/icons";

type Open = (source: string) => void;
const Ctx = createContext<Open | null>(null);

/** Abre a janela "Não sou aluno / Já sou aluno". Retorna null fora da página inicial. */
export function useContactChooser() {
  return useContext(Ctx);
}

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Janela de escolha + botão flutuante do WhatsApp.
 * Usado só na página inicial: a /captura não tem esse provider.
 */
export function ContactChooser({ children }: { children: React.ReactNode }) {
  const { whatsapp } = useSite();
  const [source, setSource] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const open = useCallback<Open>((src) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setSource(src);
  }, []);
  const close = useCallback(() => {
    setSource(null);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!source) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [source, close]);

  const options = [
    {
      key: "nao-aluno",
      title: "Não sou aluno",
      text: "Quero conhecer o CT e agendar uma aula experimental",
      href: whatsappUrl(whatsapp.number, whatsapp.messages.experimental),
      icon: <Icon.dumbbell className="h-7 w-7" />,
      primary: true,
    },
    {
      key: "aluno",
      title: "Já sou aluno",
      text: "Quero falar com a recepção",
      href: whatsappUrl(whatsapp.number, whatsapp.messages.aluno),
      icon: <Icon.users className="h-7 w-7" />,
      primary: false,
    },
  ];

  return (
    <Ctx.Provider value={open}>
      {children}

      <FloatingWhatsapp onClick={() => open("flutuante")} hidden={Boolean(source)} />

      <AnimatePresence>
        {source && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button type="button" aria-label="Fechar" tabIndex={-1} onClick={close} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="chooser-title"
              className="relative w-full max-w-lg border-t-2 border-orange bg-coal px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:border-2 sm:border-white/10 sm:border-t-orange sm:p-8"
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.45, ease }}
            >
              <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow text-orange">Fale com o CT</p>
                    <h2 id="chooser-title" className="display mt-2 text-[2.6rem] text-white sm:text-5xl">
                      Como podemos <span className="text-orange">te ajudar?</span>
                    </h2>
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    aria-label="Fechar"
                    className="grid h-10 w-10 shrink-0 place-items-center bg-white/5 text-white transition hover:bg-orange hover:text-ink [clip-path:polygon(8%_0,100%_4%,92%_100%,0_96%)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                      <path d="M5 5l14 14M19 5 5 19" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 grid gap-3">
                  {options.map((o, i) => (
                    <motion.a
                      key={o.key}
                      href={o.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackWhatsappClick(`${source} · ${o.title}`);
                        setTimeout(close, 150);
                      }}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.07, duration: 0.4, ease }}
                      className={`group relative flex items-center gap-4 p-4 transition-colors duration-300 sm:p-5 ${
                        i ? "cut-tl" : "cut-card"
                      } ${o.primary ? "bg-orange text-ink hover:bg-white" : "bg-white/[0.06] text-white hover:bg-white hover:text-ink"}`}
                    >
                      <span
                        className={`grid h-14 w-14 shrink-0 place-items-center [clip-path:polygon(10%_0,100%_6%,90%_100%,0_94%)] ${
                          o.primary ? "bg-ink text-orange" : "bg-orange text-ink"
                        }`}
                      >
                        {o.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="display block text-[1.9rem] leading-none">{o.title}</span>
                        <span className={`mt-1 block text-sm ${o.primary ? "text-ink/75" : "text-white/65 group-hover:text-ink/70"}`}>{o.text}</span>
                      </span>
                      <Icon.whatsapp className="h-7 w-7 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    </motion.a>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-muted">Você será levado ao WhatsApp do CT Forma Fit.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

/** Botão flutuante do WhatsApp, estilo neon. */
function FloatingWhatsapp({ onClick, hidden }: { onClick: () => void; hidden: boolean }) {
  const [show, setShow] = useState(false);
  // No celular, sobe quando a barra fixa de CTA aparece (mesma regra do Header).
  const [lifted, setLifted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1200);
    const on = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.body.scrollHeight - 420;
      setLifted(window.scrollY > window.innerHeight * 0.75 && !nearEnd);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", on);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && !hidden && (
        <motion.div
          className={`group fixed right-4 z-[45] transition-[bottom] duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:bottom-7 sm:right-7 ${
            lifted ? "bottom-[calc(6.5rem+env(safe-area-inset-bottom))]" : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))]"
          }`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <span className="pointer-events-none absolute right-[calc(100%+14px)] top-1/2 hidden -translate-y-1/2 translate-x-2 whitespace-nowrap border border-[#25D366]/40 bg-black/85 px-3 py-1.5 font-display text-sm font-bold uppercase tracking-wider text-[#5dff9c] opacity-0 shadow-[0_0_18px_rgba(37,211,102,.35)] backdrop-blur transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
            Fale com a gente
          </span>
          <button
            type="button"
            onClick={onClick}
            aria-label="Falar com o CT pelo WhatsApp"
            className="relative grid h-16 w-16 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5dff9c]"
          >
            {/* ondas de sinal */}
            <span className="absolute inset-0 animate-[pulse-ring_2.4s_cubic-bezier(.2,.6,.3,1)_infinite] rounded-full border-2 border-[#25D366]" />
            <span className="absolute inset-0 animate-[pulse-ring_2.4s_cubic-bezier(.2,.6,.3,1)_1.2s_infinite] rounded-full border border-[#25D366]/70" />
            {/* anel neon girando */}
            <span className="absolute inset-0 animate-[spin_3.5s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#25D366,transparent_35%,#5dff9c_55%,transparent_80%,#25D366)] shadow-[0_0_22px_rgba(37,211,102,.75),0_0_48px_rgba(37,211,102,.35)]" />
            {/* núcleo */}
            <span className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_30%_25%,#0f3d22,#03140a_70%)] shadow-[inset_0_0_14px_rgba(37,211,102,.45)] transition-colors duration-300 group-hover:bg-[radial-gradient(circle_at_30%_25%,#25D366,#0b7a3b_75%)]" />
            <Icon.whatsapp className="relative h-8 w-8 text-[#5dff9c] drop-shadow-[0_0_8px_rgba(93,255,156,.9)] transition-colors duration-300 group-hover:text-white" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
