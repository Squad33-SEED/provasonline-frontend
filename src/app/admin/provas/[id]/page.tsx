"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/feedback/toast-provider";
import { getRelatorioEtapa, getSimulados, type RelatorioEtapa } from "@/lib/simulados";
import { isApiClientError } from "@/lib/api-client";
import type { Simulado } from "@/lib/types";

function csvCampo(v: string | number | null): string {
  const s = v === null || v === undefined ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function numBr(n: number | null): string {
  return n === null || n === undefined ? "" : String(n).replace(".", ",");
}

function dataBr(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

function montarCsv(rel: RelatorioEtapa): string {
  const linhas: string[] = [];
  linhas.push(["Etapa", rel.titulo].map(csvCampo).join(";"));
  linhas.push(["Componente", rel.componente].map(csvCampo).join(";"));
  linhas.push(["Inscritos", rel.inscritos].map(csvCampo).join(";"));
  linhas.push(["Total de alunos", rel.totalAlunos].map(csvCampo).join(";"));
  linhas.push(["Finalizados", rel.finalizados].map(csvCampo).join(";"));
  linhas.push(["Média geral", numBr(rel.mediaNota)].map(csvCampo).join(";"));
  linhas.push(["% acerto médio", numBr(rel.percentualAcerto)].map(csvCampo).join(";"));
  linhas.push("");
  linhas.push(
    ["Nome", "CPF", "Turma", "Nota", "Acertos", "Status", "Finalizado em"]
      .map(csvCampo)
      .join(";"),
  );
  for (const i of rel.itens) {
    const acertos = i.acertos === null ? "" : `${i.acertos}/${i.total}`;
    linhas.push(
      [
        i.alunoNome,
        i.alunoCpf,
        i.turma ?? "",
        numBr(i.nota),
        acertos,
        i.statusResultado,
        dataBr(i.finalizadoEm),
      ]
        .map(csvCampo)
        .join(";"),
    );
  }
  return linhas.join("\r\n");
}

function baixarCsv(nomeArquivo: string, conteudo: string) {
  const blob = new Blob(["﻿" + conteudo], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function nomeArquivo(titulo: string): string {
  const slug = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const data = new Date().toISOString().slice(0, 10);
  return `relatorio_${slug || "etapa"}_${data}.csv`;
}

export default function DetalheEtapaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [simulado, setSimulado] = React.useState<Simulado | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [gerando, setGerando] = React.useState(false);

  async function gerarRelatorio() {
    setGerando(true);
    try {
      const rel = await getRelatorioEtapa(id);
      baixarCsv(nomeArquivo(rel.titulo), montarCsv(rel));
      toast.push({
        variant: "success",
        title: "Relatório gerado",
        description: `${rel.totalAlunos} aluno(s) · ${rel.finalizados} finalizado(s).`,
      });
    } catch (err) {
      const detail = isApiClientError(err)
        ? err.detail
        : "Erro ao gerar relatório";
      toast.push({
        variant: "destructive",
        title: "Falha ao gerar relatório",
        description: detail,
      });
    } finally {
      setGerando(false);
    }
  }

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
          <div className="flex items-center gap-2">
            <Button
              onClick={gerarRelatorio}
              disabled={gerando || !simulado}
              className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {gerando ? "Gerando..." : "Gerar relatório (CSV)"}
            </Button>
            <Link href="/admin/provas">
              <Button
                variant="ghost"
                className="text-white/70 hover:bg-white/[0.05] hover:text-white"
              >
                ← Voltar
              </Button>
            </Link>
          </div>
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
                  <span className={simulado.totalInscritos > 0 ? "text-amber-300" : ""}>
                    {simulado.totalInscritos}
                  </span>
                  <span className="text-white/30"> / </span>
                  {simulado.vagas}
                </p>
                <p
                  className={`mt-2 text-[10px] ${
                    simulado.vagasDisponiveis <= 0
                      ? "text-rose-400/70"
                      : "text-white/40"
                  }`}
                >
                  {simulado.vagasDisponiveis <= 0
                    ? "Vagas esgotadas"
                    : `${simulado.vagasDisponiveis} disponíveis`}
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