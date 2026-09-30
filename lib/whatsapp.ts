import { toWhatsappNumber } from "./phone";

export type CtaIntent = "experimental" | "matricula" | "contato" | "conhecer";

export function whatsappUrl(number: string, text: string) {
  const phone = toWhatsappNumber(number);
  return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
}

/** Troca {nome}, {dia} e {hora} na mensagem pré-definida. */
export function fillMessage(template: string, vars: Record<string, string | undefined>) {
  return template.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m)).trim();
}
