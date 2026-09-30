import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { fmtDateTime } from "@/lib/leads-query";
import { ActionForm, Card, Field } from "@/components/admin/ui";
import { inputCls } from "@/components/admin/styles";
import { RemoveAdmin } from "@/components/admin/RemoveAdmin";
import { addAdminAction, changePasswordAction } from "../../actions";

export const metadata = { title: "Admins" };

export default async function UsuariosPage() {
  const me = await requireAdmin();
  const { data: admins } = await db().from("admins").select("id, name, email, created_at, last_login_at").order("created_at");
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black uppercase italic text-white">Administradores</h1>
        <p className="text-sm text-white/60">Todos os administradores têm acesso total ao painel.</p>
      </div>

      <Card title="Quem tem acesso">
        <ul className="divide-y divide-white/5">
          {(admins ?? []).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold text-white">
                  {a.name} {a.id === me.sub && <span className="ml-1 text-xs text-[#ff8a3d]">(você)</span>}
                </p>
                <p className="text-sm text-white/60">{a.email}</p>
                <p className="text-xs text-white/40">Último acesso: {a.last_login_at ? fmtDateTime(a.last_login_at) : "nunca"}</p>
              </div>
              {a.id !== me.sub && <RemoveAdmin id={a.id} name={a.name} />}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Adicionar administrador" desc="Crie o acesso e envie o e-mail e a senha para a pessoa por um canal seguro. Ela pode trocar a senha depois.">
        <ActionForm action={addAdminAction} submitLabel="Adicionar">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Nome">
              <input name="name" required className={inputCls} />
            </Field>
            <Field label="E-mail">
              <input name="email" type="email" required className={inputCls} />
            </Field>
            <Field label="Senha inicial" hint="Mínimo de 8 caracteres.">
              <input name="password" type="text" required minLength={8} autoComplete="off" className={inputCls} />
            </Field>
          </div>
        </ActionForm>
      </Card>

      <Card title="Trocar minha senha">
        <ActionForm action={changePasswordAction} submitLabel="Trocar senha">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Senha atual">
              <input name="current" type="password" required autoComplete="current-password" className={inputCls} />
            </Field>
            <Field label="Nova senha">
              <input name="next" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
            </Field>
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}
