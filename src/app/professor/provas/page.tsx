"use client";

import * as React from "react";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { useToast } from "@/components/feedback/toast-provider";
import { getResultadosProfessor, type ProfessorResultadoEtapa } from "@/lib/professor";

export default function ResultadosProfessor() {
  const toast = useToast();

  const [resultados, setResultados] = React.useState<ProfessorResultadoEtapa[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erroCarga, setErroCarga] = React.useState<string | null>(null);

  const carregarDados = React.useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      setResultados(await getResultadosProfessor());
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Erro ao carregar resultados";
      setErroCarga(detail);
      toast.push({
        variant: "destructive",
        title: "Falha ao carregar resultados",
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
        title="Resultados"
        description="Consolidado das etapas das suas turmas, com percentual de acerto"
      />

      <section className="px-8 py-6">
        <Panel>
          <h2 className="pb-4 text-sm font-semibold text-white">Etapas das suas turmas</h2>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Etapa</th>
                  <th className="px-4 py-3 font-medium">Componente</th>
                  <th className="px-4 py-3 font-medium">Finalizados</th>
                  <th className="px-4 py-3 font-medium">Média</th>
                  <th className="px-4 py-3 font-medium">Acerto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {carregando ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-white/40">
                      Carregando resultados...
                    </td>
                  </tr>
                ) : erroCarga ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-rose-300">
                      {erroCarga}
                    </td>
                  </tr>
                ) : resultados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-white/40">
                      Nenhuma etapa com resultados nas suas turmas ainda.
                    </td>
                  </tr>
                ) : (
                  resultados.map((r) => (
                    <tr key={r.simuladoId} className="text-white/80">
                      <td className="px-4 py-3 font-medium text-white">{r.etapaTitulo}</td>
                      <td className="px-4 py-3 text-white/70">{r.componente}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-white/70">
                        {r.finalizados}
                      </td>
                      <td className="px-4 py-3 font-mono text-base font-semibold tabular-nums text-amber-300">
                        {r.mediaNota !== null ? r.mediaNota.toFixed(1) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.percentualAcerto !== null ? (
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/5">
                              <div
                                className="h-full rounded-full bg-emerald-400"
                                style={{ width: `${Math.min(100, r.percentualAcerto)}%` }}
                              />
                            </div>
                            <span className="w-10 text-right font-mono text-xs text-white/50">
                              {Math.round(r.percentualAcerto)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
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
