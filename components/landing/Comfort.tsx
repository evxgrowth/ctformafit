import { CtaButton } from "../CtaButton";
import { COMFORT, IMG } from "./content";
import { Icon } from "./icons";
import { MaskLines, ParallaxImage, Reveal } from "./motion";

export function Comfort() {
  return (
    <section id="conforto" className="slant-both relative z-10 bg-bone py-[calc(4vw+5rem)] text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow text-orange-deep">Conforto</p>
            </Reveal>
            <h2 className="display mt-3 text-[clamp(2.9rem,8vw,6rem)]">
              <MaskLines lines={["Antes e depois", "do treino, você", <span key="c" className="text-orange-deep">está em casa.</span>]} />
            </h2>
          </div>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-ink/70">
              Treino bom também é sobre como você se sente no lugar. Por isso o CT tem espaço de convivência, café e tudo o que faz a rotina ficar leve.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {COMFORT.map((c, i) => {
            const I = Icon[c.icon];
            return (
              <Reveal key={c.title} delay={(i % 3) * 0.07} className="bg-bone">
                <div className="group flex h-full items-start gap-5 p-7 transition-colors duration-500 hover:bg-ink hover:text-white">
                  <span className="grid h-14 w-14 shrink-0 place-items-center bg-orange text-ink [clip-path:polygon(10%_0,100%_6%,90%_100%,0_94%)] transition-transform duration-500 group-hover:-rotate-6">
                    <I className="h-7 w-7" />
                  </span>
                  <div>
                    <h3 className="display text-[1.9rem]">{c.title}</h3>
                    <p className="mt-1 text-ink/65 transition-colors group-hover:text-white/70">{c.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Atendimento */}
      <div className="mx-auto mt-24 grid max-w-7xl gap-10 px-4 sm:mt-32 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <ParallaxImage
          src={IMG.supino}
          alt="Aluno treinando supino com acompanhamento no CT Forma Fit"
          className="cut-card aspect-[4/5] w-full"
          sizes="(min-width:1024px) 45vw, 100vw"
        />
        <div>
          <Reveal>
            <p className="eyebrow text-orange-deep">Atendimento</p>
          </Reveal>
          <h2 className="display mt-3 text-[clamp(2.7rem,7vw,5.2rem)]">
            <MaskLines lines={["Atendimento", "impecável não é", <span key="p" className="text-orange-deep">promessa. É padrão.</span>]} />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-ink/70">
              Do primeiro “oi” na recepção até a última série, você é acompanhado por uma equipe que gosta do que faz e quer ver você evoluir.
            </p>
          </Reveal>
          <ul className="mt-8 space-y-3">
            {[
              "Recepção que acolhe desde a primeira visita",
              "Professores presentes no salão, atentos à sua execução",
              "Botão de chamada para pedir ajuda sem sair do aparelho",
              "Evolução acompanhada com avaliação de bioimpedância",
            ].map((t, i) => (
              <Reveal as="li" key={t} delay={0.1 + i * 0.06} className="flex items-start gap-3 text-lg font-semibold">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center bg-ink text-orange">
                  <Icon.check className="h-4 w-4" />
                </span>
                {t}
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.3} className="mt-10">
            <CtaButton intent="contato" label="Falar com a equipe" capturaLabel="Agendar uma visita" variant="dark" where="atendimento" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
