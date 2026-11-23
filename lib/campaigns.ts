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
  }
> = {
  black26: {
    id: "black26",
    path: "/black26",
    formPath: "/black26/agendar",
    doneName: "/black26/agendou",
    label: "Black Friday 26",
    plan: "Plano Anual Musculação + Hyrox",
    note: "Veio da página Black Friday (/black26). Interesse: Plano Anual Musculação + Hyrox.",
    waMessage: "Olá! Sou {nome}, vim pela Black Friday do CT Forma Fit e agendei minha aula experimental para {dia} às {hora}. Quero saber do Plano Anual Musculação + Hyrox.",
    pixelCustomEvent: "FormularioBlack26",
    pixelFormName: "Formulário Black 26",
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
  installments: "Pagamento em até 12x",
  period: "Campanha de 23/11 a 29/11 · Vagas limitadas",
  benefits: [
    "Musculação liberada o ano inteiro",
    "Treinos de Hyrox com acompanhamento",
    "Bioimpedância de última geração",
    "Cardio gigante e equipamentos novíssimos",
    "Estacionamento com segurança",
    "Aula experimental antes de decidir",
  ],
};
