"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IMG } from "./landing/content";
import { Icon } from "./landing/icons";
import { useSite } from "./SiteProvider";
import { CAMPAIGNS } from "@/lib/campaigns";
import { whatsappUrl } from "@/lib/whatsapp";

type Done = { wa?: string; label?: string; name?: string };

/** /captura/agendou e /black26/agendou: confirmação depois do formulário. */
export function Agendou({ campaign }: { campaign?: "black26" }) {
  const black = Boolean(campaign);
  const { whatsapp } = useSite();
  const [d, setD] = useState<Done>({});

  useEffect(() => {
    try {
      setD(JSON.parse(sessionStorage.getItem("ff_done") || "{}"));
    } catch {}
  }, []);

  const wa = d.wa || whatsappUrl(whatsapp.number, black ? "Olá! Agendei minha aula experimental pela Black Friday do CT Forma Fit e quero confirmar." : "Olá! Agendei uma visita no CT FormaFit pelo site.");

  return (
    <main className="grain relative grid min-h-[100svh] place-items-center bg-ink px-4 py-16 text-center">
      <div className="relative mx-auto w-full max-w-xl">
        <div className="relative mx-auto mb-8 h-14 w-[120px]">
          <Image src={IMG.logo} alt="CT Forma Fit" fill sizes="120px" className="object-contain" priority />
        </div>
        <span className="mx-auto grid h-20 w-20 place-items-center bg-orange text-ink [clip-path:polygon(10%_0,100%_6%,90%_100%,0_94%)]">
          <Icon.check className="h-10 w-10" />
        </span>
        <p className="eyebrow mt-8 text-orange">{black ? "Black Friday 26" : "Visita agendada"}</p>
        <h1 className="display mt-2 text-[clamp(2.8rem,11vw,5rem)] text-white">
          {d.name ? <>Show, {d.name}!</> : "Tudo certo!"}
          <br />
          <span className="text-orange">{black ? "Aula experimental agendada." : "Visita agendada."}</span>
        </h1>
        {d.label && <p className="mt-4 font-display text-2xl font-extrabold uppercase italic text-white">{d.label}</p>}
        <p className="mt-4 text-lg text-muted">
          {black
            ? `Seu voucher Black está chegando no seu WhatsApp. Depois da aula, mostre ele na recepção e garanta o ${CAMPAIGNS.black26.plan} por R$ 139,90/mês.`
            : "Abrimos o WhatsApp da equipe em outra aba para você confirmar. Se não abriu, é só tocar no botão abaixo."}
        </p>
        {black && (
          <div className="mt-8">
            <Image src="/black26/voucher-black26.png" alt="Voucher Black Friday 26 do CT Forma Fit: Plano Anual Musculação + Hyrox por R$ 139,90 por mês, código BLACK26, válido até 29/11" width={1200} height={800} className="h-auto w-full" priority />
            <a href="/black26/voucher-black26.png" download="voucher-black26-ctformafit.png" className="mt-3 inline-block text-sm font-semibold text-orange underline underline-offset-4">
              Salvar voucher no celular
            </a>
          </div>
        )}
        <a href={wa} className="btn btn-primary mt-8 w-full !min-h-16 !text-xl">
          <span>{black ? "Confirmar no WhatsApp" : "Falar com a equipe no WhatsApp"}</span>
          <Icon.whatsapp className="h-6 w-6" />
        </a>
        <Link href={black ? "/black26" : "/captura"} className="mt-5 inline-block text-sm text-muted underline hover:text-white">
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}
