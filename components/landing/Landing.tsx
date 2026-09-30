import { ModeProvider, type SiteMode } from "../SiteProvider";
import { HOURS_SCHEMA, SITE } from "@/lib/site";
import { getSettings } from "@/lib/settings";
import { FAQ, IMG } from "./content";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Manifesto, Ticker } from "./Manifesto";
import { Gallery } from "./Gallery";
import { Tech } from "./Tech";
import { Comfort } from "./Comfort";
import { Location } from "./Location";
import { Reviews } from "./Reviews";
import { Faq } from "./Faq";
import { FinalCta, Footer, Steps } from "./Closing";

function JsonLd({ phone }: { phone: string }) {
  const gym = {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    "@id": `${SITE.url}/#gym`,
    name: "CT Forma Fit Jardins",
    alternateName: ["CT Forma Fit", "Forma Fit", "FormaFit Jardins"],
    description:
      "CT de musculação no bairro Jardins, em São Gonçalo do Amarante/RN, dentro do Natal Moda Shopping. Espaço amplo e ventilado, equipamentos novos, cardio gigante, bioimpedância de última geração, botão de chamada do professor e estacionamento com segurança.",
    url: SITE.url,
    image: [`${SITE.url}${IMG.salao}`, `${SITE.url}${IMG.esteiras}`, `${SITE.url}${IMG.noite}`],
    logo: `${SITE.url}${IMG.logo}`,
    telephone: `+${phone}`,
    taxID: SITE.cnpj,
    hasMap: SITE.googleMaps,
    sameAs: [SITE.instagram, SITE.facebook],
    openingHoursSpecification: HOURS_SCHEMA.map((h) => ({ "@type": "OpeningHoursSpecification", ...h })),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.address.street} - ${SITE.address.place}`,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.zip,
      addressCountry: "BR",
    },
    containedInPlace: { "@type": "ShoppingCenter", name: "Natal Moda Shopping" },
    areaServed: ["São Gonçalo do Amarante", "Jardins", "Natal", "Grande Natal"],
    amenityFeature: [
      "Estacionamento privativo com segurança",
      "Vestiários",
      "Bioimpedância",
      "Botão de chamada do professor",
      "Máquina de pré-treino",
      "Máquina de gelo",
      "Mesa de sinuca",
      "Café",
    ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gym) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}

export async function Landing({ mode }: { mode: SiteMode }) {
  const settings = mode === "site" ? await getSettings() : null;
  return (
    <ModeProvider mode={mode}>
      {settings && <JsonLd phone={settings.whatsapp.number} />}
      <Header />
      <main>
        <Hero />
        <Ticker />
        <Manifesto />
        <Gallery />
        <Tech />
        <Comfort />
        <Location />
        <Reviews />
        <Steps mode={mode} />
        <Faq />
        <FinalCta />
      </main>
      <Footer mode={mode} />
    </ModeProvider>
  );
}
