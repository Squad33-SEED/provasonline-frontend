"use client";

import * as React from "react";

import { PageHeader, Panel, Stat, Tag } from "@/components/app-shell";
import { getDashboard, type DashboardResponse } from "@/lib/dashboard";

function formatarJanela(inicio: string, fim: string) {
  const formato = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formato.format(new Date(inicio))} — ${formato.format(new Date(fim))}`;
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = React.useState<DashboardResponse | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ativo = true;

    async function carregarDashboard(mostrarCarregando = false) {
      if (mostrarCarregando) {
        setCarregando(true);
      }

      setErro(null);

      try {
        const dados = await getDashboard();
        if (ativo) {
          setDashboard(dados);
        }
      } catch (error) {
        if (ativo) {
          setErro(error instanceof Error ? error.message : "Erro ao carregar dashboard");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarDashboard(true);

    const intervalo = window.setInterval(() => {
      void carregarDashboard();
    }, 30000);

    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, []);

  const emExecucao = dashboard?.emExecucao ?? [];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Monitoramento em tempo real das etapas em andamento"
      />

      <section className="grid grid-cols-4 gap-4 px-8 py-6">
        <Stat
          label="Provas Ativas"
          value={dashboard?.etapasAtivas ?? 0}
          accent="amber"
          hint={carregando ? "Carregando..." : "Etapas abertas agora"}
        />
        <Stat label="Alunos online" value={78} accent="blue" hint="Sessões ativas" />
        <Stat
          label="Provas finalizadas"
          value={dashboard?.etapasFinalizadas ?? 0}
          accent="emerald"
          hint={carregando ? "Carregando..." : "Etapas com janela encerrada"}
        />
        <Stat label="Bloqueios de IP" value={2} accent="rose" hint="Tentativas fora da escola" />
      </section>

      <section className="px-8 pb-6">
        <Panel>
          <div className="flex items-center justify-between pb-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold text-white">
                Etapas em execução
              </h2>
              <p className="text-xs text-white/50">
                Dados reais das etapas ativas no sistema
              </p>
            </div>
            <Tag tone="emerald">Ao vivo</Tag>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Prova</th>
                  <th className="px-4 py-3 font-medium">Turma / Escola</th>
                  <th className="px-4 py-3 font-medium">Janela</th>
                  <th className="px-4 py-3 font-medium">Iniciados</th>
                  <th className="px-4 py-3 font-medium">Finalizados</th>
                  <th className="px-4 py-3 font-medium">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {carregando ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-white/40">
                      Carregando dashboard...
                    </td>
                  </tr>
                ) : erro ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-rose-300">
                      {erro}
                    </td>
                  </tr>
                ) : emExecucao.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-white/40">
                      Nenhum simulado em execução no momento.
                    </td>
                  </tr>
                ) : (
                  emExecucao.map((p) => {
                    const pct = p.iniciados > 0 ? Math.round((p.finalizados / p.iniciados) * 100) : 0;

                    return (
                      <tr key={p.id} className="text-white/80">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{p.titulo}</span>
                            <span className="text-[10px] text-white/40">{p.componente}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {p.turmaEscola}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-white/60">
                          {formatarJanela(p.janelaInicio, p.janelaFim)}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {p.iniciados}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {p.finalizados}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                              <div
                                className="h-full rounded-full bg-amber-400"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-9 text-right font-mono text-xs text-white/50">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="grid grid-cols-2 gap-4 px-8 pb-8">
        <Panel>
          <h3 className="pb-3 text-sm font-semibold text-white">
            Desempenho por escola
          </h3>
          <ul className="flex flex-col gap-3">
            {[
              { escola: "CEAS Gov. Valadares", media: 7.4, alunos: 120 },
              { escola: "E.E. Murilo Braga", media: 8.1, alunos: 98 },
              { escola: "CESAJ", media: 6.2, alunos: 64 },
              { escola: "E.E. Dom Luciano", media: 7.9, alunos: 142 },
            ].map((e) => (
              <li
                key={e.escola}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-white">{e.escola}</span>
                  <span className="text-xs text-white/40">
                    {e.alunos} alunos avaliados
                  </span>
                </div>
                <span className="font-mono text-base font-semibold text-amber-300 tabular-nums">
                  {e.media.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h3 className="pb-3 text-sm font-semibold text-white">
            Log de acessos recentes
          </h3>
          <ul className="flex flex-col divide-y divide-white/5">
            {[
              { t: "10:42", evt: "Login aluno", d: "111.xxx.xxx-96 · IP autorizado" },
              { t: "10:38", evt: "Prova finalizada", d: "Tentativa #8712 · Matemática" },
              { t: "10:31", evt: "Bloqueio IP", d: "Aluno fora da escola (45.x.x.x)" },
              { t: "10:22", evt: "Importação CSV", d: "64 alunos · Turma 9ºB" },
              { t: "10:05", evt: "Login professor", d: "Ana Paula · Geometria" },
            ].map((l, i) => (
              <li key={i} className="flex items-center justify-between py-2.5">
                <div className="flex flex-col">
                  <span className="text-sm text-white">{l.evt}</span>
                  <span className="text-xs text-white/40">{l.d}</span>
                </div>
                <span className="font-mono text-xs text-white/50">{l.t}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </>
  );
}
