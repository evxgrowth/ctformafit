import "server-only";
import { createHash } from "node:crypto";
import type { AllSettings } from "./settings";
import { toWhatsappNumber } from "./phone";

const GRAPH_VERSION = "v23.0";

export type ConversionContext = {
  eventName: "PageView" | "Contact" | "Lead" | "Schedule";
  eventId: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  gaClientId?: string;
  sessionId?: string;
  name?: string;
  phone?: string;
  email?: string;
  externalId?: string;
  custom?: Record<string, string | number>;
};

const sha = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

/** Meta — API de Conversões. Usa o mesmo event_id do Pixel para não contar duas vezes. */
export async function sendMetaCapi(s: AllSettings, c: ConversionContext) {
  const pixel = s.tracking.meta_pixel_id.trim();
  const token = s.secrets.meta_capi_token.trim();
  if (!pixel || !token) return;

  const user_data: Record<string, unknown> = {
    client_ip_address: c.ip,
    client_user_agent: c.userAgent,
    fbp: c.fbp || undefined,
    fbc: c.fbc || undefined,
  };
  if (c.email) user_data.em = [sha(c.email)];
  if (c.phone) user_data.ph = [sha(toWhatsappNumber(c.phone))];
  if (c.name) {
    const [first, ...rest] = c.name.trim().split(/\s+/);
    user_data.fn = [sha(first)];
    if (rest.length) user_data.ln = [sha(rest.join(" "))];
  }
  if (c.externalId) user_data.external_id = [sha(c.externalId)];
  user_data.country = [sha("br")];

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: c.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: c.eventId,
        action_source: "website",
        event_source_url: c.url,
        user_data,
        custom_data: c.custom,
      },
    ],
  };
  if (s.tracking.meta_test_event_code.trim()) body.test_event_code = s.tracking.meta_test_event_code.trim();

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("[meta capi]", res.status, await res.text());
  } catch (e) {
    console.error("[meta capi]", e);
  }
}

const GA_EVENT: Record<ConversionContext["eventName"], string | null> = {
  PageView: null,
  Contact: null,
  Lead: "generate_lead",
  Schedule: "schedule_visit",
};

/** Google Analytics 4 — Measurement Protocol (servidor). Só para as conversões principais. */
export async function sendGa4(s: AllSettings, c: ConversionContext) {
  const id = s.tracking.ga4_id.trim();
  const secret = s.secrets.ga4_api_secret.trim();
  const name = GA_EVENT[c.eventName];
  if (!id || !secret || !name) return;
  const clientId = c.gaClientId || c.sessionId || c.eventId;
  const body: Record<string, unknown> = {
    client_id: clientId,
    events: [{ name, params: { ...c.custom, event_id: c.eventId, page_location: c.url, engagement_time_msec: 1 } }],
  };
  const ud: Record<string, unknown> = {};
  if (c.email) ud.sha256_email_address = [sha(c.email)];
  if (c.phone) ud.sha256_phone_number = [sha(`+${toWhatsappNumber(c.phone)}`)];
  if (Object.keys(ud).length) body.user_data = ud;
  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(id)}&api_secret=${encodeURIComponent(secret)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    );
    if (!res.ok) console.error("[ga4 mp]", res.status, await res.text());
  } catch (e) {
    console.error("[ga4 mp]", e);
  }
}

export async function sendConversions(s: AllSettings, c: ConversionContext) {
  await Promise.all([sendMetaCapi(s, c), sendGa4(s, c)]);
}

/** "GA1.1.123.456" -> "123.456" */
export function gaClientIdFromCookie(v?: string) {
  if (!v) return undefined;
  const parts = v.split(".");
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : undefined;
}
