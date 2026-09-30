"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/admin/actions";
import { inputCls } from "./styles";

export function Card({ title, desc, children, className = "" }: { title?: string; desc?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-white/10 bg-[#111] p-5 sm:p-6 ${className}`}>
      {title && <h2 className="font-display text-xl font-extrabold uppercase italic tracking-wide text-white">{title}</h2>}
      {desc && <p className="mt-1 text-sm leading-relaxed text-[#a3a09a]">{desc}</p>}
      <div className={title || desc ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs leading-relaxed text-[#a3a09a]">{hint}</span>}
    </label>
  );
}


export function SecretInput({ name, isSet, placeholder }: { name: string; isSet: boolean; placeholder?: string }) {
  const [editing, setEditing] = useState(!isSet);
  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <input type="hidden" name={name} value="__manter__" />
        <span className="flex-1 border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-[#a3a09a]">•••••••••••••• configurado</span>
        <button type="button" onClick={() => setEditing(true)} className="text-sm font-semibold text-[#ff8a3d] hover:underline">
          Trocar
        </button>
      </div>
    );
  }
  return <input name={name} type="password" autoComplete="off" placeholder={placeholder} className={`${inputCls} font-mono`} />;
}

export function Submit({ children = "Salvar", className = "" }: { children?: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center bg-[#ff6a13] px-5 py-2.5 font-display text-base font-extrabold uppercase italic tracking-wide text-black transition hover:bg-white disabled:opacity-50 [clip-path:polygon(3%_0,100%_4%,97%_100%,0_96%)] ${className}`}
    >
      {pending ? "Salvando..." : children}
    </button>
  );
}

export function Msg({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error)
    return (
      <p className="border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p className="border-l-2 border-emerald-500 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200" role="status">
        {state.message}
      </p>
    );
  return null;
}

export function ActionForm({
  action,
  children,
  className = "space-y-5",
  submitLabel = "Salvar",
}: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className={className}>
      {children}
      <Msg state={state} />
      <Submit>{submitLabel}</Submit>
    </form>
  );
}

export function Toggle({ name, defaultChecked, label, hint }: { name: string; defaultChecked?: boolean; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 bg-white/15 transition peer-checked:bg-[#ff6a13] peer-focus-visible:ring-2 peer-focus-visible:ring-white after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:bg-white after:transition peer-checked:after:translate-x-5" />
      <span>
        <span className="block text-sm font-semibold text-white">{label}</span>
        {hint && <span className="block text-xs text-[#a3a09a]">{hint}</span>}
      </span>
    </label>
  );
}
