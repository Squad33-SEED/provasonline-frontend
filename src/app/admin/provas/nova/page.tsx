"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { PageHeader, Panel } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/wizards/stepper";
import { PassoIdentificacao } from "@/components/wizards/passo-identificacao";
import { PassoJanela } from "@/components/wizards/passo-janela";
import { PassoComposicao } from "@/components/wizards/passo-composicao";
import { useToast } from "@/components/feedback/toast-provider";
import {
  criarSimulado,
  getComponentes,
  getDisponibilidade,
} from "@/lib/simulados";
import { isApiClientError } from "@/lib/api-client";
import {
  montarPayloadSubmit,
  passo1Valido,
  passo2Valido,
  podeConfirmar,
  useWizard,
} from "@/lib/wizard-state";

export default function NovaProvaPage() {
  const router = useRouter();
  const toast = useToast();
  const [state, dispatch] = useWizard();
  const [submetendo, setSubmetendo] = React.useState(false);

  const carregarComponentes = React.useCallback(async () => {
    dispatch({ type: "INICIAR_LOAD_COMPONENTES" });
    try {
      const componentes = await getComponentes();
      dispatch({ type: "SET_COMPONENTES", componentes });
    } catch (err) {
      const detail = isApiClientError(err)
        ? err.detail
        : "Erro ao carregar componentes";
      toast.push({
        variant: "destructive",
        title: "Falha ao carregar componentes",
        description: detail,
      });
    }
  }, [dispatch, toast]);

  React.useEffect(() => {
    void carregarComponentes();
  }, [carregarComponentes]);

  const carregarDisponibilidade = React.useCallback(
  async (componenteIds: string[]) => {
    dispatch({ type: "INICIAR_LOAD_DISPONIBILIDADE" });
    try {
      const disponibilidade = await getDisponibilidade(componenteIds);
      dispatch({ type: "SET_DISPONIBILIDADE", disponibilidade });
    } catch (err) {
      const detail = isApiClientError(err)
        ? err.detail
        : "Erro ao carregar disponibilidade de questões";
      toast.push({
        variant: "destructive",
        title: "Falha ao carregar disponibilidade",
        description: detail,
      });
    }
  },
  [dispatch, toast],
);

  function aoAvancar() {
    if (state.passoAtual === 1) {
      if (!passo1Valido(state)) return;
      if (!state.disponibilidade && state.passo1.componenteIds.length > 0) {
  void carregarDisponibilidade(state.passo1.componenteIds);
}
      dispatch({ type: "AVANCAR" });
      return;
    }
    if (state.passoAtual === 2) {
      if (!passo2Valido(state)) return;
      dispatch({ type: "AVANCAR" });
    }
  }

  function aoVoltar() {
    dispatch({ type: "VOLTAR" });
  }

  async function aoConfirmar() {
    if (!podeConfirmar(state)) return;

    const payload = montarPayloadSubmit(state);
    if (!payload) return;

    setSubmetendo(true);
    dispatch({ type: "LIMPAR_ERRO" });

    try {
      const simulado = await criarSimulado(payload);

      toast.push({
        variant: "success",
        title: "Etapa publicada com sucesso",
        description: `${simulado.titulo} · ${simulado.totalQuestoes} questões · ${simulado.vagas} vagas`,
        duration: 8000,
      });

      router.push("/admin/provas");
    } catch (err) {
      const apiErr = isApiClientError(err) ? err : null;
      const status = apiErr?.status;
      const detail = apiErr?.detail ?? "Erro ao publicar etapa";

      let mensagem: string;
      if (status === 422) {
        mensagem = detail;
      } else if (status === 403) {
        mensagem = "Acesso restrito a administradores";
      } else if (status === 401) {
        mensagem = "Sessão expirada. Faça login novamente.";
      } else {
        mensagem = detail;
      }

      dispatch({ type: "ERRO_SUBMIT", mensagem });
      toast.push({
        variant: "destructive",
        title: "Não foi possível publicar a etapa",
        description: mensagem,
      });
    } finally {
      setSubmetendo(false);
    }
  }

  function aoCancelar() {
    router.push("/admin/provas");
  }

  const podeAvancar =
    (state.passoAtual === 1 && passo1Valido(state)) ||
    (state.passoAtual === 2 && passo2Valido(state));

  const confirmarHabilitado = podeConfirmar(state) && !submetendo;

  return (
    <>
      <PageHeader
        title="Nova etapa"
        description="Configure a etapa em três passos: identificação, janela e composição"
      />

      <section className="px-8 py-6">
        <Panel>
          <div className="flex flex-col gap-6">
            <Stepper passoAtual={state.passoAtual} />

            <div className="border-t border-white/10 pt-6">
              {state.passoAtual === 1 && (
                <PassoIdentificacao state={state} dispatch={dispatch} />
              )}
              {state.passoAtual === 2 && (
                <PassoJanela state={state} dispatch={dispatch} />
              )}
              {state.passoAtual === 3 && (
                <PassoComposicao state={state} dispatch={dispatch} />
              )}
            </div>

            {state.erroSubmit && (
              <div
                role="alert"
                className="rounded-md border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200"
              >
                {state.erroSubmit}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={state.passoAtual === 1 ? aoCancelar : aoVoltar}
                disabled={submetendo}
                className="text-white/70 hover:bg-white/[0.05] hover:text-white"
              >
                {state.passoAtual === 1 ? "Cancelar" : "← Voltar"}
              </Button>

              {state.passoAtual < 3 ? (
                <Button
                  type="button"
                  onClick={aoAvancar}
                  disabled={!podeAvancar}
                  className="bg-amber-400 text-[#0c1a33] hover:bg-amber-300"
                >
                  Próximo →
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={aoConfirmar}
                  disabled={!confirmarHabilitado}
                  className="bg-amber-400 text-[#0c1a33] hover:bg-amber-300"
                >
                  {submetendo ? "Publicando..." : "✓ Publicar etapa"}
                </Button>
              )}
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}