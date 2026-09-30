import Image from "next/image";
import Link from "next/link";
import { CtaButton } from "../CtaButton";
import type { SiteMode } from "../SiteProvider";
import { HOURS, SITE } from "@/lib/site";
import { FooterPhone } from "./FooterPhone";
import { IMG } from "./content";
import { Icon } from "./icons";
import { MaskLines, ParallaxImage, Reveal } from "./motion";

const STEPS = {
  site: [
    { t: "Chame no WhatsApp", d: "Fale com a nossa equipe, tire suas dúvidas e escolha o melhor horário." },
    { t: "Faça sua aula experimental", d: "Sinta a estrutura, os aparelhos e o atendimento na prática." },
    { t: "Comece a sua evolução", d: "Escolha seu plano, faça sua bioimpedância e treine com acompanhamento." },
  ],
  captura: [
    { t: "Agende sua visita", d: "Escolha o dia e o horário em menos de 1 minuto, direto aqui no site." },
    { t: "Receba a confirmação", d: "Você é levado ao nosso WhatsApp para confirmar tudo com a equipe." },
    { t: "Venha conhecer o CT", d: "A gente te mostra a estrutura inteira e tira todas as suas dúvidas." },
  ],
};

export function Steps({ mode }: { mode: SiteMode }) {
  return (
    <section className="relative overflow-hidden bg-orange py-24 text-ink sm:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background:repeating-linear-gradient(-55deg,#000_0_2px,transparent_2px_22px)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="eyebrow">Como começar</p>
        </Reveal>
        <h2 className="display mt-3 text-[clamp(2.9rem,8vw,6rem)]">
          <MaskLines lines={["3 passos para", "sair do sofá."]} />
        </h2>
        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS[mode].map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.1}>
              <div className={`${i === 1 ? "cut-tl" : "cut-card"} relative h-full bg-ink p-8 text-white`}>
                <span className="display text-[5.5rem] text-orange">0{i + 1}</span>
                <h3 className="display mt-2 text-[2.1rem]">{s.t}</h3>
                <p className="mt-3 text-muted">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-12 flex justify-center">
          <CtaButton intent="experimental" label="Dar o primeiro passo agora" capturaLabel="Agendar minha visita agora" variant="dark" where="passos" />
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <ParallaxImage src={IMG.esteiras} alt="Alunos treinando no cardio do CT Forma Fit" className="absolute inset-0 -z-10 opacity-60" strength={90} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/45 to-ink/90" />
      <div className="mx-auto max-w-7xl px-4 py-28 text-center sm:px-6 sm:py-40">
        <Reveal>
          <p className="eyebrow text-orange">Sua vez</p>
        </Reveal>
        <h2 className="display mx-auto mt-4 max-w-5xl text-[clamp(3.2rem,11vw,8.5rem)] text-white">
          <MaskLines lines={["Sua melhor versão", <span key="v" className="text-orange">começa com</span>, "uma visita."]} />
        </h2>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-bone/80 sm:text-xl">
            Venha conhecer o CT Forma Fit por dentro. A gente te mostra tudo e você decide com calma.
          </p>
        </Reveal>
        <Reveal delay={0.25} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaButton intent="experimental" label="Agendar aula experimental" capturaLabel="Agendar minha visita" where="final" />
          <CtaButton intent="matricula" label="Quero me matricular" capturaLabel="Quero conhecer o CT" variant="ghost" where="final" />
        </Reveal>
      </div>
    </section>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-11 w-11 place-items-center bg-white/5 text-white transition hover:bg-orange hover:text-ink [clip-path:polygon(10%_0,100%_6%,90%_100%,0_94%)]"
    >
      {children}
    </a>
  );
}

export function Footer({ mode }: { mode: SiteMode }) {
  const year = new Date().getFullYear();

  if (mode === "captura") {
    return (
      <footer className="border-t border-line bg-coal pb-28 pt-10 sm:pb-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center text-sm text-muted sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <div className="relative h-14 w-[90px]">
            <Image src={IMG.logo} alt="CT Forma Fit" fill sizes="90px" className="object-contain" />
          </div>
          <p>© {year} CT Forma Fit Jardins</p>
          <Link href="/privacidade" className="hover:text-white">
            Política de privacidade
          </Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative border-t border-line bg-coal pb-28 pt-16 sm:pb-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <div className="relative h-24 w-[150px]">
            <Image src={IMG.logo} alt="CT Forma Fit — Bodybuilder Training Center" fill sizes="150px" className="object-contain object-left" />
          </div>
          <p className="mt-4 max-w-xs text-muted">
            {SITE.tagline}. CT de musculação no bairro Jardins, em São Gonçalo do Amarante/RN. Aqui você não malha. Você treina.
          </p>
          <div className="mt-5 flex gap-2">
            <Social href={SITE.instagram} label="Instagram do CT Forma Fit">
              <Icon.instagram className="h-5 w-5" />
            </Social>
            <Social href={SITE.facebook} label="Facebook do CT Forma Fit">
              <Icon.facebook className="h-5 w-5" />
            </Social>
            <Social href={SITE.googleMaps} label="CT Forma Fit no Google Maps">
              <Icon.pin className="h-5 w-5" />
            </Social>
          </div>
        </div>

        <div>
          <h2 className="eyebrow text-orange">Endereço</h2>
          <address className="mt-4 not-italic leading-relaxed text-bone/85">
            {SITE.address.place}
            <br />
            {SITE.address.street}
            <br />
            {SITE.address.district}, {SITE.address.city} - {SITE.address.state}
            <br />
            CEP {SITE.address.zip}
          </address>
          <a
            href={SITE.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-orange underline-offset-4 hover:underline"
          >
            Ver no Google Maps →
          </a>
        </div>

        <div>
          <h2 className="eyebrow text-orange">Horário</h2>
          <dl className="mt-4 space-y-3">
            {HOURS.map((h) => (
              <div key={h.days}>
                <dt className="text-sm text-muted">{h.days}</dt>
                <dd className="font-semibold text-white">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="eyebrow text-orange">Contato</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <FooterPhone />
            </li>
            <li>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-bone/85 transition hover:text-orange">
                <Icon.instagram className="h-5 w-5 text-orange" />
                {SITE.instagramHandle}
              </a>
            </li>
            <li>
              <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-bone/85 transition hover:text-orange">
                <Icon.facebook className="h-5 w-5 text-orange" />
                /formafitct
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-3 border-t border-line px-4 pt-6 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {year} CT Forma Fit Jardins · CNPJ {SITE.cnpj}
        </p>
        <Link href="/privacidade" className="hover:text-white">
          Política de privacidade
        </Link>
      </div>
    </footer>
  );
}
