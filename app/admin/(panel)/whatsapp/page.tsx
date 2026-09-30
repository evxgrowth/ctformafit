import { getSettings } from "@/lib/settings";
import { formatBrPhone } from "@/lib/phone";
import { ActionForm, Card, Field } from "@/components/admin/ui";
import { inputCls } from "@/components/admin/styles";
import { saveWhatsappAction } from "../../actions";

export const metadata = { title: "WhatsApp" };

const MESSAGES = [
  { key: "experimental", label: "Botões “Agendar aula experimental”", where: "Página inicial: topo, tecnologia, localização, passos, final e barra fixa do celular." },
  { key: "matricula", label: "Botões “Quero me matricular”", where: "Página inicial: topo e final." },
  { key: "contato", label: "Botão “Falar com a equipe”", where: "Página inicial: seção de atendimento." },
  { key: "conhecer", label: "Botão “Quero conhecer o CT”", where: "Página inicial: depois dos diferenciais." },
  {
    key: "agendamento",
    label: "Depois de confirmar o agendamento (/captura)",
    where: "Aberta automaticamente após a confirmação. Pode usar {nome}, {dia} e {hora}, ex.: “Olá! Sou {nome} e agendei minha visita para {dia} às {hora}.”",
  },
] as const;

export default async function WhatsappPage() {
  const s = await getSettings();
  const national = s.whatsapp.number.replace(/^55/, "");
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black uppercase italic text-white">WhatsApp</h1>
        <p className="text-sm text-white/60">Número que recebe os contatos do site e as mensagens que já vão escritas em cada botão.</p>
      </div>
      <Card>
        <ActionForm action={saveWhatsappAction}>
          <Field label="Número do WhatsApp (com DDD)" hint="O número não aparece no site: ele só é usado nos links dos botões.">
            <input name="number" defaultValue={formatBrPhone(national)} inputMode="tel" className={inputCls} required />
          </Field>
          {MESSAGES.map((m) => (
            <Field key={m.key} label={m.label} hint={m.where}>
              <textarea name={m.key} defaultValue={s.whatsapp.messages[m.key]} rows={2} maxLength={600} className={inputCls} required />
            </Field>
          ))}
        </ActionForm>
      </Card>
    </div>
  );
}
