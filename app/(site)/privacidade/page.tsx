import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como o CT Forma Fit trata os dados enviados pelo site.",
  alternates: { canonical: "/privacidade" },
};

export default function Privacidade() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-bone/85 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-orange hover:underline">
        ← Voltar para o site
      </Link>
      <h1 className="display mt-6 text-6xl text-white">Política de privacidade</h1>
      <div className="mt-10 space-y-6 text-lg leading-relaxed">
        <p>
          Esta política explica como o CT Forma Fit Jardins trata os dados pessoais enviados por este site, conforme a Lei Geral de Proteção de Dados
          (Lei 13.709/2018).
        </p>
        <h2 className="display pt-4 text-3xl text-white">Quais dados coletamos</h2>
        <p>
          Quando você agenda uma visita, coletamos nome, número de WhatsApp, e-mail (se informado) e o dia e horário escolhidos. Esses dados podem ser
          salvos enquanto você preenche o formulário, mesmo antes da confirmação, para que a nossa equipe consiga retornar o seu contato. Também registramos
          informações de navegação (páginas visitadas, origem do acesso e dados de campanhas) para medir o desempenho do site.
        </p>
        <h2 className="display pt-4 text-3xl text-white">Para que usamos</h2>
        <p>
          Para confirmar e organizar a sua visita, entrar em contato pelo WhatsApp, apresentar planos e condições do CT e melhorar os nossos anúncios e o
          nosso atendimento. Os dados são registrados no nosso sistema de relacionamento com clientes (CRM).
        </p>
        <h2 className="display pt-4 text-3xl text-white">Cookies e ferramentas de terceiros</h2>
        <p>
          Podemos usar ferramentas de medição e publicidade, como o Pixel da Meta e o Google Analytics/Google Ads, que utilizam cookies. Você pode
          bloquear cookies nas configurações do seu navegador.
        </p>
        <h2 className="display pt-4 text-3xl text-white">Seus direitos</h2>
        <p>
          Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo nosso Instagram{" "}
          <a href={SITE.instagram} className="text-orange underline" target="_blank" rel="noopener noreferrer">
            {SITE.instagramHandle}
          </a>{" "}
          ou presencialmente no CT.
        </p>
        <p className="text-sm text-muted">Atualizada em setembro de 2026.</p>
      </div>
    </main>
  );
}
