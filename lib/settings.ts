import "server-only";
import { db, dbConfigured } from "./db";

export type WhatsappSettings = {
  number: string;
  messages: {
    experimental: string;
    matricula: string;
    contato: string;
    conhecer: string;
    agendamento: string;
  };
};

export type TrackingSettings = {
  meta_pixel_id: string;
  meta_test_event_code: string;
  ga4_id: string;
  gtm_id: string;
  google_ads_id: string;
  google_ads_label_lead: string;
  google_ads_label_schedule: string;
  google_ads_label_contact: string;
};

export type SecretSettings = {
  meta_capi_token: string;
  ga4_api_secret: string;
  crm_token: string;
};

export type CrmSettings = {
  enabled: boolean;
  endpoint: string;
  interest: string;
  unit: string;
  tags_completed: string[];
  tags_incomplete: string[];
  send_incomplete: boolean;
  incomplete_delay_min: number;
};

export type ScheduleSettings = {
  weekdays: number[]; // 0 = domingo ... 6 = sábado
  start_hour: number;
  end_hour: number;
  min_lead_minutes: number;
  block_holidays: boolean;
  block_optional_holidays: boolean;
};

export type AllSettings = {
  whatsapp: WhatsappSettings;
  tracking: TrackingSettings;
  secrets: SecretSettings;
  crm: CrmSettings;
  schedule: ScheduleSettings;
};

export const DEFAULTS: AllSettings = {
  whatsapp: {
    number: "5584998406056",
    messages: {
      experimental: "Olá! Vim pelo site e quero agendar uma aula experimental no CT Forma Fit.",
      matricula: "Olá! Vim pelo site e quero fazer minha matrícula no CT Forma Fit.",
      contato: "Olá! Vim pelo site do CT Forma Fit e gostaria de mais informações.",
      conhecer: "Olá! Vim pelo site e quero conhecer a estrutura do CT Forma Fit.",
      agendamento: "Olá! Agendei uma visita no CT FormaFit pelo site.",
    },
  },
  tracking: {
    meta_pixel_id: "",
    meta_test_event_code: "",
    ga4_id: "",
    gtm_id: "",
    google_ads_id: "",
    google_ads_label_lead: "",
    google_ads_label_schedule: "",
    google_ads_label_contact: "",
  },
  secrets: { meta_capi_token: "", ga4_api_secret: "", crm_token: "" },
  crm: {
    enabled: true,
    endpoint: "https://wheblreswlcaevceakpn.supabase.co/functions/v1/landing-lead",
    interest: "Musculação",
    unit: "",
    tags_completed: ["Landing Page", "Visita agendada"],
    tags_incomplete: ["Landing Page", "Agendamento incompleto"],
    send_incomplete: true,
    incomplete_delay_min: 15,
  },
  schedule: {
    weekdays: [1, 2, 3, 4, 5],
    start_hour: 6,
    end_hour: 20,
    min_lead_minutes: 60,
    block_holidays: true,
    block_optional_holidays: false,
  },
};

type Key = keyof AllSettings;

function merge<T>(base: T, value: unknown): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const b = (base as Record<string, unknown>)[k];
    if (b && typeof b === "object" && !Array.isArray(b)) out[k] = merge(b, v);
    else if (v !== undefined && v !== null) out[k] = v;
  }
  return out as T;
}

export async function getSettings(): Promise<AllSettings> {
  if (!dbConfigured()) return structuredClone(DEFAULTS);
  try {
    const { data, error } = await db().from("settings").select("key, value");
    if (error) throw error;
    const result = structuredClone(DEFAULTS);
    for (const row of data ?? []) {
      const key = row.key as Key;
      if (key in result) (result as Record<Key, unknown>)[key] = merge(result[key], row.value);
    }
    if (!result.secrets.crm_token && process.env.EVX_CRM_TOKEN) result.secrets.crm_token = process.env.EVX_CRM_TOKEN;
    return result;
  } catch (e) {
    console.error("[settings] usando padrões:", e);
    return structuredClone(DEFAULTS);
  }
}

export async function saveSetting<K extends Key>(key: K, value: AllSettings[K]) {
  const { error } = await db()
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

/** Só o que pode ir para o navegador. */
export type PublicSettings = { whatsapp: WhatsappSettings; tracking: TrackingSettings; serverGa4: boolean };

export function toPublic(s: AllSettings): PublicSettings {
  return { whatsapp: s.whatsapp, tracking: s.tracking, serverGa4: Boolean(s.secrets.ga4_api_secret && s.tracking.ga4_id) };
}
