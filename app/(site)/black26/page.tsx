import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Black Friday 26 | Aula experimental grátis + voucher | CT Forma Fit" },
  description: "Agende sua aula experimental grátis no CT Forma Fit Jardins, receba o voucher da Black no WhatsApp e garanta o Plano Anual Musculação + Hyrox por R$ 139,90/mês.",
  robots: { index: false, follow: true },
  openGraph: { images: [{ url: "/og-ctformafit.jpg", width: 1200, height: 630 }] },
};

export default function Black26() {
  return <Landing mode="black" />;
}
