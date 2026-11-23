import type { Metadata } from "next";
import { Agendou } from "@/components/Agendou";

export const metadata: Metadata = {
  title: { absolute: "Agendamento confirmado | Black Friday 26 | CT Forma Fit" },
  robots: { index: false, follow: false },
};

export default function AgendouBlack() {
  return <Agendou campaign="black26" />;
}
