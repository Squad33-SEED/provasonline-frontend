"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Tag } from "@/components/app-shell";
import {
  passo3Valido,
  type ModoComposicao,
  type WizardAction,
  type WizardState,
} from "@/lib/wizard-state";
import { getBancoQuestoesAdmin, type QuestaoBanco } from "@/lib/simulados";
import { isApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Props = {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
};

const DIF_LABEL: Record<QuestaoBanco["dificuldade"], string> = {
  FACIL: "Fácil",
  MEDIO: "Médio",
  DIFICIL: "Difícil",
};

const dificuldadeTone = (d: string) =>
  d === "FACIL" ? "emerald" : d === "MEDIO" ? "amber" : "rose";

export function PassoComposicao({ state, dispatch }: Props) {
  const { passo1, passo3 } = state;
  const modo = passo3.modo;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-white">Composição da etapa</h3>
        <p className="mt-1 text-sm text-white/55">
          Sorteie as questões automaticamente ou escolha questões específicas do
          banco.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          Componente selecionado
        </p>
        <p className="mt-1 text-sm font-medium text-white">{passo1.componenteNome}</p>
      </div>

      <div className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-1">
        <BotaoModo
          ativo={modo === "SORTEIO"}
          onClick={() => dispatch({ type: "SET_MODO_COMPOSICAO", modo: "SORTEIO" })}
          titulo="Sortear automaticamente"
          descricao="Quantidades por dificuldade"
        />
        <BotaoModo
          ativo={modo === "MANUAL"}
          onClick={() => dispatch({ type: "SET_MODO_COMPOSICAO", modo: "MANUAL" })}
          titulo="Escolher questões"
          descricao="Seleção específica do banco"
        />
      </div>

      {modo === "SORTEIO" ? (
        <SorteioView state={state} dispatch={dispatch} />
      ) : (
        <ManualView
          componenteId={passo1.componenteId}
          selecionadas={passo3.questaoIds}
          dispatch={dispatch}
        />
      )}

      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm text-white/75">
        <input
          type="checkbox"
          checked={passo3.embaralharAlternativas}
          onChange={(e) =>
            dispatch({ type: "SET_EMBARALHAR", valor: e.target.checked })
          }
          className="size-4 cursor-pointer rounded border-white/20 bg-white/[0.05] accent-amber-400"
        />
        Embaralhar a ordem das alternativas para cada aluno (anti-cola)
      </label>
    </div>
  );
}

function BotaoModo({
  ativo,
  onClick,
  titulo,
  descricao,
}: {
  ativo: boolean;
  onClick: () => void;
  titulo: string;
  descricao: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-start gap-0.5 rounded-md px-4 py-3 text-left transition-colors",
        ativo
          ? "bg-amber-400/10 ring-1 ring-amber-400/30"
          : "hover:bg-white/[0.04]",
      )}
    >
      <span className={cn("text-sm font-semibold", ativo ? "text-amber-200" : "text-white/80")}>
        {titulo}
      </span>
      <span className="text-xs text-white/40">{descricao}</span>
    </button>
  );
}

function SorteioView({ state, dispatch }: Props) {
  const { passo3, disponibilidade, carregandoDisponibilidade } = state;

  if (carregandoDisponibilidade) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-white/40">
        Carregando disponibilidade do banco de questões...
      </div>
    );
  }

  if (!disponibilidade) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-rose-300">
        Não foi possível carregar a disponibilidade. Volte ao Passo 1 e selecione
        novamente o componente.
      </div>
    );
  }

  const totalQuestoes = passo3.qtdFacil + passo3.qtdMedio + passo3.qtdDificil;
  const valido = passo3Valido(state);

  return (
    <div className="flex flex-col gap-6">
      <SliderDificuldade
        label="Fáceis"
        tom="emerald"
        quantidade={passo3.qtdFacil}
        maximo={disponibilidade.facil}
        onChange={(valor) => dispatch({ type: "ATUALIZAR_PASSO_3", campo: "qtdFacil", valor })}
      />
      <SliderDificuldade
        label="Médias"
        tom="amber"
        quantidade={passo3.qtdMedio}
        maximo={disponibilidade.medio}
        onChange={(valor) => dispatch({ type: "ATUALIZAR_PASSO_3", campo: "qtdMedio", valor })}
      />
      <SliderDificuldade
        label="Difíceis"
        tom="rose"
        quantidade={passo3.qtdDificil}
        maximo={disponibilidade.dificil}
        onChange={(valor) => dispatch({ type: "ATUALIZAR_PASSO_3", campo: "qtdDificil", valor })}
      />

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

function ManualView({
  componenteId,
  selecionadas,
  dispatch,
}: {
  componenteId: string;
  selecionadas: string[];
  dispatch: React.Dispatch<WizardAction>;
}) {
  const [questoes, setQuestoes] = React.useState<QuestaoBanco[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [filtro, setFiltro] = React.useState<"TODAS" | QuestaoBanco["dificuldade"]>("TODAS");

  React.useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    getBancoQuestoesAdmin(componenteId)
      .then((lista) => {
        if (ativo) setQuestoes(lista);
      })
      .catch((err) => {
        if (ativo) setErro(isApiClientError(err) ? err.detail : "Erro ao carregar questões");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [componenteId]);

  const visiveis =
    filtro === "TODAS" ? questoes : questoes.filter((q) => q.dificuldade === filtro);

  if (carregando) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-white/40">
        Carregando questões do componente...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-rose-300">{erro}</div>
    );
  }

  if (questoes.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-white/40">
        Este componente ainda não tem questões cadastradas.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {(["TODAS", "FACIL", "MEDIO", "DIFICIL"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filtro === f
                  ? "bg-amber-400/10 text-amber-200 ring-1 ring-amber-400/20"
                  : "border border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.05]",
              )}
            >
              {f === "TODAS" ? "Todas" : DIF_LABEL[f]}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-white/50">
          {selecionadas.length} selecionada(s)
        </span>
      </div>

      <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
        {visiveis.map((q) => {
          const marcada = selecionadas.includes(q.id);
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => dispatch({ type: "TOGGLE_QUESTAO", questaoId: q.id })}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  marcada
                    ? "border-amber-400/30 bg-amber-400/[0.06]"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border text-[10px]",
                    marcada
                      ? "border-amber-400 bg-amber-400 text-[#0c1a33]"
                      : "border-white/25",
                  )}
                >
                  {marcada ? "✓" : ""}
                </span>
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Tag tone={dificuldadeTone(q.dificuldade)}>{DIF_LABEL[q.dificuldade]}</Tag>
                    <Tag tone="blue">{q.assunto}</Tag>
                  </div>
                  <p className="text-sm text-white/80">{q.enunciado}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
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
