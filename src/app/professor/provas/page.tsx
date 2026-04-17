import { PageHeader, Panel, Tag } from "@/components/app-shell";

const resultados = [
  { id: "ag-4188", nome: "Bimestral — Geometria", turma: "3ºB", alunos: 34, finalizados: 32, media: 7.8, acerto: 74 },
  { id: "ag-4177", nome: "Simulado — Álgebra", turma: "9ºB", alunos: 29, finalizados: 29, media: 6.9, acerto: 68 },
  { id: "ag-4165", nome: "Avaliação — Funções", turma: "3ºA", alunos: 38, finalizados: 36, media: 8.1, acerto: 79 },
];

export default function ResultadosProfessor() {
  return (
    <>
      <PageHeader
        title="Resultados"
        description="Consolidado das provas dos seus componentes com percentual de acerto"
      />

      <section className="px-8 py-6">
        <Panel>
          <h2 className="pb-4 text-sm font-semibold text-white">Provas encerradas</h2>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Prova</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Finalizados</th>
                  <th className="px-4 py-3 font-medium">Média</th>
                  <th className="px-4 py-3 font-medium">Acerto</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {resultados.map((r) => (
                  <tr key={r.id} className="text-white/80">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{r.nome}</span>
                        <span className="font-mono text-[10px] text-white/40">{r.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">{r.turma}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-white/70">
                      {r.finalizados}/{r.alunos}
                    </td>
                    <td className="px-4 py-3 font-mono text-base font-semibold text-amber-300 tabular-nums">
                      {r.media.toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${r.acerto}%` }}
                          />
                        </div>
                        <span className="w-9 text-right font-mono text-xs text-white/50">
                          {r.acerto}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Tag tone="slate">ver gabarito</Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </>
  );
}
