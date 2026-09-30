"use client";

import { useState } from "react";
import { FAQ } from "./content";
import { Icon } from "./icons";
import { MaskLines, Reveal } from "./motion";

export function Faq() {
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
