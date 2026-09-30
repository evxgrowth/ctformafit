"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { PublicSettings } from "@/lib/settings";
import { captureAttribution, initTracking, trackPageView } from "@/lib/client-track";

export type SiteMode = "site" | "captura";

const Ctx = createContext<PublicSettings | null>(null);
const ModeCtx = createContext<SiteMode>("site");

export function SiteProvider({ settings, children }: { settings: PublicSettings; children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
    initTracking(settings.tracking, settings.serverGa4);
  }, [settings]);

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

export function ModeProvider({ mode, children }: { mode: SiteMode; children: React.ReactNode }) {
  return <ModeCtx.Provider value={mode}>{children}</ModeCtx.Provider>;
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error("SiteProvider ausente");
  return v;
}
export function useMode() {
  return useContext(ModeCtx);
}
