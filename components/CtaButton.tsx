"use client";

import { useRouter } from "next/navigation";
import { useMode, useSite } from "./SiteProvider";
import { whatsappUrl, type CtaIntent } from "@/lib/whatsapp";
import { sendInternal, trackWhatsappClick, withAttribution } from "@/lib/client-track";

type Variant = "primary" | "ghost" | "dark";

const CAPTURA_LABEL: Record<CtaIntent, string> = {
  experimental: "Agendar minha visita",
  matricula: "Quero conhecer o CT",
  contato: "Agendar uma visita",
  conhecer: "Quero conhecer o CT",
};

/**
 * Na página inicial: abre o WhatsApp com a mensagem da intenção.
 * Em /captura: leva ao agendamento de visita.
 */
export function CtaButton({
  intent,
  label,
  capturaLabel,
  variant = "primary",
  className = "",
  where,
  arrow = true,
}: {
  intent: CtaIntent;
  label: string;
  capturaLabel?: string;
  variant?: Variant;
  className?: string;
  where: string;
  arrow?: boolean;
}) {
  const mode = useMode();
  const { whatsapp } = useSite();
  const router = useRouter();

  const text = mode === "captura" ? capturaLabel ?? CAPTURA_LABEL[intent] : label;
  const cls = `btn btn-${variant} ${className}`;
  const inner = (
    <>
      <span>{text}</span>
      {arrow && (
        <svg className="btn-arrow h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
        </svg>
      )}
    </>
  );

  if (mode === "captura") {
    const href = "/captura/agendar";
    return (
      <a
        href={href}
        className={cls}
        onClick={(e) => {
          e.preventDefault();
          sendInternal("cta_click", { label: `${where} · ${text}` });
          router.push(withAttribution(href));
        }}
      >
        {inner}
      </a>
    );
  }

  const href = whatsappUrl(whatsapp.number, whatsapp.messages[intent]);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
      onClick={() => trackWhatsappClick(`${where} · ${text}`)}
    >
      {inner}
    </a>
  );
}
