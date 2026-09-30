import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Nav } from "@/components/admin/Nav";
import { logoutAction } from "../actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin CT Forma Fit" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-[100svh] bg-[#070707] text-[#f4f1ea] lg:grid lg:grid-cols-[230px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0b0b]/95 backdrop-blur lg:h-[100svh] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 pt-3 lg:block lg:px-5 lg:pt-6">
          <Link href="/admin" className="relative block h-10 w-24 lg:h-16 lg:w-32">
            <Image src="/images/logo-formafit.png" alt="CT Forma Fit" fill sizes="130px" className="object-contain object-left" />
          </Link>
          <div className="flex items-center gap-3 lg:mt-6 lg:block">
            <p className="hidden text-xs text-white/50 lg:block">Logado como</p>
            <p className="text-sm font-semibold text-white">{admin.name}</p>
          </div>
        </div>
        <div className="px-2 py-2 lg:mt-6 lg:px-3">
          <Nav />
        </div>
        <div className="hidden px-5 lg:absolute lg:bottom-6 lg:block">
          <Link href="/" target="_blank" className="block text-sm text-white/60 hover:text-white">
            Ver site ↗
          </Link>
          <form action={logoutAction}>
            <button className="mt-2 text-sm text-white/60 hover:text-white">Sair</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-6 sm:px-8 lg:py-10">
        {children}
        <form action={logoutAction} className="mt-12 lg:hidden">
          <button className="text-sm text-white/60 underline">Sair do painel</button>
        </form>
      </div>
    </div>
  );
}
