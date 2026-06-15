"use client";

import * as React from "react";
import { PageHeader, Panel, Stat, Tag } from "@/components/app-shell";
import { useToast } from "@/components/feedback/toast-provider";
import { getViolacoes, type PainelViolacoes } from "@/lib/violacoes";
import { isApiClientError } from "@/lib/api-client";
import { maskCpf } from "@/lib/cpf";

function formatarDataHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ViolacoesPage() {
  const toast = useToast();

  const [painel, setPainel] = React.useState<PainelViolacoes | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erroCarga, setErroCarga] = React.useState<string | null>(null);

  const carregarDados = React.useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      const dados = await getViolacoes();
      setPainel(dados);
    } catch (err) {
      const detail = isApiClientError(err)
        ? err.detail
        : err instanceof Error
          ? err.message
          : "Erro ao carregar violações";
      setErroCarga(detail);
      toast.push({
        variant: "destructive",
        title: "Falha ao carregar violações",
        description: detail,
      });
    } finally {
      setCarregando(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const total = painel?.total ?? 0;
  const etapasAfetadas = painel?.porEtapa.length ?? 0;
  const ocorrencias = painel?.ocorrencias ?? [];
  const porEtapa = painel?.porEtapa ?? [];

  return (
    <>
      <PageHeader
        title="Violações"
        description="Tentativas de cola detectadas no Modo Seguro, por etapa e por aluno"
      />

      <section className="grid grid-cols-2 gap-4 px-8 py-6">
        <Stat
          label="Total de ocorrências"
          value={total}
          accent="rose"
          hint="Registradas no Modo Seguro"
        />
        <Stat
          label="Etapas afetadas"
          value={etapasAfetadas}
          accent="amber"
          hint="Etapas com ao menos 1 ocorrência"
        />
      </section>

      <section className="px-8 pb-6">
        <Panel>
          <h2 className="pb-4 text-sm font-semibold text-white">Por etapa</h2>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Etapa</th>
                  <th className="px-4 py-3 font-medium">Ocorrências</th>
                  <th className="px-4 py-3 font-medium">Alunos envolvidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {carregando ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-white/40">
                      Carregando violações...
                    </td>
                  </tr>
                ) : erroCarga ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-rose-300">
                      {erroCarga}
                    </td>
                  </tr>
                ) : porEtapa.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-white/40">
                      Nenhuma violação registrada até o momento.
                    </td>
                  </tr>
                ) : (
                  porEtapa.map((e) => (
                    <tr key={e.simuladoId} className="text-white/80">
                      <td className="px-4 py-3 font-medium text-white">{e.etapaTitulo}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-rose-300">
                        {e.totalViolacoes}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-white/70">
                        {e.alunosEnvolvidos}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="px-8 pb-8">
        <Panel>
          <h2 className="pb-4 text-sm font-semibold text-white">Ocorrências recentes</h2>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Data/hora</th>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">Etapa</th>
                  <th className="px-4 py-3 font-medium">Ocorrência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {carregando ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-white/40">
                      Carregando violações...
                    </td>
                  </tr>
                ) : erroCarga ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-rose-300">
                      {erroCarga}
                    </td>
                  </tr>
                ) : ocorrencias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-white/40">
                      Nenhuma ocorrência registrada.
                    </td>
                  </tr>
                ) : (
                  ocorrencias.map((o) => (
                    <tr key={o.id} className="text-white/80">
                      <td className="px-4 py-3 font-mono text-xs text-white/60">
                        {formatarDataHora(o.criadoEm)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{o.alunoNome}</span>
                          <span className="font-mono text-[10px] text-white/40">
                            {maskCpf(o.alunoCpf)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span>{o.etapaTitulo}</span>
                          <span className="text-xs text-white/40">{o.componenteNome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Tag tone="rose">{o.tipo}</Tag>
                          {o.detalhe && (
                            <span className="text-xs text-white/50">{o.detalhe}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </>
  );
}
