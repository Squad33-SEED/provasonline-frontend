"use client";

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
import type { WizardAction, WizardState } from "@/lib/wizard-state";

type Props = {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
};

export function PassoIdentificacao({ state, dispatch }: Props) {
  const { passo1, componentes, carregandoComponentes } = state;

  function aoSelecionarComponente(id: string) {
    const componente = componentes.find((c) => c.id === id);
    if (componente) {
      dispatch({
        type: "SELECIONAR_COMPONENTE",
        id: componente.id,
        nome: `${componente.nome} · ${componente.modalidade.nome}`,
      });
    }
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
        <Label className="text-xs text-white/70">Componente curricular</Label>
        <Select
          value={passo1.componenteId}
          onValueChange={aoSelecionarComponente}
          disabled={carregandoComponentes || componentes.length === 0}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                carregandoComponentes
                  ? "Carregando componentes..."
                  : "Selecione um componente"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {componentes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome} · {c.modalidade.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-white/40">
          A disponibilidade de questões será verificada automaticamente no
          próximo passo.
        </p>
      </div>
    </div>
  );
}