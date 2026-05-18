"use client";

import { cn } from "@/lib/utils";

type StepperProps = {
  passoAtual: 1 | 2 | 3;
};

const PASSOS = [
  { numero: 1 as const, titulo: "Identificação" },
  { numero: 2 as const, titulo: "Janela e Vagas" },
  { numero: 3 as const, titulo: "Composição" },
];

export function Stepper({ passoAtual }: StepperProps) {
  return (
    <div className="flex items-center gap-2">
      {PASSOS.map((passo, index) => {
        const completo = passo.numero < passoAtual;
        const ativo = passo.numero === passoAtual;
        const eUltimo = index === PASSOS.length - 1;

        return (
          <div key={passo.numero} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  completo &&
                    "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
                  ativo &&
                    "border-amber-400/60 bg-amber-400/15 text-amber-200",
                  !completo &&
                    !ativo &&
                    "border-white/10 bg-white/[0.03] text-white/40",
                )}
              >
                {completo ? "✓" : passo.numero}
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase tracking-[0.14em]",
                    completo && "text-emerald-300/60",
                    ativo && "text-amber-300/80",
                    !completo && !ativo && "text-white/30",
                  )}
                >
                  Passo {passo.numero}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    completo && "text-white/70",
                    ativo && "text-white",
                    !completo && !ativo && "text-white/40",
                  )}
                >
                  {passo.titulo}
                </span>
              </div>
            </div>

            {!eUltimo && (
              <div
                className={cn(
                  "mx-2 h-px flex-1 transition-colors",
                  completo ? "bg-emerald-400/30" : "bg-white/10",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}