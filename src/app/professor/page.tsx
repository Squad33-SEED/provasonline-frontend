"use client";

import * as React from "react";
import { PageHeader, Panel, Stat } from "@/components/app-shell";
import { useToast } from "@/components/feedback/toast-provider";
import {
  getQuestoesProfessor,
  getResultadosProfessor,
  getTurmasProfessor,
  type ProfessorQuestao,
  type ProfessorResultadoEtapa,
  type ProfessorTurma,
} from "@/lib/professor";

const DIFICULDADES: { chave: ProfessorQuestao["dificuldade"]; label: string; tone: string }[] = [
  { chave: "FACIL", label: "Fácil", tone: "bg-emerald-400" },
  { chave: "MEDIO", label: "Médio", tone: "bg-amber-400" },
  { chave: "DIFICIL", label: "Difícil", tone: "bg-rose-400" },
];

export default function ProfessorDashboard() {
  const toast = useToast();

  const [turmas, setTurmas] = React.useState<ProfessorTurma[]>([]);
  const [questoes, setQuestoes] = React.useState<ProfessorQuestao[]>([]);
  const [resultados, setResultados] = React.useState<ProfessorResultadoEtapa[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erroCarga, setErroCarga] = React.useState<string | null>(null);

  const carregarDados = React.useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      const [t, q, r] = await Promise.all([
        getTurmasProfessor(),
        getQuestoesProfessor(),
        getResultadosProfessor(),
      ]);
      setTurmas(t);
      setQuestoes(q);
      setResultados(r);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Erro ao carregar dados";
      setErroCarga(detail);
      toast.push({
        variant: "destructive",
        title: "Falha ao carregar dashboard",
        description: detail,
      });
    } finally {
      setCarregando(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const notas = resultados
    .map((r) => r.mediaNota)
    .filter((n): n is number => n !== null);
  const mediaTurmas =
    notas.length > 0
      ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1)
      : "—";

  const totalQuestoes = questoes.length;
  const distribuicao = DIFICULDADES.map((d) => ({
    ...d,
    valor: questoes.filter((q) => q.dificuldade === d.chave).length,
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral das suas turmas, questões e resultados"
      />

      <section className="grid grid-cols-4 gap-4 px-8 py-6">
        <Stat label="Minhas questões" value={carregando ? "…" : totalQuestoes} accent="amber" hint="No seu banco" />
        <Stat label="Turmas vinculadas" value={carregando ? "…" : turmas.length} accent="blue" hint="Sob sua responsabilidade" />
        <Stat label="Etapas avaliadas" value={carregando ? "…" : resultados.length} accent="emerald" hint="Com resultados" />
        <Stat label="Média das turmas" value={carregando ? "…" : mediaTurmas} accent="amber" hint="Etapas finalizadas" />
      </section>

      <section className="grid grid-cols-3 gap-4 px-8 pb-8">
        <Panel className="col-span-2">
          <h3 className="pb-4 text-sm font-semibold text-white">Resultados por etapa</h3>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Etapa</th>
                  <th className="px-4 py-3 font-medium">Componente</th>
                  <th className="px-4 py-3 font-medium">Finalizados</th>
                  <th className="px-4 py-3 font-medium">Média</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {carregando ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-white/40">
                      Carregando...
                    </td>
                  </tr>
                ) : erroCarga ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-rose-300">
                      {erroCarga}
                    </td>
                  </tr>
                ) : resultados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-white/40">
                      Nenhuma etapa com resultados nas suas turmas ainda.
                    </td>
                  </tr>
                ) : (
                  resultados.map((r) => (
                    <tr key={r.simuladoId} className="text-white/80">
                      <td className="px-4 py-3 font-medium text-white">{r.etapaTitulo}</td>
                      <td className="px-4 py-3 text-white/70">{r.componente}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-white/70">{r.finalizados}</td>
                      <td className="px-4 py-3 font-mono font-semibold tabular-nums text-amber-300">
                        {r.mediaNota !== null ? r.mediaNota.toFixed(1) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <h3 className="pb-4 text-sm font-semibold text-white">Distribuição por dificuldade</h3>
          <ul className="flex flex-col gap-3">
            {distribuicao.map((d) => (
              <li key={d.chave} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">{d.label}</span>
                  <span className="font-mono text-white/50">{d.valor}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${d.tone}`}
                    style={{ width: `${totalQuestoes > 0 ? (d.valor / totalQuestoes) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </>
  );
}
