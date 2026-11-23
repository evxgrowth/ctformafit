import type { Metadata } from "next";
import { Agendou } from "@/components/Agendou";

export const metadata: Metadata = {
  title: { absolute: "Visita agendada | CT Forma Fit Jardins" },
  robots: { index: false, follow: false },
};

export default function AgendouPage() {
  return <Agendou />;
}
