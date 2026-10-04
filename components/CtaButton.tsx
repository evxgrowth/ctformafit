"use client";

import { useRouter } from "next/navigation";
import { useMode, useSite } from "./SiteProvider";
import { whatsappUrl } from "@/lib/whatsapp";
import { resolveButton } from "@/lib/buttons";
import { sendInternal, trackWhatsappClick, withAttribution } from "@/lib/client-track";

type Variant = "primary" | "ghost" | "dark";

/**
 * Botão de CTA. O texto e a mensagem vêm do cadastro em lib/buttons.ts,
 * com os ajustes feitos no admin (Botões).
 * - Página inicial: abre o WhatsApp com a mensagem escolhida.
 * - /captura: leva ao agendamento de visita.
 */
export function CtaButton({
  slot,
  variant = "primary",
  className = "",
  arrow = true,
}: {
  slot: string;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
}) {
  const mode = useMode();
  const { whatsapp, buttons } = useSite();
  const router = useRouter();
  const b = resolveButton(slot, buttons);

  const text = mode === "captura" ? b.captura || b.site : b.site || b.captura;
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
          sendInternal("cta_click", { label: `${slot} · ${text}` });
          router.push(withAttribution(href));
        }}
      >
        {inner}
      </a>
    );
  }

  const href = whatsappUrl(whatsapp.number, whatsapp.messages[b.message]);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => trackWhatsappClick(`${slot} · ${text}`)}>
      {inner}
    </a>
  );
}
