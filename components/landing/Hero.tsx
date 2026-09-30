"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { CtaButton } from "../CtaButton";
import { useMode } from "../SiteProvider";
import { IMG } from "./content";
import { Icon } from "./icons";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mode = useMode();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "22%"]);
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const up = (d: number) => ({
    initial: reduce ? false : { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay: d, ease },
  });

  return (
    <section id="topo" ref={ref} className="grain relative flex min-h-[100svh] items-end overflow-hidden bg-ink">
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <div className="absolute inset-0 animate-[kenburns_14s_ease-out_forwards]">
          <Image
            src={IMG.noite}
            alt="Salão do CT Forma Fit à noite, com iluminação em LED e alunos treinando"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[60%_center]"
          />
        </div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent" />

      {/* Faixa laranja diagonal */}
      <motion.div
        aria-hidden
        className="absolute -right-24 top-[18%] hidden h-[140%] w-40 rotate-[18deg] bg-orange/90 mix-blend-multiply md:block"
        initial={reduce ? false : { y: "-120%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.4, delay: 0.2, ease }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-4 top-[10%] hidden h-[140%] w-3 rotate-[18deg] bg-orange md:block"
        initial={reduce ? false : { y: "120%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.4, delay: 0.35, ease }}
      />

      <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-24">
        <motion.h1 {...up(0.1)} className="eyebrow mb-5 flex max-w-[34rem] items-center gap-3 text-orange">
          <span className="h-[2px] w-8 shrink-0 bg-orange" />
          Academia de musculação em São Gonçalo do Amarante · Jardins
        </motion.h1>

        <p className="display text-[clamp(3.6rem,15.5vw,10.5rem)] text-white">
          <span className="block overflow-hidden pb-[0.04em]">
            <motion.span
              className="block"
              initial={reduce ? false : { y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.2, ease }}
            >
              Aqui você
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.04em]">
            <motion.span
              className="block"
              initial={reduce ? false : { y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.3, ease }}
            >
              não <span className="text-outline">malha.</span>
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="block text-orange"
              initial={reduce ? false : { y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.42, ease }}
            >
              Você treina.
            </motion.span>
          </span>
        </p>

        <motion.p {...up(0.65)} className="mt-6 max-w-xl text-lg leading-relaxed text-bone/85 sm:text-xl">
          {mode === "captura"
            ? "Venha conhecer por dentro o CT gigante do Natal Moda Shopping: equipamentos novíssimos, cardio de sobra, tecnologia de ponta e um atendimento que faz você querer voltar todo dia."
            : "Um CT gigante dentro do Natal Moda Shopping, com equipamentos novíssimos, cardio de sobra, tecnologia de ponta e um atendimento que faz você querer voltar todo dia."}
        </motion.p>

        <motion.div {...up(0.8)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CtaButton intent="experimental" label="Agendar aula experimental" capturaLabel="Agendar minha visita" where="hero" />
          <CtaButton intent="matricula" label="Quero me matricular" capturaLabel="Quero conhecer o CT" variant="ghost" where="hero" />
        </motion.div>

        <motion.ul {...up(0.95)} className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-bone/80">
          <li className="flex items-center gap-2">
            <span className="flex text-orange">
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon.star key={i} className="h-4 w-4" />
              ))}
            </span>
            Avaliações reais no Google
          </li>
          <li className="flex items-center gap-2">
            <Icon.bolt className="h-5 w-5 text-orange" /> Seg. a sex. até meia-noite
          </li>
          <li className="flex items-center gap-2">
            <Icon.shield className="h-5 w-5 text-orange" /> Estacionamento com segurança
          </li>
          <li className="flex items-center gap-2">
            <Icon.road className="h-5 w-5 text-orange" /> Às margens da BR-406
          </li>
        </motion.ul>
      </motion.div>

      <motion.a
        href="#manifesto"
        aria-label="Rolar para baixo"
        className="absolute bottom-6 right-6 z-10 hidden h-16 w-16 place-items-center rounded-full border border-white/25 text-white sm:grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <span className="animate-[float-y_2s_ease-in-out_infinite]">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M12 4v16M6 14l6 6 6-6" />
          </svg>
        </span>
      </motion.a>
    </section>
  );
}
