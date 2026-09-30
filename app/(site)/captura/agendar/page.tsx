import type { Metadata } from "next";
import { Scheduler } from "@/components/Scheduler";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Agendar visita | CT Forma Fit Jardins" },
  description: "Escolha o dia e o horário para conhecer o CT Forma Fit no Natal Moda Shopping, bairro Jardins.",
  robots: { index: false, follow: false },
};

export default function AgendarPage() {
  return <Scheduler />;
}
