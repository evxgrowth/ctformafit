import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/admin/AuthForm";
import { loginAction } from "../actions";
import { db, dbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Entrar", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!dbConfigured()) {
    return <p className="p-10 text-white">Configure as variáveis do Supabase na Vercel (veja o README) para usar o admin.</p>;
  }
  const { count } = await db().from("admins").select("id", { count: "exact", head: true });
  if (!count) redirect("/admin/setup");
  return <AuthForm action={loginAction} title="Painel do CT" subtitle="Acesso restrito à equipe" submitLabel="Entrar" />;
}
