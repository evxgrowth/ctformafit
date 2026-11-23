"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CtaButton } from "../CtaButton";
import { IMG } from "./content";
import { Icon } from "./icons";

const ease = [0.16, 1, 0.3, 1] as const;

/** Topo da Black 26: vídeo de fundo (sem som, em loop), pensado primeiro para celular. */
export function BlackHero() {
  const reduce = useReducedMotion();
  const up = (d: number) => ({
    initial: reduce ? false : { opacity: 0, y: 36 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: d, ease },
  });

  return (
    <section id="topo" className="grain relative flex min-h-[100svh] items-end overflow-hidden bg-ink">
      {/* Imagem de capa: aparece enquanto o vídeo carrega e para quem prefere menos movimento */}
      <Image src={IMG.noite} alt="" fill priority sizes="100vw" className="object-cover object-[60%_center]" />
      {!reduce && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={IMG.noite}
          aria-hidden
        >
          <source src="/black26/fundo.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-28 sm:px-6 sm:pb-24">
        <motion.p
          {...up(0.05)}
          className="inline-flex items-center gap-2 bg-orange px-3 py-1.5 font-display text-sm font-extrabold uppercase italic tracking-[0.18em] text-ink"
        >
          <Icon.bolt className="h-4 w-4" /> Black Friday 26
        </motion.p>

        <motion.h1 {...up(0.15)} className="display mt-5 text-[clamp(3rem,13vw,8.5rem)] text-white">
          Aula grátis +
          <br />
          <span className="text-orange">voucher Black</span>
        </motion.h1>

        <motion.p {...up(0.3)} className="mt-5 max-w-xl text-lg leading-relaxed text-bone/90 sm:text-xl">
          Agende sua aula experimental no CT Forma Fit e receba o voucher da Black no seu WhatsApp. Depois da aula, mostre na recepção e garanta o{" "}
          <b className="text-white">Plano Anual Musculação + Hyrox por R$&nbsp;139,90/mês</b>.
        </motion.p>

        <motion.div {...up(0.45)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CtaButton slot="hero-1" className="w-full sm:w-auto" />
          <CtaButton slot="hero-2" variant="ghost" className="w-full sm:w-auto" />
        </motion.div>

        <motion.ul {...up(0.6)} className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-bone/85">
          <li className="flex items-center gap-2">
            <Icon.shield className="h-5 w-5 text-orange" /> Estacionamento com segurança
          </li>
          <li className="flex items-center gap-2">
            <Icon.bolt className="h-5 w-5 text-orange" /> Seg. a sex. até meia-noite
          </li>
          <li className="flex items-center gap-2">
            <Icon.road className="h-5 w-5 text-orange" /> Às margens da BR-406
          </li>
        </motion.ul>
      </div>
    </section>
  );
}
