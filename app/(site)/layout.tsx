import { getSettings, toPublic } from "@/lib/settings";
import { SiteProvider } from "@/components/SiteProvider";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = toPublic(await getSettings());
  return <SiteProvider settings={settings}>{children}</SiteProvider>;
}
