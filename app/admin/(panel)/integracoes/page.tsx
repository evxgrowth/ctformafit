import { getSettings } from "@/lib/settings";
import { ActionForm, Card, Field, SecretInput, Toggle } from "@/components/admin/ui";
import { inputCls } from "@/components/admin/styles";
import { saveCrmAction, saveTrackingAction } from "../../actions";

export const metadata = { title: "Pixels e CRM" };

export default async function IntegracoesPage() {
  const s = await getSettings();
  const t = s.tracking;
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black uppercase italic text-white">Pixels e CRM</h1>
        <p className="text-sm text-white/60">Rastreamento de anúncios e envio automático de leads.</p>
      </div>

      <ActionForm action={saveTrackingAction} className="space-y-6" submitLabel="Salvar pixels e APIs">
        <Card
          title="Meta (Facebook e Instagram)"
          desc={
            <>
              Eventos enviados: <b>PageView</b> (visita), <b>Contact</b> (clique no WhatsApp), <b>Lead</b> (nome + WhatsApp preenchidos) e{" "}
              <b>Schedule</b> (agendamento confirmado). Pixel e API de Conversões usam o mesmo ID de evento, então a Meta não conta duas vezes.
            </>
          }
        >
          <div className="space-y-4">
            <Field label="ID do Pixel (conjunto de dados)" hint="Gerenciador de Eventos > Fontes de dados > ID (só números).">
              <input name="meta_pixel_id" defaultValue={t.meta_pixel_id} inputMode="numeric" className={inputCls} placeholder="123456789012345" />
            </Field>
            <Field label="Token da API de Conversões" hint="Gerenciador de Eventos > Configurações > API de Conversões > Gerar token de acesso.">
              <SecretInput name="meta_capi_token" isSet={Boolean(s.secrets.meta_capi_token)} placeholder="EAAB..." />
            </Field>
            <Field label="Código de evento de teste (opcional)" hint="Use só durante os testes (aba Testar eventos). Apague depois, senão os eventos não contam nas campanhas.">
              <input name="meta_test_event_code" defaultValue={t.meta_test_event_code} className={inputCls} placeholder="TEST12345" />
            </Field>
          </div>
        </Card>

        <Card
          title="Google"
          desc="GA4 mede o site. Se você preencher a chave secreta do Measurement Protocol, as conversões generate_lead e schedule_visit passam a ser enviadas pelo servidor (mais precisas, não são bloqueadas por bloqueadores de anúncio)."
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ID de métricas do GA4" hint="Ex.: G-ABC123XYZ">
                <input name="ga4_id" defaultValue={t.ga4_id} className={inputCls} placeholder="G-XXXXXXXXXX" />
              </Field>
              <Field label="Chave secreta do Measurement Protocol" hint="GA4 > Administrador > Fluxos de dados > Web > Chaves secretas.">
                <SecretInput name="ga4_api_secret" isSet={Boolean(s.secrets.ga4_api_secret)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ID do Google Ads" hint="Ex.: AW-123456789">
                <input name="google_ads_id" defaultValue={t.google_ads_id} className={inputCls} placeholder="AW-XXXXXXXXX" />
              </Field>
              <Field label="Google Tag Manager (opcional)" hint="Ex.: GTM-ABC123. Recebe os eventos ff_lead, ff_schedule e ff_whatsapp_click.">
                <input name="gtm_id" defaultValue={t.gtm_id} className={inputCls} placeholder="GTM-XXXXXXX" />
              </Field>
            </div>
            <p className="text-sm font-semibold text-white">Rótulos de conversão do Google Ads</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Agendamento confirmado">
                <input name="google_ads_label_schedule" defaultValue={t.google_ads_label_schedule} className={inputCls} placeholder="AbCdEf123" />
              </Field>
              <Field label="Lead (dados preenchidos)">
                <input name="google_ads_label_lead" defaultValue={t.google_ads_label_lead} className={inputCls} />
              </Field>
              <Field label="Clique no WhatsApp">
                <input name="google_ads_label_contact" defaultValue={t.google_ads_label_contact} className={inputCls} />
              </Field>
            </div>
            <p className="text-xs text-white/50">
              O rótulo é o texto depois da barra em send_to: “AW-123456789/<b>AbCdEf123</b>”. As conversões usam dados avançados (e-mail e telefone) quando
              disponíveis.
            </p>
          </div>
        </Card>
      </ActionForm>

      <Card
        title="EVX CRM"
        desc="Cada agendamento confirmado vai na hora para o CRM. Quem preencheu nome e WhatsApp mas não confirmou é enviado depois do tempo de espera abaixo, com a etiqueta de incompleto, para a equipe recuperar o contato."
      >
        <ActionForm action={saveCrmAction} submitLabel="Salvar integração">
          <Toggle name="enabled" defaultChecked={s.crm.enabled} label="Enviar leads para o CRM" />
          <Field label="Token da integração" hint="EVX > Configurações > Integrações > Landing pages > Nova landing page. Fica guardado só no servidor.">
            <SecretInput name="crm_token" isSet={Boolean(s.secrets.crm_token)} />
          </Field>
          <Field label="Endereço de envio">
            <input name="endpoint" defaultValue={s.crm.endpoint} className={`${inputCls} font-mono text-xs`} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Interesse (campo interest)">
              <input name="interest" defaultValue={s.crm.interest} className={inputCls} />
            </Field>
            <Field label="Unidade (campo unit)" hint="Deixe vazio para usar a unidade padrão da integração no EVX.">
              <input name="unit" defaultValue={s.crm.unit} className={inputCls} placeholder="Jardins" />
            </Field>
          </div>
          <Field label="Etiquetas de quem agendou" hint="Separe por vírgula.">
            <input name="tags_completed" defaultValue={s.crm.tags_completed.join(", ")} className={inputCls} />
          </Field>
          <Field label="Etiquetas de quem não concluiu" hint="Separe por vírgula.">
            <input name="tags_incomplete" defaultValue={s.crm.tags_incomplete.join(", ")} className={inputCls} />
          </Field>
          <Toggle name="send_incomplete" defaultChecked={s.crm.send_incomplete} label="Enviar também quem não concluiu o agendamento" />
          <Field label="Esperar quantos minutos antes de enviar um incompleto" hint="Dá tempo da pessoa terminar. Mínimo 15 é o recomendado: o CRM ignora o mesmo telefone por 10 minutos.">
            <input name="incomplete_delay_min" type="number" min={5} max={240} defaultValue={s.crm.incomplete_delay_min} className={inputCls} />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
