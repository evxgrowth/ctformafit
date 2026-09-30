"use client";

import { useState, useTransition } from "react";
import { deleteLeadAction, resendLeadAction, syncCrmNowAction } from "@/app/admin/actions";

export function LeadActions({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await resendLeadAction(id);
              setMsg(r?.error ? r.error : "Enviado");
            })
          }
          className="whitespace-nowrap border border-white/15 px-2 py-1 text-xs font-semibold text-white hover:border-[#ff6a13] hover:text-[#ff8a3d] disabled:opacity-50"
        >
          {pending ? "..." : "Reenviar ao CRM"}
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Excluir o lead "${name || "sem nome"}"? Isso não pode ser desfeito.`)) start(() => deleteLeadAction(id));
          }}
          className="px-2 py-1 text-xs text-white/40 hover:text-red-400"
          aria-label="Excluir lead"
        >
          Excluir
        </button>
      </div>
      {msg && <span className="max-w-[220px] text-right text-[11px] text-white/60">{msg}</span>}
    </div>
  );
}

export function SyncNow() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <span className="inline-flex items-center gap-3">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await syncCrmNowAction();
            setMsg(r?.message ?? "");
          })
        }
        className="border border-white/15 px-3 py-2 text-sm font-semibold text-white hover:border-[#ff6a13] disabled:opacity-50"
      >
        {pending ? "Processando..." : "Enviar pendentes ao CRM"}
      </button>
      {msg && <span className="text-sm text-white/60">{msg}</span>}
    </span>
  );
}
