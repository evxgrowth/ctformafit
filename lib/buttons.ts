// Cadastro de todos os botões de CTA do site. Textos e mensagem de cada um podem
// ser trocados no admin (Botões); aqui ficam os padrões.

export type MessageKey = "experimental" | "matricula" | "aluno" | "contato" | "conhecer";

export const MESSAGE_LABELS: Record<MessageKey, string> = {
  experimental: "Aula experimental",
  matricula: "Matrícula",
  aluno: "Já sou aluno",
  contato: "Falar com a equipe",
  conhecer: "Conhecer o CT",
};

/** O que o botão faz na página inicial: abre uma mensagem ou a janela de escolha. */
export type ButtonAction = MessageKey | "escolha";

export const ACTION_LABELS: Record<ButtonAction, string> = {
  escolha: "Abrir escolha: não sou aluno / já sou aluno",
  ...MESSAGE_LABELS,
};

export type ButtonSlot = {
  id: string;
  group: string;
  place: string;
  site: string | null; // texto na página inicial (null = botão não aparece lá)
  captura: string | null; // texto na /captura (null = botão não aparece lá)
  message: ButtonAction; // o que o botão faz na página inicial
};

export const BUTTONS: ButtonSlot[] = [
  { id: "header", group: "Topo do site", place: "Cabeçalho (canto superior direito)", site: "Entrar em contato", captura: "Agendar visita", message: "escolha" },
  { id: "menu", group: "Topo do site", place: "Menu do celular (rodapé do menu aberto)", site: "Entrar em contato", captura: null, message: "escolha" },
  { id: "barra-fixa", group: "Topo do site", place: "Barra fixa no rodapé do celular", site: "Entrar em contato", captura: "Agendar minha visita", message: "escolha" },
  { id: "hero-1", group: "Primeira dobra", place: "Botão principal (laranja)", site: "Entrar em contato", captura: "Agendar minha visita", message: "escolha" },
  { id: "hero-2", group: "Primeira dobra", place: "Botão secundário (contorno)", site: "Já sou aluno", captura: "Quero conhecer o CT", message: "aluno" },
  { id: "pilares", group: "Meio da página", place: "Depois dos 4 diferenciais", site: "Quero conhecer o CT", captura: "Quero conhecer o CT", message: "conhecer" },
  { id: "tecnologia", group: "Meio da página", place: "Seção Tecnologia", site: "Quero testar na prática", captura: "Quero ver de perto", message: "experimental" },
  { id: "atendimento", group: "Meio da página", place: "Seção Atendimento (fundo claro)", site: "Falar com a equipe", captura: "Agendar uma visita", message: "contato" },
  { id: "localizacao", group: "Meio da página", place: "Seção Localização", site: "Entrar em contato", captura: "Agendar minha visita", message: "escolha" },
  { id: "passos", group: "Final da página", place: "Seção \"3 passos\" (fundo laranja)", site: "Dar o primeiro passo agora", captura: "Agendar minha visita agora", message: "experimental" },
  { id: "final-1", group: "Final da página", place: "Chamada final, botão principal", site: "Entrar em contato", captura: "Agendar minha visita", message: "escolha" },
  { id: "final-2", group: "Final da página", place: "Chamada final, botão secundário", site: "Já sou aluno", captura: "Quero conhecer o CT", message: "aluno" },
  { id: "contato-1", group: "Página Contato", place: "Botão principal", site: "Chamar no WhatsApp", captura: null, message: "contato" },
  { id: "contato-2", group: "Página Contato", place: "Botão secundário", site: "Agendar aula experimental", captura: null, message: "experimental" },
  { id: "agendar-continuar", group: "Formulário de agendamento (/captura)", place: "Etapa 1: botão para seguir", site: null, captura: "Escolher dia e horário", message: "experimental" },
  { id: "agendar-confirmar", group: "Formulário de agendamento (/captura)", place: "Etapa 2: botão de confirmar", site: null, captura: "Confirmar agendamento", message: "experimental" },
];

export type ButtonOverrides = Record<string, { site?: string; captura?: string; message?: ButtonAction }>;

export function resolveButton(id: string, overrides: ButtonOverrides | undefined) {
  const base = BUTTONS.find((b) => b.id === id);
  if (!base) throw new Error(`Botão desconhecido: ${id}`);
  const o = overrides?.[id] ?? {};
  return {
    site: o.site?.trim() || base.site || "",
    captura: o.captura?.trim() || base.captura || "",
    message: o.message && o.message in ACTION_LABELS ? o.message : base.message,
  };
}
