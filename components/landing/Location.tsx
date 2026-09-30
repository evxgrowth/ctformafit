import { CtaButton } from "../CtaButton";
import { HOURS, SITE } from "@/lib/site";
import { Icon } from "./icons";
import { MaskLines, Reveal } from "./motion";

const POINTS = [
  { icon: Icon.bag, title: "Dentro do Natal Moda Shopping", text: "Treine e resolva a vida no mesmo lugar." },
  { icon: Icon.road, title: "Às margens da BR-406", text: "Acesso fácil vindo de Natal e de toda a região." },
  { icon: Icon.car, title: "Estacionamento privativo", text: "Vaga perto da porta, sem rodar quarteirão." },
  { icon: Icon.shield, title: "Segurança particular", text: "Chegue e saia tranquilo, de dia ou à noite." },
];

export function Location() {
  return (
    <section id="localizacao" className="relative overflow-hidden bg-ink pb-24 pt-[calc(4vw+6rem)] sm:pb-32">
      <div className="pointer-events-none absolute -left-40 top-40 h-[520px] w-[520px] rounded-full bg-orange/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow text-orange">Localização</p>
            </Reveal>
            <h2 className="display mt-3 text-[clamp(2.9rem,8vw,6rem)] text-white">
              <MaskLines lines={["Chegar é fácil.", <span key="e" className="text-orange">Estacionar,</span>, "mais ainda."]} />
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                O CT Forma Fit fica no <strong className="text-white">bairro Jardins, em São Gonçalo do Amarante</strong>, dentro do Natal Moda Shopping e
                às margens da BR-406. Quem mora no Jardins chega em minutos. Quem vem de Natal ou das cidades vizinhas chega pela BR, sem complicação.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {POINTS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.06}>
                  <div className="flex h-full gap-4 border border-line bg-white/[0.02] p-5">
                    <p.icon className="h-8 w-8 shrink-0 text-orange" />
                    <div>
                      <h3 className="font-display text-xl font-extrabold uppercase italic leading-tight text-white">{p.title}</h3>
                      <p className="mt-1 text-sm text-muted">{p.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15} className="flex flex-col">
            <div className="cut-card relative min-h-[360px] flex-1 overflow-hidden bg-panel">
              <iframe
                title="Mapa: CT Forma Fit no Natal Moda Shopping, Jardins, São Gonçalo do Amarante"
                src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&output=embed`}
                className="absolute inset-0 h-full w-full [filter:grayscale(1)_invert(.92)_contrast(.9)_hue-rotate(180deg)]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <address className="mt-5 flex items-start gap-3 not-italic text-bone/85">
              <Icon.pin className="mt-0.5 h-6 w-6 shrink-0 text-orange" />
              <span>
                {SITE.address.street} — {SITE.address.place}
                <br />
                {SITE.address.district}, {SITE.address.city} - {SITE.address.state}, {SITE.address.zip}
              </span>
            </address>
            <div className="mt-6 grid grid-cols-3 gap-px bg-line">
              {HOURS.map((h) => (
                <div key={h.days} className="bg-ink p-3 sm:p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">{h.days}</p>
                  <p className="mt-1 font-display text-xl font-extrabold italic text-white sm:text-2xl">{h.time}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CtaButton intent="experimental" label="Agendar aula experimental" where="localizacao" />
              <a
                href={SITE.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-3 font-display text-lg font-bold uppercase italic tracking-wide text-bone underline decoration-orange decoration-2 underline-offset-8 transition hover:text-orange"
              >
                Abrir no Google Maps
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
