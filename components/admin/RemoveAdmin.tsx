"use client";

import { useState, useTransition } from "react";
import { removeAdminAction } from "@/app/admin/actions";

export function RemoveAdmin({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  return (
    <span className="flex items-center gap-2">
      {err && <span className="text-xs text-red-300">{err}</span>}
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm(`Remover o acesso de ${name}?`)) return;
          start(async () => {
            const r = await removeAdminAction(id);
            if (r?.error) setErr(r.error);
          });
        }}
        className="border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:border-red-400 hover:text-red-300 disabled:opacity-50"
      >
        {pending ? "Removendo..." : "Remover"}
      </button>
    </span>
  );
}
