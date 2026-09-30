import { CtaButton } from "../CtaButton";
import { PAINS, PILLARS, TICKER_A, TICKER_B } from "./content";
import { Marquee, MaskLines, Reveal, Strike } from "./motion";

export function Ticker() {
  return (
    <div className="relative z-20 -mt-8 overflow-hidden pb-2 pt-6" aria-hidden>
      <div className="relative rotate-[2deg] scale-[1.08] border-y border-white/10 bg-coal py-2.5">
        <Marquee items={TICKER_B} reverse itemClassName="display text-[1.35rem] text-outline sm:text-3xl" speed={42} separator="/" />
      </div>
      <div className="relative z-10 -mt-3 -rotate-[2.5deg] sm:-mt-5 scale-[1.08] bg-orange py-3 text-ink shadow-[0_20px_60px_-10px_rgba(255,106,19,.45)]">
        <Marquee items={TICKER_A} itemClassName="display text-[1.7rem] sm:text-4xl" speed={34} />
      </div>
    </div>
  );
}

export function Manifesto() {
  return (
    <section id="manifesto" className="relative overflow-hidden bg-ink pb-24 pt-20 sm:pb-32 sm:pt-28">
      <div className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow text-orange">O problema das academias comuns</p>
          </Reveal>
          <h2 className="display mt-4 text-[clamp(3rem,9vw,6.2rem)] text-white">
            <MaskLines lines={["Chega de", "treinar no", <span key="i" className="text-orange">improviso.</span>]} />
          </h2>
        </div>
        <ul className="flex flex-col justify-end gap-1">
          {PAINS.map((p, i) => (
            <Reveal as="li" key={p} delay={i * 0.06} className="border-b border-line py-4">
              <span className="flex items-baseline gap-4">
                <span className="font-display text-sm font-bold text-orange/80">0{i + 1}</span>
                <span className="font-display text-[1.65rem] font-bold uppercase italic leading-tight text-bone sm:text-3xl">
                  <Strike delay={0.2 + i * 0.1}>{p}</Strike>
                </span>
              </span>
            </Reveal>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto mt-20 max-w-7xl px-4 sm:mt-28 sm:px-6">
        <Reveal>
          <p className="max-w-3xl text-[1.6rem] font-semibold leading-snug text-white sm:text-4xl sm:leading-tight">
            No <span className="text-orange">CT Forma Fit</span> cada detalhe foi pensado para você chegar, treinar pesado e sair com a sensação de dever
            cumprido.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08}>
              <article className="cut-card group relative h-full overflow-hidden bg-panel p-7 transition-colors duration-500 hover:bg-orange">
                <span className="display pointer-events-none absolute -right-2 -top-4 text-[7.5rem] text-white/[0.04] transition-colors duration-500 group-hover:text-black/10">
                  {p.n}
                </span>
                <span className="font-display text-sm font-bold text-orange transition-colors group-hover:text-ink">{p.n}</span>
                <h3 className="display mt-10 text-[2.3rem] text-white transition-colors group-hover:text-ink">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-muted transition-colors group-hover:text-ink/80">{p.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <CtaButton intent="conhecer" label="Quero conhecer o CT" where="pilares" />
        </Reveal>
      </div>
    </section>
  );
}
