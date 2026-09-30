import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";
import { SITE } from "@/lib/site";

export const revalidate = 300;

const title = "CT Forma Fit Jardins | Academia de Musculação em São Gonçalo do Amarante";
const description =
  "Academia de musculação no bairro Jardins, dentro do Natal Moda Shopping, na BR-406. Espaço gigante e ventilado, equipamentos novíssimos, cardio enorme, bioimpedância e estacionamento com segurança. Agende sua aula experimental.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [
    "academia São Gonçalo do Amarante",
    "academia Jardins São Gonçalo do Amarante",
    "academia Natal Moda Shopping",
    "academia BR-406",
    "musculação São Gonçalo do Amarante",
    "CT de musculação RN",
    "academia perto de mim",
    "CT Forma Fit",
    "Forma Fit Jardins",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE.url,
    siteName: "CT Forma Fit",
    title,
    description,
    images: [{ url: "/og-ctformafit.jpg", width: 1200, height: 630, alt: "CT Forma Fit — Bodybuilder Training Center" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-ctformafit.jpg"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export default function Home() {
  return <Landing mode="site" />;
}
