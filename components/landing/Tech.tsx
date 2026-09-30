"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { CtaButton } from "../CtaButton";
import { IMG } from "./content";
import { Icon } from "./icons";
import { MaskLines, Reveal } from "./motion";

function Spot({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`group relative h-full overflow-hidden bg-panel ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(420px_circle_at_var(--mx)_var(--my),rgba(255,106,19,.18),transparent_60%)]" />
      {children}
    </div>
  );
}

export function Tech() {
  return (
    <section id="tecnologia" className="relative bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow text-orange">Tecnologia</p>
            </Reveal>
            <h2 className="display mt-3 text-[clamp(2.9rem,8vw,6rem)] text-white">
              <MaskLines lines={["Tecnologia que", "trabalha pelo", <span key="r" className="text-orange">seu resultado.</span>]} />
            </h2>
          </div>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-muted">
              Aqui você não depende de sorte para evoluir. Tem avaliação corporal de última geração, suporte do professor a um toque e tudo o que você
              precisa antes e depois do treino.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid auto-rows-[minmax(0,auto)] gap-4 md:grid-cols-6">
          {/* Botão de chamada */}
          <Reveal className="md:col-span-3 md:row-span-2">
            <Spot className="cut-card flex min-h-[440px] flex-col p-7 sm:p-9">
              <div className="relative mx-auto mb-8 mt-4 grid h-40 w-40 place-items-center">
                <span className="absolute inset-0 animate-[pulse-ring_2.4s_cubic-bezier(.2,.6,.3,1)_infinite] rounded-full border-2 border-orange" />
                <span className="absolute inset-0 animate-[pulse-ring_2.4s_cubic-bezier(.2,.6,.3,1)_1.2s_infinite] rounded-full border-2 border-orange" />
                <span className="relative grid h-24 w-24 place-items-center rounded-full bg-orange text-ink shadow-[0_0_60px_rgba(255,106,19,.6)]">
                  <Icon.bell className="h-11 w-11" />
                </span>
              </div>
              <span className="eyebrow text-orange">Exclusivo</span>
              <h3 className="display mt-2 text-[2.6rem] text-white sm:text-5xl">Botão de chamada do professor</h3>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
                Ficou em dúvida no meio da série? Aperte o botão no aparelho e o professor vem até você. Sem procurar, sem constrangimento e sem treinar
                errado.
              </p>
            </Spot>
          </Reveal>

          {/* Bioimpedância */}
          <Reveal className="md:col-span-3 md:row-span-2" delay={0.08}>
            <Spot className="cut-tl flex min-h-[440px] flex-col p-7 sm:p-9">
              <div className="absolute inset-0 opacity-40">
                <Image src={IMG.ampla} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/80 to-panel/30" />
              </div>
              <div aria-hidden className="relative mb-8 h-40 shrink-0 overflow-hidden border border-orange/30 bg-ink/40">
                <div className="grid-lines absolute inset-0 opacity-70" />
                <div className="absolute inset-x-0 h-1/2 animate-[scan_2.8s_ease-in-out_infinite_alternate] bg-gradient-to-b from-transparent via-orange/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between font-display text-xs font-bold uppercase tracking-widest text-orange">
                  <span>% gordura</span>
                  <span>massa muscular</span>
                  <span>evolução</span>
                </div>
              </div>
              <div className="relative mt-auto">
                <span className="eyebrow text-orange">Última geração</span>
                <h3 className="display mt-2 text-[2.6rem] text-white sm:text-5xl">Bioimpedância ultra moderna</h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
                  Uma das máquinas de avaliação corporal mais modernas do mercado. Em poucos minutos você vê seu percentual de gordura, sua massa muscular e
                  acompanha a evolução com números reais.
                </p>
              </div>
            </Spot>
          </Reveal>

          {[
            { icon: Icon.bolt, title: "Máquina de pré-treino", text: "Seu pré-treino pronto na hora, direto no CT." },
            { icon: Icon.ice, title: "Máquina de gelo", text: "Gelo à disposição para hidratar e recuperar." },
            { icon: Icon.run, title: "Cardio gigantesco", text: "Esteiras, escadas e bikes de sobra, sem fila." },
          ].map((f, i) => (
            <Reveal key={f.title} className="md:col-span-2" delay={0.05 * i}>
              <Spot className={`${i === 1 ? "cut-tl" : "cut-card"} p-7`}>
                <f.icon className="h-10 w-10 text-orange" />
                <h3 className="display mt-6 text-3xl text-white">{f.title}</h3>
                <p className="mt-2 text-muted">{f.text}</p>
              </Spot>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <CtaButton intent="experimental" label="Quero testar na prática" capturaLabel="Quero ver de perto" where="tecnologia" />
        </Reveal>
      </div>
    </section>
  );
}
