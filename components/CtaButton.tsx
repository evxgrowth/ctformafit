"use client";

import { useRouter } from "next/navigation";
import { useMode, useSite } from "./SiteProvider";
import { useContactChooser } from "./ContactChooser";
import { whatsappUrl } from "@/lib/whatsapp";
import { resolveButton } from "@/lib/buttons";
import { CAMPAIGNS } from "@/lib/campaigns";
import { sendInternal, trackWhatsappClick, withAttribution } from "@/lib/client-track";

type Variant = "primary" | "ghost" | "dark";

// Textos dos botões na landing da Black 26 (slot -> texto).
const BLACK_TEXT: Record<string, string> = {
  header: "Quero a Black",
  "barra-fixa": "Garantir meu Plano Anual",
  "hero-1": "Garantir meu Plano Anual",
  "hero-2": "Ver o plano",
  plano: "Quero esse plano agora",
  pilares: "Quero aproveitar a Black",
  tecnologia: "Quero ver de perto",
  atendimento: "Agendar minha aula experimental",
  localizacao: "Quero a Black Friday",
  passos: "Garantir minha vaga na Black",
  "final-1": "Garantir meu Plano Anual",
  "final-2": "Ver o plano",
};

/**
 * Botão de CTA. O texto e a mensagem vêm do cadastro em lib/buttons.ts,
 * com os ajustes feitos no admin (Botões).
 * - Página inicial: abre o WhatsApp com a mensagem escolhida (ou a janela de escolha).
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
  const openChooser = useContactChooser();
  // Na Black os textos vêm de BLACK_TEXT (slots como "plano" não existem no cadastro de botões).
  const b = mode === "black" ? { site: "", captura: "", message: "experimental" as const } : resolveButton(slot, buttons);

  const text = mode === "black" ? BLACK_TEXT[slot] ?? "Quero a Black Friday" : mode === "captura" ? b.captura || b.site : b.site || b.captura;
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

  // Botões "Ver o plano" só rolam a página até o card do plano.
  if (mode === "black" && (slot === "hero-2" || slot === "final-2")) {
    return (
      <a href="#plano" className={cls} onClick={() => sendInternal("cta_click", { label: `${slot} · ${text}` })}>
        {inner}
      </a>
    );
  }

  if (mode === "captura" || mode === "black") {
    const href = mode === "black" ? CAMPAIGNS.black26.formPath : "/captura/agendar";
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

  // "escolha" abre a janela Não sou aluno / Já sou aluno (só existe na página inicial).
  if (b.message === "escolha" && openChooser) {
    return (
      <button type="button" className={cls} onClick={() => openChooser(slot)}>
        {inner}
      </button>
    );
  }

  const message = b.message === "escolha" ? "experimental" : b.message;
  const href = whatsappUrl(whatsapp.number, whatsapp.messages[message]);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => trackWhatsappClick(`${slot} · ${text}`)}>
      {inner}
    </a>
  );
}
