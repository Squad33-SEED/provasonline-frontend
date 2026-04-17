import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const alunos = [
  { id: "al-01", nome: "Lucas Silva", cpf: "111.222.333-96", matricula: "2026001", turma: "3ºA", escola: "CEAS", ip: "200.x.x.12" },
  { id: "al-02", nome: "Marina Costa", cpf: "222.333.444-00", matricula: "2026002", turma: "3ºA", escola: "CEAS", ip: "200.x.x.12" },
  { id: "al-03", nome: "João Pereira", cpf: "333.444.555-11", matricula: "2026003", turma: "9ºB", escola: "E.E. Murilo Braga", ip: "200.x.x.44" },
  { id: "al-04", nome: "Carla Santos", cpf: "444.555.666-22", matricula: "2026004", turma: "2º Supletivo", escola: "CESAJ", ip: "200.x.x.77" },
  { id: "al-05", nome: "Rafael Lima", cpf: "555.666.777-33", matricula: "2026005", turma: "3ºB", escola: "CEAS", ip: "—" },
];

export default function Alunos() {
  return (
    <>
      <PageHeader
        title="Alunos"
        description="Gerenciamento de alunos, matrícula e IP autorizado"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 rounded-lg border-white/10 bg-white/[0.02] px-4 text-sm text-white/80 hover:bg-white/[0.05]">
              <Icon.Upload />
              Importar CSV
            </Button>
            <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
              <Icon.Plus />
              Novo aluno
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-3 gap-4 px-8 py-6">
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Total de alunos</p>
          <p className="pt-2 text-2xl font-semibold text-white tabular-nums">1.284</p>
          <p className="pt-1 text-xs text-white/40">Em 42 turmas</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Com IP autorizado</p>
          <p className="pt-2 text-2xl font-semibold text-emerald-300 tabular-nums">1.112</p>
          <p className="pt-1 text-xs text-white/40">86,6% da base</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Importações hoje</p>
          <p className="pt-2 text-2xl font-semibold text-amber-300 tabular-nums">3</p>
          <p className="pt-1 text-xs text-white/40">218 registros processados</p>
        </Panel>
      </section>

      <section className="px-8 pb-8">
        <Panel>
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-sm font-semibold text-white">Lista de alunos</h2>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5">
              <Icon.Search className="size-3 text-white/40" />
              <input
                placeholder="Buscar por nome, CPF ou matrícula"
                className="w-72 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">CPF</th>
                  <th className="px-4 py-3 font-medium">Matrícula</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Escola</th>
                  <th className="px-4 py-3 font-medium">IP autorizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {alunos.map((a) => (
                  <tr key={a.id} className="text-white/80">
                    <td className="px-4 py-3 font-medium text-white">{a.nome}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{a.cpf}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{a.matricula}</td>
                    <td className="px-4 py-3 text-white/70">{a.turma}</td>
                    <td className="px-4 py-3 text-white/70">{a.escola}</td>
                    <td className="px-4 py-3">
                      {a.ip === "—" ? (
                        <Tag tone="rose">Não definido</Tag>
                      ) : (
                        <span className="font-mono text-xs text-emerald-300">{a.ip}</span>
                      )}
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
