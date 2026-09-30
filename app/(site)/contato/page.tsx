import type { Metadata } from "next";
import Image from "next/image";
import { ModeProvider } from "@/components/SiteProvider";
import { CtaButton } from "@/components/CtaButton";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Closing";
import { Icon } from "@/components/landing/icons";
import { MaskLines, Reveal } from "@/components/landing/motion";
import { IMG } from "@/components/landing/content";
import { HOURS, SITE } from "@/lib/site";
import { getSettings } from "@/lib/settings";
import { formatBrPhone } from "@/lib/phone";
import { whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com o CT Forma Fit pelo WhatsApp, Instagram ou Facebook. Natal Moda Shopping, bairro Jardins, São Gonçalo do Amarante/RN. Seg. a sex. das 05h às 00h.",
  alternates: { canonical: "/contato" },
  openGraph: { images: [{ url: "/og-ctformafit.jpg", width: 1200, height: 630 }] },
};

function Channel({
  href,
  icon,
  label,
  value,
  note,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="cut-card group flex h-full items-start gap-5 bg-panel p-6 transition-colors duration-500 hover:bg-orange sm:p-7"
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center bg-orange text-ink transition-colors duration-500 [clip-path:polygon(10%_0,100%_6%,90%_100%,0_94%)] group-hover:bg-ink group-hover:text-orange">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="eyebrow block text-orange transition-colors group-hover:text-ink">{label}</span>
        <span className="display mt-2 block break-words text-[1.9rem] text-white transition-colors group-hover:text-ink">{value}</span>
        <span className="mt-1 block text-muted transition-colors group-hover:text-ink/75">{note}</span>
      </span>
    </a>
  );
}

export default async function ContatoPage() {
  const s = await getSettings();
  const phone = formatBrPhone(s.whatsapp.number.replace(/^55/, ""));

  return (
    <ModeProvider mode="site">
      <Header />
      <main>
        <section className="grain relative overflow-hidden bg-ink pb-16 pt-36 sm:pb-20 sm:pt-44">
          <div className="absolute inset-0 opacity-30">
            <Image src={IMG.salao} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-orange">
                <span className="h-[2px] w-8 bg-orange" />
                Contato
              </p>
            </Reveal>
            <h1 className="display mt-4 text-[clamp(3.3rem,12vw,8rem)] text-white">
              <MaskLines lines={["Fale com o", <span key="c" className="text-orange">CT Forma Fit.</span>]} />
            </h1>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-xl text-lg text-bone/85 sm:text-xl">
                Tire dúvidas, agende sua aula experimental ou venha conhecer a estrutura. A equipe responde rapidinho pelo WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={0.25} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton intent="contato" label="Chamar no WhatsApp" where="contato-topo" />
              <CtaButton intent="experimental" label="Agendar aula experimental" variant="ghost" where="contato-topo" />
            </Reveal>
          </div>
        </section>

        <section className="bg-ink pb-20">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2">
            <Reveal>
              <Channel
                href={whatsappUrl(s.whatsapp.number, s.whatsapp.messages.contato)}
                icon={<Icon.whatsapp className="h-7 w-7" />}
                label="WhatsApp"
                value={phone}
                note="Atendimento pela equipe do CT"
              />
            </Reveal>
            <Reveal delay={0.06}>
              <Channel
                href={SITE.instagram}
                icon={<Icon.instagram className="h-7 w-7" />}
                label="Instagram"
                value={SITE.instagramHandle}
                note="Treinos, novidades e bastidores"
              />
            </Reveal>
            <Reveal delay={0.12}>
              <Channel
                href={SITE.facebook}
                icon={<Icon.facebook className="h-7 w-7" />}
                label="Facebook"
                value="/formafitct"
                note="Acompanhe a página do CT"
              />
            </Reveal>
            <Reveal delay={0.18}>
              <Channel
                href={SITE.googleMaps}
                icon={<Icon.pin className="h-7 w-7" />}
                label="Google Maps"
                value="Como chegar"
                note="Rotas e avaliações do CT"
              />
            </Reveal>
          </div>
        </section>

        <section className="bg-coal py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <div>
              <Reveal>
                <h2 className="eyebrow text-orange">Endereço</h2>
                <address className="mt-4 text-2xl font-semibold not-italic leading-snug text-white">
                  {SITE.address.place}
                  <br />
                  {SITE.address.street}
                  <br />
                  <span className="text-lg font-normal text-bone/80">
                    {SITE.address.district}, {SITE.address.city} - {SITE.address.state} · CEP {SITE.address.zip}
                  </span>
                </address>
                <p className="mt-3 text-muted">Às margens da BR-406, com estacionamento privativo e segurança particular.</p>
              </Reveal>

              <Reveal delay={0.1} className="mt-10">
                <h2 className="eyebrow text-orange">Horário de funcionamento</h2>
                <dl className="mt-4 divide-y divide-line border-y border-line">
                  {HOURS.map((h) => (
                    <div key={h.days} className="flex items-baseline justify-between gap-4 py-4">
                      <dt className="text-bone/80">{h.days}</dt>
                      <dd className="display text-3xl text-white">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={0.15} className="mt-8">
                <p className="text-sm text-muted">
                  {SITE.legalName} · CNPJ {SITE.cnpj}
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.1} className="flex flex-col">
              <div className="cut-card relative min-h-[380px] flex-1 overflow-hidden bg-panel">
                <iframe
                  title="Mapa: CT Forma Fit no Natal Moda Shopping, Jardins, São Gonçalo do Amarante"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&output=embed`}
                  className="absolute inset-0 h-full w-full [filter:grayscale(1)_invert(.92)_contrast(.9)_hue-rotate(180deg)]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={SITE.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 self-start font-display text-lg font-bold uppercase italic tracking-wide text-bone underline decoration-orange decoration-2 underline-offset-8 transition hover:text-orange"
              >
                Abrir no Google Maps
              </a>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer mode="site" />
    </ModeProvider>
  );
}
