import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const turmas = [
  { id: "t-1", nome: "3ºA", nivel: "Ensino Médio", modalidade: "Regular", alunos: 38, escola: "CEAS Gov. Valadares" },
  { id: "t-2", nome: "3ºB", nivel: "Ensino Médio", modalidade: "Regular", alunos: 34, escola: "CEAS Gov. Valadares" },
  { id: "t-3", nome: "9ºB", nivel: "Ensino Fundamental", modalidade: "Regular", alunos: 29, escola: "E.E. Murilo Braga" },
  { id: "t-4", nome: "2º Supletivo", nivel: "Ensino Médio", modalidade: "Supletivo", alunos: 22, escola: "CESAJ" },
  { id: "t-5", nome: "1º Supletivo", nivel: "Ensino Médio", modalidade: "Supletivo", alunos: 18, escola: "CESAJ" },
];

export default function Turmas() {
  return (
    <>
      <PageHeader
        title="Turmas"
        description="Cadastro de turmas vinculadas a nível de ensino e modalidade"
        action={
          <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
            <Icon.Plus />
            Nova turma
          </Button>
        }
      />

      <section className="px-8 py-6">
        <Panel>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Nível</th>
                  <th className="px-4 py-3 font-medium">Modalidade</th>
                  <th className="px-4 py-3 font-medium">Escola</th>
                  <th className="px-4 py-3 font-medium">Alunos</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {turmas.map((t) => (
                  <tr key={t.id} className="text-white/80">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{t.nome}</span>
                        <span className="font-mono text-[10px] text-white/40">{t.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">{t.nivel}</td>
                    <td className="px-4 py-3 text-white/70">{t.modalidade}</td>
                    <td className="px-4 py-3 text-white/70">{t.escola}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-amber-300">
                      {t.alunos}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                      >
                        Alunos
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
