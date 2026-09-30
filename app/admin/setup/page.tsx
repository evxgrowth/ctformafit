import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/admin/AuthForm";
import { setupAction } from "../actions";
import { db, dbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Primeiro acesso", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (!dbConfigured()) {
    return <p className="p-10 text-white">Configure as variáveis do Supabase na Vercel (veja o README) para usar o admin.</p>;
  }
  const { count } = await db().from("admins").select("id", { count: "exact", head: true });
  if (count) redirect("/admin/login");
  return (
    <AuthForm
      action={setupAction}
      title="Primeiro acesso"
      subtitle="Crie o administrador principal. Esta tela some depois disso."
      withName
      submitLabel="Criar e entrar"
    />
  );
}
