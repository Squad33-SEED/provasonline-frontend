import { PageHeader, Panel, Stat, Tag } from "@/components/app-shell";

const liveExams = [
  {
    id: "p-101",
    nome: "Avaliação Diagnóstica — Matemática",
    turma: "3ºA — EM Regular",
    escola: "CEAS Gov. Valadares",
    total: 38,
    iniciados: 32,
    finalizados: 14,
    inicio: "09:00",
    termino: "11:00",
  },
  {
    id: "p-102",
    nome: "Simulado SAEB — Língua Portuguesa",
    turma: "9ºB — EF Regular",
    escola: "E.E. Murilo Braga",
    total: 29,
    iniciados: 29,
    finalizados: 25,
    inicio: "09:30",
    termino: "11:30",
  },
  {
    id: "p-103",
    nome: "Prova Bimestral — Ciências da Natureza",
    turma: "2º Supletivo",
    escola: "CESAJ",
    total: 22,
    iniciados: 17,
    finalizados: 5,
    inicio: "10:00",
    termino: "12:00",
  },
];

export default function AdminDashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Monitoramento em tempo real dos simulados em andamento"
      />

      <section className="grid grid-cols-4 gap-4 px-8 py-6">
        <Stat label="Simulados ativos" value={3} accent="amber" hint="Das 07:00 às 18:00 hoje" />
        <Stat label="Alunos online" value={78} accent="blue" hint="Sessões ativas" />
        <Stat label="Provas finalizadas" value={44} accent="emerald" hint="Nas últimas 2h" />
        <Stat label="Bloqueios de IP" value={2} accent="rose" hint="Tentativas fora da escola" />
      </section>

      <section className="px-8 pb-6">
        <Panel>
          <div className="flex items-center justify-between pb-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold text-white">
                Simulados em execução
              </h2>
              <p className="text-xs text-white/50">
                Telemetria atualizada a cada 30 segundos
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
                {liveExams.map((p) => {
                  const pct = Math.round((p.finalizados / p.total) * 100);
                  return (
                    <tr key={p.id} className="text-white/80">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{p.nome}</span>
                          <span className="font-mono text-[10px] text-white/40">{p.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span>{p.turma}</span>
                          <span className="text-xs text-white/40">{p.escola}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-white/60">
                        {p.inicio} — {p.termino}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {p.iniciados}/{p.total}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {p.finalizados}/{p.total}
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
                })}
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
