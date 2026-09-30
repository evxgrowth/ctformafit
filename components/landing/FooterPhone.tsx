"use client";

import { useSite } from "../SiteProvider";
import { formatBrPhone } from "@/lib/phone";
import { whatsappUrl } from "@/lib/whatsapp";
import { trackWhatsappClick } from "@/lib/client-track";
import { Icon } from "./icons";

/** Telefone do rodapé: usa o número configurado no painel e abre o WhatsApp. */
export function FooterPhone() {
  const { whatsapp } = useSite();
  const display = formatBrPhone(whatsapp.number.replace(/^55/, ""));
  return (
    <a
      href={whatsappUrl(whatsapp.number, whatsapp.messages.contato)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsappClick("rodapé · telefone")}
      className="group inline-flex items-center gap-3 text-bone/85 transition hover:text-orange"
    >
      <Icon.whatsapp className="h-5 w-5 text-orange" />
      <span className="font-semibold">{display}</span>
    </a>
  );
}
