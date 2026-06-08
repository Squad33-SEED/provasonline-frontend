"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidCpf, maskCpf, unmaskCpf } from "@/lib/cpf";
import { roleHomePath, type Role } from "@/lib/auth";

function LoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isValidCpf(cpf)) {
      setError("CPF inválido");
      return;
    }

    if (senha.length < 1) {
      setError("Informe a senha");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: unmaskCpf(cpf),
          senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail ?? "Falha no login");
        return;
      }

      const next = search.get("next");

      const target =
        next && next.startsWith("/")
          ? next
          : roleHomePath(data.role as Role);

      router.replace(target);
      router.refresh();
    } catch {
      setError("Erro de rede");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dark relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#061024] text-foreground">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(148,163,184,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.3)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[560px] rounded-full bg-blue-600/[0.14] blur-[130px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 size-[360px] rounded-full bg-amber-400/[0.08] blur-[120px]"
      />

      <main className="relative z-10 flex w-full max-w-sm flex-col gap-8 px-6 py-10">
        <header className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="Secretaria de Estado da Educação — Sergipe"
            width={44}
            height={44}
            priority
            className="size-11 rounded-full object-cover ring-1 ring-white/15"
          />

          <div className="flex flex-col leading-tight">
            <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">
              Governo de Sergipe
            </span>

            <span className="text-sm font-semibold text-white">
              Secretaria da Educação
            </span>
          </div>
        </header>

        <section className="flex flex-col gap-7 rounded-xl border border-white/10 bg-white/[0.02] p-7">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Acesse sua conta
            </h1>

            <p className="text-sm text-white/50">
              Informe seu CPF e senha
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="cpf"
                className="text-xs font-medium text-white/70"
              >
                CPF
              </Label>

              <Input
                id="cpf"
                inputMode="numeric"
                autoComplete="username"
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                placeholder="000.000.000-00"
                required
                className="h-10 rounded-lg border-white/10 bg-white/[0.03] px-3 font-mono text-[14px] text-white placeholder:text-white/25 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="senha"
                className="text-xs font-medium text-white/70"
              >
                Senha
              </Label>

              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="h-10 rounded-lg border-white/10 bg-white/[0.03] px-3 text-[14px] text-white placeholder:text-white/25 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/20"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-10 w-full rounded-lg bg-amber-400 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300 disabled:opacity-60"
            >
              {loading ? "Autenticando..." : "Entrar"}
            </Button>
          </form>
        </section>

        <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
          Residência · Software II
        </p>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}