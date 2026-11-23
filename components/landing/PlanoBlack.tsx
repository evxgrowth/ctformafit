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
          <p className="eyebrow text-center text-orange">Seu voucher Black Friday</p>
          <h2 className="display mt-3 text-center text-[clamp(2.7rem,9vw,5.5rem)] text-white">
            Aula grátis. <span className="text-orange">Preço de Black.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="cut-card relative border-2 border-orange bg-ink p-6 shadow-[0_0_80px_-20px_rgb(255_106_19/0.55)] sm:p-12">
            <span className="mb-6 inline-block bg-orange px-4 py-1.5 font-display text-sm font-extrabold uppercase italic tracking-[0.18em] text-ink">
              Voucher exclusivo · {p.code}
            </span>

            <div className="grid gap-8 sm:grid-cols-[1.1fr_1fr] sm:items-center">
              <div>
                <p className="font-display text-2xl font-bold uppercase italic text-muted">{p.name}</p>
                <h3 className="display text-[clamp(2.4rem,9vw,4rem)] leading-[0.95] text-white">{p.sub}</h3>

                <div className="mt-6">
                  {p.price ? (
                    <>
                      {p.from && <p className="text-lg text-muted line-through">de {p.from}</p>}
                      <p className="display text-[clamp(3.2rem,14vw,5.5rem)] leading-none text-orange">
                        {p.price}
                        <span className="ml-1 text-[0.4em] text-white">{p.perMonth}</span>
                      </p>
                      {p.installments && <p className="mt-2 text-lg font-semibold text-bone">{p.installments} · liberado depois da aula</p>}
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

            <ol className="mt-10 grid gap-3 border-t border-line pt-8 sm:grid-cols-3">
              {p.how.map((h, i) => (
                <li key={h} className="flex items-start gap-3">
                  <span className="display text-4xl leading-none text-orange">{i + 1}</span>
                  <span className="pt-1 font-semibold leading-snug text-bone">{h}</span>
                </li>
              ))}
            </ol>

            <div className="mt-10">
              <CtaButton slot="plano" className="w-full !min-h-16 !text-lg sm:!text-xl" />
              <p className="mt-4 text-center font-display text-base font-bold uppercase italic tracking-wider text-orange">{p.period}</p>
              <p className="mt-2 text-center text-sm text-muted">Sem compromisso: você só fecha o plano se gostar da aula. Leva menos de 1 minuto para agendar.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
