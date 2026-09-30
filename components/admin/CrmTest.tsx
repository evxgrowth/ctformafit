"use client";

import { useState, useTransition } from "react";
import { sendCrmTestLeadAction, testCrmConnectionAction, type ActionState } from "@/app/admin/actions";
import { Msg } from "./ui";

export function CrmTest({ disabled }: { disabled: boolean }) {
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<"conn" | "lead" | null>(null);
  const [state, setState] = useState<ActionState>(undefined);

  const run = (kind: "conn" | "lead") => {
    if (kind === "lead" && !confirm("Isso cria um lead de teste no EVX com o WhatsApp do próprio CT (e pode disparar a mensagem automática de boas-vindas para esse número). Continuar?")) return;
    setWhich(kind);
    setState(undefined);
    start(async () => setState(kind === "conn" ? await testCrmConnectionAction() : await sendCrmTestLeadAction()));
  };

  const btn =
    "border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#ff6a13] hover:text-[#ff8a3d] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} disabled={disabled || pending} onClick={() => run("conn")}>
          {pending && which === "conn" ? "Testando..." : "Testar conexão"}
        </button>
        <button type="button" className={btn} disabled={disabled || pending} onClick={() => run("lead")}>
          {pending && which === "lead" ? "Enviando..." : "Enviar lead de teste"}
        </button>
      </div>
      <p className="text-xs leading-relaxed text-white/50">
        <b className="text-white/70">Testar conexão</b> confere o token sem criar nada no CRM. <b className="text-white/70">Enviar lead de teste</b> cria um
        lead de verdade no EVX, que você pode excluir depois.
      </p>
      {disabled && <p className="text-xs text-amber-200">Salve o token primeiro para liberar os testes.</p>}
      <Msg state={state} />
    </div>
  );
}
