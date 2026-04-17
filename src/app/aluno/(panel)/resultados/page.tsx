import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Stat, Tag } from "@/components/app-shell";

const historico = [
  { id: "rt-988", nome: "Simulado — Álgebra", tipo: "Simulado livre", data: "14/04/2026", nota: 8.5, acerto: 85, total: 10 },
  { id: "rt-964", nome: "Avaliação — Funções", tipo: "Prova real", data: "04/04/2026", nota: 7.2, acerto: 72, total: 15 },
  { id: "rt-932", nome: "Simulado — Geometria", tipo: "Simulado livre", data: "28/03/2026", nota: 9.0, acerto: 90, total: 10 },
  { id: "rt-918", nome: "Bimestral — Português", tipo: "Prova real", data: "20/03/2026", nota: 6.8, acerto: 68, total: 15 },
  { id: "rt-901", nome: "Simulado — Trigonometria", tipo: "Simulado livre", data: "15/03/2026", nota: 7.5, acerto: 75, total: 8 },
];

export default function Resultados() {
  return (
    <>
      <PageHeader
        title="Resultados"
        description="Histórico de simulados livres e provas reais com gabarito"
      />

      <section className="grid grid-cols-4 gap-4 px-8 py-6">
        <Stat label="Provas realizadas" value={5} accent="amber" />
        <Stat label="Média geral" value="7.8" accent="emerald" />
        <Stat label="Melhor nota" value="9.0" accent="blue" hint="Geometria" />
        <Stat label="Acertos totais" value="78%" accent="amber" />
      </section>

      <section className="px-8 pb-8">
        <Panel>
          <h2 className="pb-4 text-sm font-semibold text-white">Histórico</h2>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Prova</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Nota</th>
                  <th className="px-4 py-3 font-medium">Acerto</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historico.map((h) => (
                  <tr key={h.id} className="text-white/80">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{h.nome}</span>
                        <span className="font-mono text-[10px] text-white/40">{h.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Tag tone={h.tipo === "Prova real" ? "amber" : "blue"}>
                        {h.tipo}
                      </Tag>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{h.data}</td>
                    <td className="px-4 py-3 font-mono text-base font-semibold text-amber-300 tabular-nums">
                      {h.nota.toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${h.acerto}%` }}
                          />
                        </div>
                        <span className="w-9 text-right font-mono text-xs text-white/50">
                          {h.acerto}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                      >
                        Ver gabarito
                      </Button>
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
