"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  montarDataHora,
  passo2Valido,
  type WizardAction,
  type WizardState,
} from "@/lib/wizard-state";

type Props = {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
};

export function PassoJanela({ state, dispatch }: Props) {
  const { passo2 } = state;

  const inicio = montarDataHora(passo2.dataInicio, passo2.horaInicio);
  const fim = montarDataHora(passo2.dataFim, passo2.horaFim);

  const valido = passo2Valido(state);

  let mensagem: { tipo: "info" | "erro"; texto: string } | null = null;
  if (passo2.dataInicio && passo2.dataFim && passo2.horaInicio && passo2.horaFim) {
    if (!inicio || !fim) {
      mensagem = { tipo: "erro", texto: "Data ou horário inválidos" };
    } else if (inicio >= fim) {
      mensagem = {
        tipo: "erro",
        texto: "Início da janela deve ser anterior ao fim",
      };
    } else if (inicio <= new Date()) {
      mensagem = {
        tipo: "erro",
        texto: "Início da janela deve estar no futuro",
      };
    } else {
      const dias = Math.ceil(
        (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24),
      );
      const duracao = passo2.duracaoMinutos
        ? `${passo2.duracaoMinutos} min por aluno`
        : "duração não definida";
      mensagem = {
        tipo: "info",
        texto: `Janela de ${dias} dia${dias > 1 ? "s" : ""} · ${duracao}`,
      };
    }
  }

  const dataMin = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-white">
          Janela de aplicação e vagas
        </h3>
        <p className="mt-1 text-sm text-white/55">
          Defina quando os alunos poderão realizar a etapa e quantas vagas estão
          disponíveis.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wizard-vagas" className="text-xs text-white/70">
            Vagas
          </Label>
          <Input
            id="wizard-vagas"
            type="number"
            inputMode="numeric"
            value={passo2.vagas}
            onChange={(e) =>
              dispatch({
                type: "ATUALIZAR_PASSO_2",
                campo: "vagas",
                valor: e.target.value,
              })
            }
            min={1}
            max={10000}
            className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
          />
          <p className="text-[11px] text-white/40">Entre 1 e 10.000</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wizard-duracao" className="text-xs text-white/70">
            Duração (minutos)
          </Label>
          <Input
            id="wizard-duracao"
            type="number"
            inputMode="numeric"
            value={passo2.duracaoMinutos}
            onChange={(e) =>
              dispatch({
                type: "ATUALIZAR_PASSO_2",
                campo: "duracaoMinutos",
                valor: e.target.value,
              })
            }
            min={15}
            max={240}
            className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
          />
          <p className="text-[11px] text-white/40">Entre 15 e 240 minutos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-white/70">Início da janela</Label>
          <div className="grid grid-cols-[1fr_100px] gap-2">
            <Input
              type="date"
              value={passo2.dataInicio}
              min={dataMin}
              onChange={(e) =>
                dispatch({
                  type: "ATUALIZAR_PASSO_2",
                  campo: "dataInicio",
                  valor: e.target.value,
                })
              }
              className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
            />
            <Input
              type="time"
              value={passo2.horaInicio}
              onChange={(e) =>
                dispatch({
                  type: "ATUALIZAR_PASSO_2",
                  campo: "horaInicio",
                  valor: e.target.value,
                })
              }
              className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-white/70">Fim da janela</Label>
          <div className="grid grid-cols-[1fr_100px] gap-2">
            <Input
              type="date"
              value={passo2.dataFim}
              min={passo2.dataInicio || dataMin}
              onChange={(e) =>
                dispatch({
                  type: "ATUALIZAR_PASSO_2",
                  campo: "dataFim",
                  valor: e.target.value,
                })
              }
              className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
            />
            <Input
              type="time"
              value={passo2.horaFim}
              onChange={(e) =>
                dispatch({
                  type: "ATUALIZAR_PASSO_2",
                  campo: "horaFim",
                  valor: e.target.value,
                })
              }
              className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
            />
          </div>
        </div>
      </div>

      {mensagem && (
        <div
          role={mensagem.tipo === "erro" ? "alert" : "status"}
          className={
            mensagem.tipo === "erro"
              ? "rounded-md border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200"
              : "rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm text-white/70"
          }
        >
          {mensagem.texto}
        </div>
      )}

      {!valido && !mensagem && (
        <p className="text-[11px] text-white/40">
          Preencha os campos para validar a janela de aplicação.
        </p>
      )}
    </div>
  );
}