"use client";

import Image from "next/image";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { CtaButton } from "../CtaButton";
import { IMG } from "./content";
import { useMode } from "../SiteProvider";

const NAV = [
  { href: "#estrutura", label: "Estrutura" },
  { href: "#tecnologia", label: "Tecnologia" },
  { href: "#conforto", label: "Conforto" },
  { href: "#localizacao", label: "Localização" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#duvidas", label: "Dúvidas" },
];

export function Header() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const mode = useMode();

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 40);
      const nearEnd = window.innerHeight + window.scrollY > document.body.scrollHeight - 420;
      setShowBar(window.scrollY > window.innerHeight * 0.75 && !nearEnd);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-orange" style={{ scaleX: progress }} />
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-ink/80 py-2 backdrop-blur-xl [box-shadow:0_1px_0_rgb(255_255_255/0.06)]" : "py-4"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#topo" className="relative block h-11 w-[104px] shrink-0 sm:h-12 sm:w-[118px]" aria-label="CT Forma Fit — início">
            <Image src={IMG.logo} alt="CT Forma Fit" fill sizes="120px" className="object-contain object-left" priority />
          </a>

          {mode === "site" && (
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="group relative font-display text-[0.95rem] font-bold uppercase tracking-[0.12em] text-bone/75 transition hover:text-white"
              >
                {n.label}
                <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-right scale-x-0 bg-orange transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
              </a>
            ))}
          </nav>
          )}

          <div className="flex items-center gap-3">
            <div className={mode === "site" ? "hidden sm:block" : "block"}>
              <CtaButton
                intent="experimental"
                label="Aula experimental"
                capturaLabel="Agendar visita"
                where="header"
                className="!min-h-11 !px-5 !py-2 !text-base"
              />
            </div>
            {mode === "site" && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center bg-white/5 [clip-path:polygon(8%_0,100%_4%,92%_100%,0_96%)] lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={open}
            >
              <span className="flex w-5 flex-col gap-[5px]">
                <span className="h-[2px] w-full bg-white" />
                <span className="h-[2px] w-3/4 self-end bg-orange" />
                <span className="h-[2px] w-full bg-white" />
              </span>
            </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && mode === "site" && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-ink"
            initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            exit={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
          >
            <div className="grid-lines absolute inset-0 opacity-60" />
            <div className="relative flex items-center justify-between px-4 py-4">
              <div className="relative h-11 w-[104px]">
                <Image src={IMG.logo} alt="CT Forma Fit" fill sizes="110px" className="object-contain object-left" />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 place-items-center bg-orange text-ink [clip-path:polygon(8%_0,100%_4%,92%_100%,0_96%)]"
                aria-label="Fechar menu"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                  <path d="M5 5l14 14M19 5 5 19" />
                </svg>
              </button>
            </div>
            <nav className="relative flex flex-1 flex-col justify-center gap-1 px-6" aria-label="Menu">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="display flex items-baseline gap-4 py-1.5 text-[3.1rem] text-white"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.5 }}
                >
                  <span className="font-display text-sm not-italic text-orange">0{i + 1}</span>
                  {n.label}
                </motion.a>
              ))}
            </nav>
            <div className="relative p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]" onClick={() => setOpen(false)}>
              <CtaButton intent="experimental" label="Agendar aula experimental" where="menu" className="w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra fixa de conversão no celular */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/85 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:hidden"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <CtaButton
              intent="experimental"
              label={mode === "captura" ? "Agendar minha visita" : "Agendar aula experimental"}
              where="barra-fixa"
              className="w-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
