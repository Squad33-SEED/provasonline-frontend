"use client";

import { Slider } from "@/components/ui/slider";
import { passo3Valido, type WizardAction, type WizardState } from "@/lib/wizard-state";

type Props = {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
};

export function PassoComposicao({ state, dispatch }: Props) {
  const { passo1, passo3, disponibilidade, carregandoDisponibilidade } = state;

  if (carregandoDisponibilidade) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-white/40">
        Carregando disponibilidade do banco de questões...
      </div>
    );
  }

  if (!disponibilidade) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-rose-300">
        Não foi possível carregar a disponibilidade. Volte ao Passo 1 e
        selecione novamente o componente.
      </div>
    );
  }

  const totalQuestoes = passo3.qtdFacil + passo3.qtdMedio + passo3.qtdDificil;
  const valido = passo3Valido(state);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-white">
          Composição da etapa
        </h3>
        <p className="mt-1 text-sm text-white/55">
          Defina quantas questões de cada nível de dificuldade serão sorteadas
          do banco para cada aluno.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          Componente selecionado
        </p>
        <p className="mt-1 text-sm font-medium text-white">
          {passo1.componenteNome}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <SliderDificuldade
          label="Fáceis"
          tom="emerald"
          quantidade={passo3.qtdFacil}
          maximo={disponibilidade.facil}
          onChange={(valor) =>
            dispatch({
              type: "ATUALIZAR_PASSO_3",
              campo: "qtdFacil",
              valor,
            })
          }
        />
        <SliderDificuldade
          label="Médias"
          tom="amber"
          quantidade={passo3.qtdMedio}
          maximo={disponibilidade.medio}
          onChange={(valor) =>
            dispatch({
              type: "ATUALIZAR_PASSO_3",
              campo: "qtdMedio",
              valor,
            })
          }
        />
        <SliderDificuldade
          label="Difíceis"
          tom="rose"
          quantidade={passo3.qtdDificil}
          maximo={disponibilidade.dificil}
          onChange={(valor) =>
            dispatch({
              type: "ATUALIZAR_PASSO_3",
              campo: "qtdDificil",
              valor,
            })
          }
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
            Total por aluno
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {totalQuestoes}
          </p>
        </div>

        <StatusBadge valido={valido} totalQuestoes={totalQuestoes} />
      </div>
    </div>
  );
}

function SliderDificuldade({
  label,
  tom,
  quantidade,
  maximo,
  onChange,
}: {
  label: string;
  tom: "emerald" | "amber" | "rose";
  quantidade: number;
  maximo: number;
  onChange: (valor: number) => void;
}) {
  const corLabel = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
  }[tom];

  const insuficiente = maximo === 0;
  const semQuestao = quantidade === 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${corLabel}`}>{label}</span>
        <span className="font-mono text-sm tabular-nums text-white/70">
          <span className="font-semibold text-white">{quantidade}</span>
          <span className="text-white/30"> / {maximo}</span>
          <span className="ml-1 text-xs text-white/40">disponíveis</span>
        </span>
      </div>

      <Slider
        value={[quantidade]}
        onValueChange={(values) => onChange(values[0])}
        min={0}
        max={Math.max(maximo, 1)}
        step={1}
        disabled={insuficiente}
      />

      {insuficiente && (
        <p className="text-[11px] text-rose-300/80">
          Nenhuma questão {label.toLowerCase()} disponível neste componente.
        </p>
      )}
      {!insuficiente && semQuestao && (
        <p className="text-[11px] text-white/30">
          Arraste para incluir questões {label.toLowerCase()} na etapa.
        </p>
      )}
    </div>
  );
}

function StatusBadge({
  valido,
  totalQuestoes,
}: {
  valido: boolean;
  totalQuestoes: number;
}) {
  if (totalQuestoes === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/50">
        Configure ao menos 1 questão
      </div>
    );
  }

  if (valido) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200">
        <span aria-hidden>✓</span>
        Configuração viável
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs font-medium text-rose-200">
      <span aria-hidden>⚠</span>
      Excede questões disponíveis
    </div>
  );
}