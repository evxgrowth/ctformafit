"use client";

import { useState } from "react";
import { useMode } from "../SiteProvider";
import { FAQ as BASE_FAQ } from "./content";

import { Icon } from "./icons";
import { MaskLines, Reveal } from "./motion";

const BLACK_FAQ = [
  {
    q: "Como funciona o voucher da Black?",
    a: "Você agenda sua aula experimental grátis e recebe o voucher no WhatsApp na hora. Depois da aula, é só apresentar o voucher na recepção para garantir o Plano Anual Musculação + Hyrox por R$ 139,90/mês, em até 12x.",
  },
  {
    q: "Preciso pagar a aula experimental?",
    a: "Não. A aula experimental é gratuita e sem compromisso. Você só fecha o plano se gostar.",
  },
  {
    q: "Até quando posso usar o voucher?",
    a: "O voucher vale até 29/11 e as vagas são limitadas. Por isso, as aulas com voucher podem ser agendadas até essa data.",
  },
  {
    q: "O que está incluso no Plano Anual?",
    a: "Musculação e treinos de Hyrox com acompanhamento o ano inteiro, com bioimpedância, cardio gigante e toda a estrutura do CT.",
  },
];

export function Faq() {
  const FAQ = useMode() === "black" ? [...BLACK_FAQ, ...BASE_FAQ] : BASE_FAQ;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="duvidas" className="relative bg-ink py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p className="eyebrow text-orange">Dúvidas frequentes</p>
          </Reveal>
          <h2 className="display mt-3 text-[clamp(2.9rem,8vw,5.6rem)] text-white">
            <MaskLines lines={["Tudo o que", "você precisa", <span key="s" className="text-orange">saber.</span>]} />
          </h2>
        </div>
        <div className="border-t border-line">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className={`font-display text-2xl font-bold uppercase italic leading-tight transition-colors sm:text-[1.7rem] ${isOpen ? "text-orange" : "text-white"}`}>
                      {f.q}
                    </span>
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center transition-all duration-500 [clip-path:polygon(10%_0,100%_6%,90%_100%,0_94%)] ${
                        isOpen ? "rotate-45 bg-orange text-ink" : "bg-white/5 text-white"
                      }`}
                    >
                      <Icon.plus className="h-5 w-5" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-${i}`}
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-7 text-lg leading-relaxed text-muted">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
