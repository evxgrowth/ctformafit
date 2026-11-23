import { CtaButton } from "../CtaButton";
import { BLACK_PLAN } from "@/lib/campaigns";
import { Icon } from "./icons";
import { Reveal } from "./motion";

/** Card de destaque do Plano Anual Musculação + Hyrox (editar valores em lib/campaigns.ts). */
export function PlanoBlack() {
  const p = BLACK_PLAN;
  return (
    <section id="plano" className="relative scroll-mt-16 overflow-hidden bg-coal py-20 sm:py-28">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange/20 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <p className="eyebrow text-center text-orange">Oferta exclusiva Black Friday</p>
          <h2 className="display mt-3 text-center text-[clamp(2.7rem,9vw,5.5rem)] text-white">
            O plano que <span className="text-orange">muda o seu ano.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="cut-card relative border-2 border-orange bg-ink p-6 shadow-[0_0_80px_-20px_rgb(255_106_19/0.55)] sm:p-12">
            <span className="absolute -top-4 left-6 bg-orange px-4 py-1.5 font-display text-sm font-extrabold uppercase italic tracking-[0.18em] text-ink sm:left-12">
              Melhor oferta do ano
            </span>

            <div className="grid gap-8 sm:grid-cols-[1.1fr_1fr] sm:items-center">
              <div>
                <p className="font-display text-2xl font-bold uppercase italic text-muted">{p.name}</p>
                <h3 className="display text-[clamp(2.4rem,9vw,4rem)] leading-[0.95] text-white">{p.sub}</h3>

                <div className="mt-6">
                  {p.price ? (
                    <>
                      {p.from && <p className="text-lg text-muted line-through">de {p.from}</p>}
                      <p className="display text-[clamp(3.6rem,16vw,6rem)] leading-none text-orange">{p.price}</p>
                      {p.installments && <p className="mt-1 text-lg font-semibold text-bone">{p.installments}</p>}
                    </>
                  ) : (
                    <p className="display text-[clamp(2.4rem,10vw,3.8rem)] leading-none text-orange">Condição exclusiva Black</p>
                  )}
                </div>
              </div>

              <ul className="space-y-3">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-bone/90">
                    <Icon.check className="mt-1 h-5 w-5 shrink-0 text-orange" /> {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <CtaButton slot="plano" className="w-full !min-h-16 !text-xl" />
              <p className="mt-4 text-center font-display text-base font-bold uppercase italic tracking-wider text-orange">{p.period}</p>
              <p className="mt-2 text-center text-sm text-muted">Agende sua aula experimental e fale com a equipe em menos de 1 minuto.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
