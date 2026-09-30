"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/whatsapp", label: "WhatsApp" },
  { href: "/admin/integracoes", label: "Pixels e CRM" },
  { href: "/admin/usuarios", label: "Admins" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">
      {ITEMS.map((i) => {
        const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap px-3 py-2 font-display text-[15px] font-bold uppercase tracking-wider transition ${
              active ? "bg-[#ff6a13] text-black" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
