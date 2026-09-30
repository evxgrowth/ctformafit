// Rastreamento no navegador: sessão, UTMs, eventos internos, Pixel da Meta e Google.

import type { TrackingSettings } from "./settings";

type Attribution = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term" | "fbclid" | "gclid" | "referrer", string>>;

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] };
    _fbq?: unknown;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __ffTracking?: { t: TrackingSettings; serverGa4: boolean };
  }
}

const ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"] as const;

function safeGet(store: "local" | "session", key: string) {
  try {
    return (store === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
function safeSet(store: "local" | "session", key: string, v: string) {
  try {
    (store === "local" ? localStorage : sessionStorage).setItem(key, v);
  } catch {}
}

export function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
  );
}

export function sessionId() {
  let id = safeGet("session", "ff_sid");
  if (!id) {
    id = uuid();
    safeSet("session", "ff_sid", id);
  }
  return id;
}

/** Guarda as UTMs da URL (última campanha que trouxe a pessoa). */
export function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const found: Attribution = {};
  for (const k of ATTR_KEYS) {
    const v = params.get(k);
    if (v) found[k] = v.slice(0, 200);
  }
  if (Object.keys(found).length) {
    if (document.referrer && !document.referrer.includes(window.location.host)) found.referrer = document.referrer.slice(0, 300);
    safeSet("local", "ff_attr", JSON.stringify({ ...found, at: Date.now() }));
  } else if (!safeGet("local", "ff_attr") && document.referrer && !document.referrer.includes(window.location.host)) {
    safeSet("local", "ff_attr", JSON.stringify({ referrer: document.referrer.slice(0, 300), at: Date.now() }));
  }
  // Grava o _fbc a partir do fbclid, para a API de Conversões.
  const fbclid = params.get("fbclid");
  if (fbclid) document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; path=/; max-age=${90 * 86400}; SameSite=Lax`;
}

export function getAttribution(): Attribution {
  try {
    const raw = safeGet("local", "ff_attr");
    if (!raw) return {};
    const a = JSON.parse(raw);
    if (Date.now() - (a.at ?? 0) > 60 * 86400 * 1000) return {};
    delete a.at;
    return a;
  } catch {
    return {};
  }
}

/** Mantém as UTMs ao navegar para outra página do site. */
export function withAttribution(path: string) {
  const a = getAttribution();
  const q = new URLSearchParams();
  for (const k of ATTR_KEYS) if (a[k]) q.set(k, a[k]!);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

export function sendInternal(type: string, data: Record<string, unknown> = {}) {
  const a = getAttribution();
  const payload = JSON.stringify({
    type,
    page: window.location.pathname,
    url: window.location.href,
    referrer: document.referrer || undefined,
    sessionId: sessionId(),
    utm_source: a.utm_source,
    utm_medium: a.utm_medium,
    utm_campaign: a.utm_campaign,
    ...data,
  });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }))) return;
  } catch {}
  fetch("/api/track", { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
}

// ------------------------------------------------------------------ loaders

export function initTracking(t: TrackingSettings, serverGa4: boolean) {
  if (window.__ffTracking) return;
  window.__ffTracking = { t, serverGa4 };

  if (t.meta_pixel_id) {
    if (!window.fbq) {
      const n = function (...args: unknown[]) {
        const self = n as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
        if (self.callMethod) self.callMethod(...args);
        else self.queue.push(args);
      } as unknown as NonNullable<Window["fbq"]>;
      const nn = n as unknown as Record<string, unknown>;
      nn.push = n;
      nn.loaded = true;
      nn.version = "2.0";
      nn.queue = [];
      window.fbq = n;
      window._fbq = n;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(s);
    }
    window.fbq!("init", t.meta_pixel_id.trim());
  }

  const gtagIds = [t.ga4_id, t.google_ads_id].map((v) => v.trim()).filter(Boolean);
  if (gtagIds.length || t.gtm_id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
  if (gtagIds.length) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagIds[0])}`;
    document.head.appendChild(s);
    window.gtag!("js", new Date());
    for (const id of gtagIds) window.gtag!("config", id, id.startsWith("AW-") ? { allow_enhanced_conversions: true } : {});
  }
  if (t.gtm_id.trim()) {
    window.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(t.gtm_id.trim())}`;
    document.head.appendChild(s);
  }
}

function adsConversion(label: string, eventId: string) {
  const t = window.__ffTracking?.t;
  if (!t?.google_ads_id || !label || !window.gtag) return;
  window.gtag("event", "conversion", { send_to: `${t.google_ads_id.trim()}/${label.trim()}`, transaction_id: eventId });
}

export function trackPageView() {
  const eventId = uuid();
  window.fbq?.("track", "PageView", {}, { eventID: eventId });
  sendInternal("page_view", { eventId });
}

export function trackWhatsappClick(label: string) {
  const eventId = uuid();
  window.fbq?.("track", "Contact", { content_name: label }, { eventID: eventId });
  window.gtag?.("event", "click_whatsapp", { cta: label });
  window.dataLayer?.push({ event: "ff_whatsapp_click", cta: label });
  adsConversion(window.__ffTracking?.t.google_ads_label_contact ?? "", eventId);
  sendInternal("cta_click", { label, whatsapp: true, eventId });
}

export function trackLead(eventId: string, user: { email?: string; phone?: string }) {
  window.fbq?.("track", "Lead", { content_name: "Agendamento de visita" }, { eventID: eventId });
  if (window.gtag && (user.email || user.phone)) {
    window.gtag("set", "user_data", {
      email: user.email || undefined,
      phone_number: user.phone ? `+55${user.phone.replace(/\D/g, "").replace(/^55/, "")}` : undefined,
    });
  }
  if (!window.__ffTracking?.serverGa4) window.gtag?.("event", "generate_lead", { event_id: eventId });
  window.dataLayer?.push({ event: "ff_lead" });
  adsConversion(window.__ffTracking?.t.google_ads_label_lead ?? "", eventId);
}

export function trackSchedule(eventId: string) {
  window.fbq?.("track", "Schedule", { content_name: "Visita agendada" }, { eventID: eventId });
  if (!window.__ffTracking?.serverGa4) window.gtag?.("event", "schedule_visit", { event_id: eventId });
  window.dataLayer?.push({ event: "ff_schedule" });
  adsConversion(window.__ffTracking?.t.google_ads_label_schedule ?? "", eventId);
}
