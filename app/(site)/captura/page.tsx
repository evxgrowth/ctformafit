import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Agende sua visita | CT Forma Fit Jardins" },
  description: "Venha conhecer o CT Forma Fit no Natal Moda Shopping, bairro Jardins. Escolha o dia e o horário da sua visita em menos de 1 minuto.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
  openGraph: { images: [{ url: "/og-ctformafit.jpg", width: 1200, height: 630 }] },
};

export default function Captura() {
  return <Landing mode="captura" />;
}
