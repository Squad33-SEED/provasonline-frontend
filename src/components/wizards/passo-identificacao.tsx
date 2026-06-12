"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getNiveis, getTurmas } from "@/lib/simulados";
import type { NivelCatalogo, Turma } from "@/lib/types";
import type { WizardAction, WizardState } from "@/lib/wizard-state";

type Props = {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
};

export function PassoIdentificacao({ state, dispatch }: Props) {
  const { passo1, componentes, carregandoComponentes } = state;

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [carregandoTurmas, setCarregandoTurmas] = useState(true);
  const [niveis, setNiveis] = useState<NivelCatalogo[]>([]);

  useEffect(() => {
    getTurmas()
      .then(setTurmas)
      .catch(() => setTurmas([]))
      .finally(() => setCarregandoTurmas(false));

    getNiveis()
      .then(setNiveis)
      .catch(() => setNiveis([]));
  }, []);

  function aoToggleTurma(turmaId: string) {
    dispatch({ type: "TOGGLE_TURMA", turmaId });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-white">
          Identificação da etapa
        </h3>
        <p className="mt-1 text-sm text-white/55">
          Defina como a etapa será identificada para alunos e gestores.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="wizard-titulo" className="text-xs text-white/70">
          Título da etapa
        </Label>
        <Input
          id="wizard-titulo"
          value={passo1.titulo}
          onChange={(e) =>
            dispatch({
              type: "ATUALIZAR_PASSO_1",
              campo: "titulo",
              valor: e.target.value,
            })
          }
          placeholder="Diagnóstica de Matemática — 1º Bimestre 2026"
          maxLength={200}
          className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
        />
        <p className="text-[11px] text-white/40">
          Mínimo 3 caracteres. Será exibido no painel do aluno.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="wizard-descricao" className="text-xs text-white/70">
          Descrição{" "}
          <span className="font-normal text-white/40">(opcional)</span>
        </Label>
        <Textarea
          id="wizard-descricao"
          value={passo1.descricao}
          onChange={(e) =>
            dispatch({
              type: "ATUALIZAR_PASSO_1",
              campo: "descricao",
              valor: e.target.value,
            })
          }
          placeholder="Avaliação inicial para alinhamento de conhecimento prévio antes do 2º bimestre."
          maxLength={2000}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-white/70">
            Componentes curriculares
          </Label>

          {passo1.componenteIds.length > 0 && (
            <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
              {passo1.componenteIds.length} selecionado
              {passo1.componenteIds.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2">
          {carregandoComponentes ? (
            <p className="text-[11px] text-white/40">
              Carregando componentes...
            </p>
          ) : componentes.length === 0 ? (
            <p className="text-[11px] text-white/40">
              Nenhum componente cadastrado.
            </p>
          ) : (
            componentes.map((c) => {
              const selecionado = passo1.componenteIds.includes(c.id);

              return (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-white/[0.04]"
                >
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() =>
                      dispatch({
                        type: "TOGGLE_COMPONENTE",
                        id: c.id,
                        nome: `${c.nome} · ${c.modalidade.nome}`,
                      })
                    }
                    className="h-3.5 w-3.5 shrink-0 accent-amber-400"
                  />

                  <span className="text-xs font-medium text-white/80">
                    {c.nome} · {c.modalidade.nome}
                  </span>
                </label>
              );
            })
          )}
        </div>

        <p className="text-[11px] text-white/40">
          Selecione um ou mais componentes. A disponibilidade de questões será
          verificada automaticamente no próximo passo.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={passo1.geraCertificado}
            onChange={(e) =>
              dispatch({
                type: "SET_GERA_CERTIFICADO",
                valor: e.target.checked,
              })
            }
            className="h-3.5 w-3.5 shrink-0 accent-amber-400"
          />
          <span className="flex flex-col">
            <span className="text-xs font-medium text-white/80">
              Esta etapa gera certificado
            </span>
            <span className="text-[10px] text-white/40">
              Aprovados acumulam para o certificado de conclusão do nível
            </span>
          </span>
        </label>

        {passo1.geraCertificado && (
          <div className="flex flex-col gap-3 pl-6">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-white/70">Nível certificado</Label>
              <Select
                value={passo1.nivelEnsinoId}
                onValueChange={(v) =>
                  dispatch({
                    type: "ATUALIZAR_PASSO_1",
                    campo: "nivelEnsinoId",
                    valor: v,
                  })
                }
                disabled={niveis.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  {niveis.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wizard-nota-min" className="text-xs text-white/70">
                Nota mínima por componente
              </Label>
              <Input
                id="wizard-nota-min"
                value={passo1.notaMinimaCertificacao}
                onChange={(e) =>
                  dispatch({
                    type: "ATUALIZAR_PASSO_1",
                    campo: "notaMinimaCertificacao",
                    valor: e.target.value,
                  })
                }
                className="h-10 w-28 rounded-lg border-white/10 bg-white/[0.03] text-white"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-white/70">
            Turmas vinculadas{" "}
            <span className="font-normal text-white/40">(opcional)</span>
          </Label>
          {passo1.turmaIds.length > 0 && (
            <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
              {passo1.turmaIds.length} selecionada
              {passo1.turmaIds.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {carregandoTurmas ? (
          <p className="text-[11px] text-white/40">Carregando turmas...</p>
        ) : turmas.length === 0 ? (
          <p className="text-[11px] text-white/40">
            Nenhuma turma cadastrada. Crie turmas primeiro.
          </p>
        ) : (
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2">
            {turmas.map((turma) => {
              const selecionada = passo1.turmaIds.includes(turma.id);
              return (
                <label
                  key={turma.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-white/[0.04]"
                >
                  <input
                    type="checkbox"
                    checked={selecionada}
                    onChange={() => aoToggleTurma(turma.id)}
                    className="h-3.5 w-3.5 shrink-0 accent-amber-400"
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-medium text-white/80">
                      {turma.nome}
                    </span>
                    <span className="truncate text-[10px] text-white/40">
                      {turma.escola.nome} · {turma.anoLetivo}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-white/40">
          Sem turmas selecionadas, a etapa ficará visível para todos os alunos.
        </p>
      </div>
    </div>
  );
}