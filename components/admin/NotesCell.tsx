"use client";

import { useState, useTransition } from "react";
import { saveLeadNotesAction } from "@/app/admin/actions";

/** Observações do lead: editável direto na tabela (salva ao sair do campo). */
export function NotesCell({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  const save = () => {
    if (value === saved) return;
    start(async () => {
      const r = await saveLeadNotesAction(id, value);
      if (r?.error) setMsg(r.error);
      else {
        setSaved(value);
        setMsg("Salvo");
        setTimeout(() => setMsg(""), 1800);
      }
    });
  };

  return (
    <div className="w-[240px]">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        rows={2}
        maxLength={1000}
        placeholder="Adicionar observação"
        className="w-full resize-y border border-white/10 bg-transparent px-2 py-1 text-xs leading-snug text-white/80 outline-none placeholder:text-white/30 focus:border-[#ff6a13]"
      />
      <span className="block h-4 text-[11px] text-white/45">{pending ? "Salvando..." : msg}</span>
    </div>
  );
}
