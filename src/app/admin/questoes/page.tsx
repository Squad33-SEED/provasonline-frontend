"use client";

import * as React from "react";
import { PageHeader, Panel, Stat, Tag } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/feedback/toast-provider";
import { isApiClientError } from "@/lib/api-client";
import {
  getComponentesQuestao,
  getQuestoes,
  toggleQuestao,
  type ComponenteOpcao,
  type QuestaoListItem,
} from "@/lib/questoes";

const dificuldadeTone = (d: string) =>
  d === "FACIL" ? "emerald" : d === "MEDIO" ? "amber" : "rose";

export default function BancoQuestoesAdmin() {
  const toast = useToast();

  const [questoes, setQuestoes] = React.useState<QuestaoListItem[]>([]);
  const [componentes, setComponentes] = React.useState<ComponenteOpcao[]>([]);
  const [filtroComp, setFiltroComp] = React.useState("");
  const [carregando, setCarregando] = React.useState(true);
  const [erroCarga, setErroCarga] = React.useState<string | null>(null);
  const [alternandoId, setAlternandoId] = React.useState<string | null>(null);

  const carregar = React.useCallback(
    async (componenteId: string) => {
      setCarregando(true);
      setErroCarga(null);
      try {
        setQuestoes(
          await getQuestoes(componenteId ? { componenteId } : undefined),
        );
      } catch (err) {
        const detail = isApiClientError(err)
          ? err.detail
          : "Erro ao carregar questões";
        setErroCarga(detail);
      } finally {
        setCarregando(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    void (async () => {
      try {
        setComponentes(await getComponentesQuestao());
      } catch {
        setComponentes([]);
      }
    })();
  }, []);

  React.useEffect(() => {
    void carregar(filtroComp);
  }, [carregar, filtroComp]);

  async function alternar(id: string) {
    setAlternandoId(id);
    try {
      const atualizada = await toggleQuestao(id);
      setQuestoes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ativa: atualizada.ativa } : q)),
      );
      toast.push({
        title: atualizada.ativa ? "Questão reativada" : "Questão desativada",
      });
    } catch (err) {
      const detail = isApiClientError(err)
        ? err.detail
        : "Erro ao alterar a questão";
      toast.push({
        variant: "destructive",
        title: "Não foi possível alterar",
        description: detail,
      });
    } finally {
      setAlternandoId(null);
    }
  }

  const total = questoes.length;
  const faceis = questoes.filter((q) => q.dificuldade === "FACIL").length;
  const medias = questoes.filter((q) => q.dificuldade === "MEDIO").length;
  const dificeis = questoes.filter((q) => q.dificuldade === "DIFICIL").length;

  const filtros = [{ id: "", nome: "Todos" }, ...componentes];

  return (
    <>
      <PageHeader
        title="Banco de questões"
        description="Visão consolidada de todas as questões cadastradas no sistema"
      />

      <section className="grid grid-cols-4 gap-4 px-8 py-6">
        <Stat label="Total de questões" value={total} accent="amber" hint="Conforme o filtro" />
        <Stat label="Fáceis" value={faceis} accent="emerald" />
        <Stat label="Médias" value={medias} accent="amber" />
        <Stat label="Difíceis" value={dificeis} accent="rose" />
      </section>

      <section className="px-8 pb-8">
        <Panel>
          <div className="flex items-center justify-between pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {filtros.map((c) => (
                <button
                  key={c.id || "todos"}
                  onClick={() => setFiltroComp(c.id)}
                  className={
                    filtroComp === c.id
                      ? "rounded-lg bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 ring-1 ring-amber-400/20"
                      : "rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                  }
                >
                  {c.nome}
                </button>
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
              {carregando ? "carregando…" : `${total} questões`}
            </span>
          </div>

          {carregando ? (
            <p className="px-1 py-10 text-center text-sm text-white/40">Carregando questões...</p>
          ) : erroCarga ? (
            <p className="px-1 py-10 text-center text-sm text-rose-300">{erroCarga}</p>
          ) : questoes.length === 0 ? (
            <p className="px-1 py-10 text-center text-sm text-white/40">
              Nenhuma questão cadastrada.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {questoes.map((q) => (
                <li
                  key={q.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Tag tone={dificuldadeTone(q.dificuldade)}>{q.dificuldade}</Tag>
                      <Tag tone="blue">{q.componente}</Tag>
                      <Tag tone="slate">{q.assunto}</Tag>
                      {!q.ativa && <Tag tone="rose">inativa</Tag>}
                    </div>
                    <p className="text-sm text-white/80">{q.enunciado}</p>
                    <p className="text-xs text-white/40">
                      {q.totalAlternativas} alternativas · 1 correta · Autor: {q.professorNome}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    disabled={alternandoId === q.id}
                    onClick={() => alternar(q.id)}
                    className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  >
                    {alternandoId === q.id
                      ? "..."
                      : q.ativa
                        ? "Desativar"
                        : "Reativar"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </>
  );
}
