import type { Metadata } from "next";
import { Scheduler } from "@/components/Scheduler";

export const metadata: Metadata = {
  title: { absolute: "Black Friday 26 | Agendar aula experimental | CT Forma Fit" },
  robots: { index: false, follow: false },
};

export default function AgendarBlack() {
  return <Scheduler campaign="black26" />;
}
