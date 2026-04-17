import { PageHeader, Panel, Stat, Tag } from "@/components/app-shell";

const minhasProvas = [
  { id: "ag-4201", nome: "Diagnóstica — Matemática", turma: "3ºA", data: "22/04", status: "agendada" },
  { id: "ag-4188", nome: "Bimestral — Geometria", turma: "3ºB", data: "18/04", status: "encerrada" },
  { id: "ag-4177", nome: "Simulado — Álgebra", turma: "9ºB", data: "14/04", status: "encerrada" },
];

export default function ProfessorDashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu banco de questões e provas do seu componente"
      />

      <section className="grid grid-cols-4 gap-4 px-8 py-6">
        <Stat label="Minhas questões" value={128} accent="amber" hint="Matemática" />
        <Stat label="Questões revisadas" value={96} accent="emerald" hint="Prontas para uso" />
        <Stat label="Provas geradas" value={14} accent="blue" hint="Neste bimestre" />
        <Stat label="Média das turmas" value="7.3" accent="amber" hint="Último simulado" />
      </section>

      <section className="grid grid-cols-3 gap-4 px-8 pb-8">
        <Panel className="col-span-2">
          <h3 className="pb-4 text-sm font-semibold text-white">Provas do meu componente</h3>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Simulado</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {minhasProvas.map((p) => (
                  <tr key={p.id} className="text-white/80">
                    <td className="px-4 py-3 font-medium text-white">{p.nome}</td>
                    <td className="px-4 py-3 text-white/70">{p.turma}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{p.data}</td>
                    <td className="px-4 py-3">
                      <Tag tone={p.status === "agendada" ? "amber" : "slate"}>
                        {p.status}
                      </Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <h3 className="pb-4 text-sm font-semibold text-white">Distribuição por dificuldade</h3>
          <ul className="flex flex-col gap-3">
            {[
              { label: "Fácil", valor: 42, tone: "bg-emerald-400" },
              { label: "Médio", valor: 62, tone: "bg-amber-400" },
              { label: "Difícil", valor: 24, tone: "bg-rose-400" },
            ].map((d) => (
              <li key={d.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">{d.label}</span>
                  <span className="font-mono text-white/50">{d.valor}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${d.tone}`}
                    style={{ width: `${(d.valor / 128) * 100}%` }}
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
