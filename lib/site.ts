export const SITE = {
  name: "CT Forma Fit",
  legalName: "CT Forma Fit Jardins",
  tagline: "O seu Centro de Treinamento",
  cnpj: "54.026.231/0001-01",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ctformafit.com.br").replace(/\/$/, ""),
  instagram: "https://www.instagram.com/ctformafit_jardins/",
  instagramHandle: "@ctformafit_jardins",
  facebook: "https://www.facebook.com/formafitct",
  googleMaps: "https://share.google/MWdkaQqYhN4H922Ej",
  address: {
    street: "R. Francisco Duarte de Carvalho, 1200",
    place: "Natal Moda Shopping",
    district: "Jardins",
    city: "São Gonçalo do Amarante",
    state: "RN",
    zip: "59293-750",
  },
  mapsQuery: "Forma Fit, R. Francisco Duarte de Carvalho, 1200 - Jardins, São Gonçalo do Amarante - RN",
};

/** Horário de funcionamento (mesmo do Instagram). */
export const HOURS = [
  { days: "Segunda a sexta", time: "05h às 00h" },
  { days: "Sábado", time: "08h às 18h" },
  { days: "Domingos e feriados", time: "09h às 15h" },
];

/** Mesmo horário no formato do schema.org (00h = fecha à meia-noite). */
export const HOURS_SCHEMA = [
  { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "05:00", closes: "23:59" },
  { dayOfWeek: ["Saturday"], opens: "08:00", closes: "18:00" },
  { dayOfWeek: ["Sunday"], opens: "09:00", closes: "15:00" },
];

export const fullAddress = `${SITE.address.street} (${SITE.address.place}) — ${SITE.address.district}, ${SITE.address.city} - ${SITE.address.state}, ${SITE.address.zip}`;
