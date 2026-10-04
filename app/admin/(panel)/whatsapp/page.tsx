import { getSettings } from "@/lib/settings";
import { formatBrPhone } from "@/lib/phone";
import { ActionForm, Card, Field } from "@/components/admin/ui";
import { inputCls } from "@/components/admin/styles";
import { saveWhatsappAction } from "../../actions";
import { BUTTONS, MESSAGE_LABELS, resolveButton, type MessageKey } from "@/lib/buttons";
import Link from "next/link";

export const metadata = { title: "WhatsApp" };

const MESSAGE_KEYS: MessageKey[] = ["experimental", "aluno", "contato", "conhecer", "matricula"];

export default async function WhatsappPage() {
  const s = await getSettings();
  const national = s.whatsapp.number.replace(/^55/, "");
  // Quais botões da página inicial usam cada mensagem (conforme o que está salvo em Botões).
  const usedBy = (key: MessageKey) =>
    BUTTONS.filter((b) => b.site && resolveButton(b.id, s.buttons).message === key).map((b) => `“${resolveButton(b.id, s.buttons).site}” (${b.place.toLowerCase()})`);
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black uppercase italic text-white">WhatsApp</h1>
        <p className="text-sm text-white/60">
          Número que recebe os contatos do site e as mensagens que já vão escritas no WhatsApp. Para trocar o texto dos botões ou qual mensagem cada um
          abre, use a tela{" "}
          <Link href="/admin/botoes" className="text-[#ff8a3d] underline">
            Botões
          </Link>
          .
        </p>
      </div>
      <Card>
        <ActionForm action={saveWhatsappAction}>
          <Field label="Número do WhatsApp (com DDD)" hint="O número não aparece no site: ele só é usado nos links dos botões.">
            <input name="number" defaultValue={formatBrPhone(national)} inputMode="tel" className={inputCls} required />
          </Field>
          {MESSAGE_KEYS.map((key) => {
            const used = usedBy(key);
            return (
              <Field
                key={key}
                label={`Mensagem “${MESSAGE_LABELS[key]}”`}
                hint={used.length ? `Usada por: ${used.join(", ")}.` : "Nenhum botão usa esta mensagem agora. Você pode escolher ela para um botão na tela Botões."}
              >
                <textarea name={key} defaultValue={s.whatsapp.messages[key]} rows={2} maxLength={600} className={inputCls} required />
              </Field>
            );
          })}
          <Field
            label="Mensagem depois de confirmar o agendamento (/captura)"
            hint="Aberta automaticamente após a confirmação. Pode usar {nome}, {dia} e {hora}, ex.: “Olá! Sou {nome} e agendei minha visita para {dia} às {hora}.”"
          >
            <textarea name="agendamento" defaultValue={s.whatsapp.messages.agendamento} rows={2} maxLength={600} className={inputCls} required />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
