import { REVIEWS } from "./content";
import { Icon } from "./icons";
import { MaskLines, Reveal } from "./motion";

function Card({ r }: { r: (typeof REVIEWS)[number] }) {
  return (
    <figure className="cut-card mx-2 flex w-[300px] shrink-0 flex-col bg-panel p-6 sm:w-[380px]">
      <div className="flex items-center justify-between">
        <span className="flex text-orange">
          {[0, 1, 2, 3, 4].map((i) => (
            <Icon.star key={i} className="h-4 w-4" />
          ))}
        </span>
        <Icon.google className="h-5 w-5" />
      </div>
      <blockquote className="mt-4 flex-1 text-[1.05rem] leading-relaxed text-bone/90">“{r.text}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center bg-orange font-display text-lg font-black italic text-ink [clip-path:polygon(10%_0,100%_6%,90%_100%,0_94%)]">
          {r.name[0]}
        </span>
        <span>
          <span className="block font-semibold text-white">{r.name}</span>
          <span className="text-sm text-muted">Avaliação no Google</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Reviews() {
  const half = Math.ceil(REVIEWS.length / 2);
  const a = REVIEWS.slice(0, half);
  const b = REVIEWS.slice(half);
  return (
    <section id="depoimentos" className="relative overflow-hidden bg-coal py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="eyebrow text-orange">Depoimentos</p>
        </Reveal>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="display mt-3 text-[clamp(2.9rem,8vw,6rem)] text-white">
            <MaskLines lines={["Quem treina,", <span key="r" className="text-orange">recomenda.</span>]} />
          </h2>
          <Reveal delay={0.1}>
            <p className="flex items-center gap-3 text-muted">
              <Icon.google className="h-6 w-6" /> Avaliações reais de alunos no Google
            </p>
          </Reveal>
        </div>
      </div>

      <div className="marquee-pause mt-14 space-y-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        {[a, b].map((row, idx) => (
          <div key={idx} className="flex overflow-hidden">
            <div
              className={`flex w-max ${idx ? "animate-marquee-rev" : "animate-marquee"}`}
              style={{ ["--marquee-speed" as string]: idx ? "70s" : "60s" }}
            >
              {[...row, ...row].map((r, i) => (
                <div key={i} aria-hidden={i >= row.length}>
                  <Card r={r} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
