"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/feedback/toast-provider";
import { getQuestoesProfessor, type ProfessorQuestao } from "@/lib/professor";

const dificuldadeTone = (d: string) =>
  d === "FACIL" ? "emerald" : d === "MEDIO" ? "amber" : "rose";

export default function BancoQuestoes() {
  const toast = useToast();

  const [questoes, setQuestoes] = React.useState<ProfessorQuestao[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erroCarga, setErroCarga] = React.useState<string | null>(null);

  const carregarDados = React.useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      setQuestoes(await getQuestoesProfessor());
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Erro ao carregar questões";
      setErroCarga(detail);
      toast.push({
        variant: "destructive",
        title: "Falha ao carregar questões",
        description: detail,
      });
    } finally {
      setCarregando(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  return (
    <>
      <PageHeader
        title="Banco de questões"
        description="Suas questões — filtre por assunto e dificuldade"
        action={
          <Link href="/professor/questoes/nova">
            <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
              <Icon.Plus />
              Nova questão
            </Button>
          </Link>
        }
      />

      <section className="px-8 py-6">
        <Panel>
          <p className="pb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
            {carregando ? "carregando…" : `${questoes.length} questões`}
          </p>

          {carregando ? (
            <p className="px-1 py-10 text-center text-sm text-white/40">Carregando questões...</p>
          ) : erroCarga ? (
            <p className="px-1 py-10 text-center text-sm text-rose-300">{erroCarga}</p>
          ) : questoes.length === 0 ? (
            <p className="px-1 py-10 text-center text-sm text-white/40">
              Você ainda não tem questões cadastradas.
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
                      <Tag tone="blue">{q.assunto}</Tag>
                      <span className="text-[10px] text-white/30">{q.componente}</span>
                      {!q.ativa && <Tag tone="slate">inativa</Tag>}
                    </div>
                    <p className="text-sm text-white/80">{q.enunciado}</p>
                    <p className="text-xs text-white/40">
                      {q.totalAlternativas} alternativas · 1 correta
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </>
  );
}
