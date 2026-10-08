import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { ACTION_LABELS, BUTTONS, resolveButton, type ButtonAction } from "@/lib/buttons";
import { ActionForm, Card } from "@/components/admin/ui";
import { inputCls } from "@/components/admin/styles";
import { saveButtonsAction } from "../../actions";

export const metadata = { title: "Botões" };

const ACTIONS = Object.keys(ACTION_LABELS) as ButtonAction[];

export default async function BotoesPage() {
  const s = await getSettings();
  const groups = [...new Set(BUTTONS.map((b) => b.group))];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black uppercase italic text-white">Botões</h1>
        <p className="text-sm text-white/60">
          Texto de cada botão de chamada do site e qual mensagem de WhatsApp ele abre. Na página inicial, o botão abre o WhatsApp direto com uma mensagem ou
          abre a janela de escolha (“Não sou aluno / Já sou aluno”); na /captura, leva ao agendamento de visita. O texto das mensagens se edita na tela{" "}
          <Link href="/admin/whatsapp" className="text-[#ff8a3d] underline">
            WhatsApp
          </Link>
          . Deixe um campo vazio para voltar ao texto padrão.
        </p>
      </div>

      <ActionForm action={saveButtonsAction} className="space-y-6" submitLabel="Salvar botões">
        {groups.map((g) => (
          <Card key={g} title={g}>
            <div className="divide-y divide-white/5">
              {BUTTONS.filter((b) => b.group === g).map((b) => {
                const cur = resolveButton(b.id, s.buttons);
                return (
                  <div key={b.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 lg:grid-cols-[170px_1fr_1fr_250px] lg:items-end">
                    <p className="text-sm font-semibold text-white lg:pb-2.5">{b.place}</p>

                    {b.site ? (
                      <label className="block">
                        <span className="text-xs text-white/50">Texto na página inicial</span>
                        <input name={`${b.id}.site`} defaultValue={cur.site} placeholder={b.site} maxLength={60} className={`${inputCls} mt-1`} />
                      </label>
                    ) : (
                      <span className="hidden text-xs text-white/30 lg:block lg:pb-3">Não aparece na página inicial</span>
                    )}

                    {b.captura ? (
                      <label className="block">
                        <span className="text-xs text-white/50">Texto na /captura</span>
                        <input name={`${b.id}.captura`} defaultValue={cur.captura} placeholder={b.captura} maxLength={60} className={`${inputCls} mt-1`} />
                      </label>
                    ) : (
                      <span className="hidden text-xs text-white/30 lg:block lg:pb-3">Não aparece na /captura</span>
                    )}

                    {b.site ? (
                      <label className="block">
                        <span className="text-xs text-white/50">Ao clicar (página inicial)</span>
                        <select name={`${b.id}.message`} defaultValue={cur.message} className={`${inputCls} mt-1`}>
                          {ACTIONS.map((k) => (
                            <option key={k} value={k}>
                              {k === "escolha" ? ACTION_LABELS[k] : `Mensagem: ${ACTION_LABELS[k]}`}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <span className="hidden text-xs text-white/30 lg:block lg:pb-3">Botão do formulário</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </ActionForm>
    </div>
  );
}
