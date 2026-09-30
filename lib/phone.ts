const VALID_DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92,
  93, 94, 95, 96, 97, 98, 99,
]);

export function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

/** Remove o 55 do começo, se houver, e devolve DDD + número. */
export function nationalDigits(v: string) {
  let d = onlyDigits(v);
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  return d;
}

/** Celular brasileiro com DDD (11 dígitos, começando com 9) ou fixo (10 dígitos). */
export function isValidBrPhone(v: string) {
  const d = nationalDigits(v);
  if (d.length !== 10 && d.length !== 11) return false;
  if (!VALID_DDD.has(Number(d.slice(0, 2)))) return false;
  if (d.length === 11 && d[2] !== "9") return false;
  if (/^(\d)\1+$/.test(d.slice(2))) return false;
  return true;
}

export function formatBrPhone(v: string) {
  const d = nationalDigits(v).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Número no formato internacional para a API do WhatsApp (ex.: 5584998406056). */
export function toWhatsappNumber(v: string) {
  const d = onlyDigits(v);
  if (d.startsWith("55") && d.length >= 12) return d;
  return `55${d}`;
}
