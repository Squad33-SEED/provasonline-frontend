"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getSimulados } from "@/lib/simulados";
import type { Simulado } from "@/lib/types";

export default function DetalheEtapaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [simulado, setSimulado] = React.useState<Simulado | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    getSimulados()
      .then((lista) => {
        const encontrado = lista.find((s) => s.id === id) ?? null;
        if (!encontrado) setErro("Etapa não encontrada.");
        else setSimulado(encontrado);
      })
      .catch(() => setErro("Não foi possível carregar os detalhes da etapa."))
      .finally(() => setCarregando(false));
  }, [id]);

  return (
    <>
      <PageHeader
        title={simulado?.titulo ?? "Detalhes da etapa"}
        description="Configuração completa da etapa publicada"
        action={
          <Link href="/admin/provas">
            <Button
              variant="ghost"
              className="text-white/70 hover:bg-white/[0.05] hover:text-white"
            >
              ← Voltar
            </Button>
          </Link>
        }
      />

      <section className="px-8 py-6 space-y-4">
        {carregando && (
          <Panel>
            <p className="text-sm text-white/40">Carregando detalhes...</p>
          </Panel>
        )}

        {!carregando && erro && (
          <Panel>
            <p className="text-sm text-rose-300">{erro}</p>
            <button
              onClick={() => router.push("/admin/provas")}
              className="mt-3 text-xs text-white/50 underline hover:text-white/80"
            >
              Voltar para listagem
            </button>
          </Panel>
        )}

        {!carregando && simulado && (
          <>
            <Panel>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/40 mb-2">
                    Identificação
                  </p>
                  <h2 className="text-lg font-semibold text-white">
                    {simulado.titulo}
                  </h2>
                  {simulado.descricao && (
                    <p className="mt-1 text-sm text-white/50">
                      {simulado.descricao}
                    </p>
                  )}
                </div>
                <Tag>{simulado.status}</Tag>
              </div>
            </Panel>

            <div className="grid grid-cols-2 gap-4">
              <Panel>
                <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/40 mb-4">
                  Componente curricular
                </p>
                <p className="text-sm font-medium text-white">
                  {simulado.componente.nome}
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {simulado.componente.modalidade.nome}
                </p>
              </Panel>

              <Panel>
                <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/40 mb-4">
                  Janela de aplicação
                </p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest w-10">
                      Início
                    </span>
                    <span className="font-mono text-white">
                      {formatarDataHora(simulado.janelaInicio)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest w-10">
                      Fim
                    </span>
                    <span className="font-mono text-white">
                      {formatarDataHora(simulado.janelaFim)}
                    </span>
                  </div>
                </div>
              </Panel>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Panel>
                <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/40 mb-2">
                  Duração
                </p>
                <p className="text-2xl font-semibold tabular-nums text-white">
                  {simulado.duracaoMinutos}
                  <span className="ml-1 text-sm font-normal text-white/40">
                    min
                  </span>
                </p>
              </Panel>

              <Panel>
                <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/40 mb-2">
                  Questões
                </p>
                <p className="text-2xl font-semibold tabular-nums text-white">
                  {simulado.totalQuestoes}
                </p>
                <div className="mt-2 flex gap-2 text-[10px] text-white/40">
                  <span className="text-emerald-400/70">
                    F: {simulado.qtdFacil}
                  </span>
                  <span className="text-amber-400/70">
                    M: {simulado.qtdMedio}
                  </span>
                  <span className="text-rose-400/70">
                    D: {simulado.qtdDificil}
                  </span>
                </div>
              </Panel>

              <Panel>
                <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/40 mb-2">
                  Vagas
                </p>
                <p className="text-2xl font-semibold tabular-nums text-white">
                  {simulado.vagas}
                </p>
              </Panel>
            </div>

            <Panel>
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/40 mb-4">
                Turmas vinculadas
              </p>
              {simulado.turmas.length === 0 ? (
                <p className="text-sm text-white/40 italic">
                  Nenhuma turma específica — visível para todos os alunos.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-white/[0.05]">
                  {simulado.turmas.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-2.5"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white/80">
                          {t.nome}
                        </span>
                        <span className="text-xs text-white/40">
                          {t.escolaNome}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </>
        )}
      </section>
    </>
  );
}

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${hora}:${min}`;
}