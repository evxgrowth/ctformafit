// Campanhas com página própria. A página /captura normal não tem campanha (campaign = null).

export type CampaignId = "black26";

export const CAMPAIGNS: Record<
  CampaignId,
  {
    id: CampaignId;
    path: string; // landing
    formPath: string; // formulário
    doneName: string; // página "agendou"
    label: string; // nome mostrado no admin / pixel
    plan: string;
    note: string; // observação gravada no lead
    waMessage: string; // {nome} {dia} {hora}
    pixelCustomEvent: string;
    pixelFormName: string;
    lastDay: string; // último dia de aula experimental com voucher (AAAA-MM-DD)
  }
> = {
  black26: {
    id: "black26",
    path: "/black26",
    formPath: "/black26/agendar",
    doneName: "/black26/agendou",
    label: "Black Friday 26",
    plan: "Plano Anual Musculação + Hyrox",
    note: "Veio da página Black Friday (/black26). Agendou aula experimental e recebeu o voucher BLACK26 (Plano Anual Musculação + Hyrox por R$ 139,90/mês, válido até 29/11).",
    waMessage: "Olá! Sou {nome}, agendei minha aula experimental para {dia} às {hora} pela Black Friday do CT Forma Fit. Quero confirmar e garantir meu voucher.",
    pixelCustomEvent: "FormularioBlack26",
    pixelFormName: "Formulário Black 26",
    lastDay: "2026-11-29",
  },
};

export function parseCampaign(v: unknown): CampaignId | null {
  return typeof v === "string" && v in CAMPAIGNS ? (v as CampaignId) : null;
}

/** Plano em destaque na landing da Black. Preencha price/installments quando o valor for definido. */
export const BLACK_PLAN = {
  name: "Plano Anual",
  sub: "Musculação + Hyrox",
  from: "R$ 183,00",
  price: "R$ 139,90",
  perMonth: "/mês",
  installments: "Em até 12x",
  code: "BLACK26",
  validUntil: "29/11",
  period: "Voucher válido até 29/11 · Vagas limitadas",
  benefits: [
    "Musculação liberada o ano inteiro",
    "Treinos de Hyrox com acompanhamento",
    "Bioimpedância de última geração",
    "Cardio gigante e equipamentos novíssimos",
    "Estacionamento com segurança",
  ],
  how: [
    "Agende sua aula experimental grátis",
    "Receba o voucher no seu WhatsApp",
    "Treine e mostre o voucher na recepção",
  ],
};
