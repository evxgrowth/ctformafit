import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Black Friday 26 | Plano Anual Musculação + Hyrox | CT Forma Fit" },
  description: "Black Friday no CT Forma Fit Jardins: Plano Anual Musculação + Hyrox com condição exclusiva. Agende sua aula experimental.",
  robots: { index: false, follow: true },
  openGraph: { images: [{ url: "/og-ctformafit.jpg", width: 1200, height: 630 }] },
};

export default function Black26() {
  return <Landing mode="black" />;
}
