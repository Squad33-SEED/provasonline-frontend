"use client";

import * as React from "react";
import { Copy, Check, ShieldAlert } from "lucide-react";

import { ToastTitle } from "@/components/ui/toast";

export function ConteudoSenhaProvisoria({
  nomeAluno,
  cpf,
  senhaProvisoria,
}: {
  nomeAluno: string;
  cpf: string;
  senhaProvisoria: string;
}) {
  const [copiado, setCopiado] = React.useState(false);

  const cpfFormatado = formatarCpf(cpf);

  async function copiarSenha() {
    try {
      await navigator.clipboard.writeText(senhaProvisoria);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-1">
        <ToastTitle className="flex items-center gap-2 text-emerald-200">
          <Check className="size-4" />
          Aluno cadastrado com sucesso
        </ToastTitle>
        <p className="text-xs text-white/70">
          {nomeAluno} · CPF {cpfFormatado}
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/[0.08] p-3">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-300/80">
            Senha provisória
          </p>
          <p className="font-mono text-lg font-semibold tabular-nums tracking-wider text-amber-100">
            {senhaProvisoria}
          </p>
        </div>
        <button
          type="button"
          onClick={copiarSenha}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1.5 text-xs font-medium text-amber-100 transition-colors hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
          aria-label="Copiar senha provisória"
        >
          {copiado ? (
            <>
              <Check className="size-3.5" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copiar
            </>
          )}
        </button>
      </div>

      <p className="text-xs leading-relaxed text-white/60">
        Padrão da senha:{" "}
        <span className="font-mono text-white/80">ddmmaaaa</span>{" "}
        da data de nascimento. O aluno será obrigado a trocar no primeiro
        acesso.
      </p>

      <div className="flex items-start gap-2 rounded-md border border-rose-500/20 bg-rose-950/30 p-2.5">
        <ShieldAlert className="size-4 shrink-0 text-rose-300" />
        <p className="text-[11px] leading-relaxed text-rose-100/85">
          Esta senha será exibida{" "}
          <span className="font-semibold">apenas uma vez</span>. Anote ou
          copie agora e informe diretamente ao aluno.
        </p>
      </div>
    </div>
  );
}

function formatarCpf(cpf: string): string {
  const limpo = cpf.replace(/\D/g, "");
  if (limpo.length !== 11) return cpf;
  return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
}