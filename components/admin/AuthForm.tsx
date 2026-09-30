"use client";

import Image from "next/image";
import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { Field, Msg, Submit } from "./ui";
import { inputCls } from "./styles";

export function AuthForm({
  action,
  title,
  subtitle,
  withName,
  submitLabel,
}: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  title: string;
  subtitle: string;
  withName?: boolean;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <main className="grid min-h-[100svh] place-items-center bg-[#070707] px-4">
      <div className="w-full max-w-sm">
        <div className="relative mx-auto h-24 w-40">
          <Image src="/images/logo-formafit.png" alt="CT Forma Fit" fill sizes="160px" className="object-contain" priority />
        </div>
        <h1 className="mt-6 text-center font-display text-4xl font-black uppercase italic text-white">{title}</h1>
        <p className="mt-1 text-center text-sm text-[#a3a09a]">{subtitle}</p>
        <form action={formAction} className="mt-8 space-y-4 border border-white/10 bg-[#111] p-6">
          {withName && (
            <Field label="Nome">
              <input name="name" required autoComplete="name" className={inputCls} />
            </Field>
          )}
          <Field label="E-mail">
            <input name="email" type="email" required autoComplete="email" className={inputCls} />
          </Field>
          <Field label="Senha" hint={withName ? "Mínimo de 8 caracteres." : undefined}>
            <input name="password" type="password" required autoComplete={withName ? "new-password" : "current-password"} className={inputCls} />
          </Field>
          <Msg state={state} />
          <Submit className="w-full">{submitLabel}</Submit>
        </form>
      </div>
    </main>
  );
}
