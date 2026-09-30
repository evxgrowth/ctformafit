"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GALLERY } from "./content";
import { MaskLines, Reveal } from "./motion";

/** Galeria da estrutura: rolagem horizontal "presa" no desktop, carrossel com swipe no celular. */
export function Gallery() {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 48));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const header = (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Reveal>
          <p className="eyebrow text-orange">A estrutura</p>
        </Reveal>
        <h2 className="display mt-3 text-[clamp(2.9rem,8vw,6rem)] text-white">
          <MaskLines lines={["Estrutura de CT.", <span key="c" className="text-orange">Conforto de casa.</span>]} />
        </h2>
      </div>
      <Reveal delay={0.1}>
        <p className="max-w-sm text-lg text-muted">Um galpão enorme, ventilado e cheio de aparelhos novos. Arraste e veja por dentro.</p>
      </Reveal>
    </div>
  );

  const card = (g: (typeof GALLERY)[number], i: number, desktop: boolean) => (
    <figure
      key={g.src}
      className={`group relative shrink-0 overflow-hidden bg-panel ${
        desktop ? "h-[62vh] w-[42vw] max-w-[640px]" : "h-[62svh] max-h-[520px] w-[82vw] snap-center"
      } ${i % 2 ? "cut-tl" : "cut-card"}`}
    >
      <Image src={g.src} alt={g.alt} fill sizes={desktop ? "42vw" : "82vw"} className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <figcaption className="absolute inset-x-0 bottom-0 p-6">
        <span className="font-display text-sm font-bold text-orange">0{i + 1} / 0{GALLERY.length}</span>
        <h3 className="display mt-1 text-4xl text-white">{g.title}</h3>
        <p className="mt-1 text-bone/80">{g.text}</p>
      </figcaption>
    </figure>
  );

  return (
    <div id="estrutura" className="scroll-mt-0">
      {/* Celular / tablet */}
      <section className="slant-top relative bg-coal pb-20 pt-[calc(4vw+5rem)] lg:hidden">
        {header}
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6">
          {GALLERY.map((g, i) => card(g, i, false))}
        </div>
      </section>

      {/* Desktop */}
      <section ref={wrap} className="slant-top relative hidden bg-coal lg:block" style={{ height: reduce ? "auto" : `calc(100vh + ${distance}px)` }}>
        <div className={`${reduce ? "" : "sticky top-0 h-screen"} flex flex-col justify-center gap-10 overflow-hidden pb-10 pt-24`}>
          {header}
          <motion.div ref={track} style={{ x: reduce ? 0 : x }} className="flex gap-6 pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pr-6">
            {GALLERY.map((g, i) => card(g, i, true))}
          </motion.div>
          <div className="mx-auto h-[2px] w-full max-w-7xl bg-white/10 px-6">
            <motion.div className="h-full bg-orange" style={{ width: bar }} />
          </div>
        </div>
      </section>
    </div>
  );
}
