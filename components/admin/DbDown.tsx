export function DbDown({ detail }: { detail?: string }) {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-[#070707] px-4 text-center">
      <div className="max-w-md border border-amber-500/40 bg-amber-500/5 p-6">
        <h1 className="font-display text-3xl font-black uppercase italic text-white">Banco de dados fora do ar</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          O painel não conseguiu se conectar ao Supabase agora. Seus acessos e dados não foram apagados. O site continua funcionando e os botões do
          WhatsApp seguem normais. Tente de novo em alguns minutos.
        </p>
        {detail && <p className="mt-3 font-mono text-xs text-white/40">{detail}</p>}
      </div>
    </main>
  );
}
