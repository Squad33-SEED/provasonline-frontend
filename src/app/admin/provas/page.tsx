import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const provas = [
  {
    id: "ag-4201",
    nome: "Diagnóstica — Matemática 1º bim",
    turma: "3ºA — EM Regular",
    data: "22/04/2026",
    hora: "09:00",
    duracao: 120,
    questoes: { facil: 4, medio: 8, dificil: 3 },
    status: "agendada",
  },
  {
    id: "ag-4198",
    nome: "Simulado SAEB — Port.",
    turma: "9ºB — EF Regular",
    data: "20/04/2026",
    hora: "10:00",
    duracao: 90,
    questoes: { facil: 5, medio: 10, dificil: 2 },
    status: "em-andamento",
  },
  {
    id: "ag-4180",
    nome: "Prova Bimestral — Ciências",
    turma: "2º Supletivo",
    data: "15/04/2026",
    hora: "14:00",
    duracao: 100,
    questoes: { facil: 3, medio: 7, dificil: 4 },
    status: "encerrada",
  },
];

const statusTag = (s: string) =>
  s === "em-andamento"
    ? { tone: "emerald" as const, label: "Em andamento" }
    : s === "encerrada"
      ? { tone: "slate" as const, label: "Encerrada" }
      : { tone: "amber" as const, label: "Agendada" };

export default function ProvasAgendamento() {
  return (
    <>
      <PageHeader
        title="Agendamento de provas"
        description="Defina turma, data, duração e mix de dificuldade — o sistema sorteia as questões do banco"
        action={
          <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
            <Icon.Plus />
            Novo simulado
          </Button>
        }
      />

      <section className="grid grid-cols-3 gap-4 px-8 py-6">
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Agendadas</p>
          <p className="pt-2 text-2xl font-semibold text-amber-300 tabular-nums">12</p>
          <p className="pt-1 text-xs text-white/40">Próximos 30 dias</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Em andamento</p>
          <p className="pt-2 text-2xl font-semibold text-emerald-300 tabular-nums">3</p>
          <p className="pt-1 text-xs text-white/40">Com alunos respondendo</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Encerradas este mês</p>
          <p className="pt-2 text-2xl font-semibold text-white tabular-nums">48</p>
          <p className="pt-1 text-xs text-white/40">Gabaritos liberados</p>
        </Panel>
      </section>

      <section className="px-8 pb-8">
        <Panel>
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-sm font-semibold text-white">Simulados</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5">
                <Icon.Search className="size-3 text-white/40" />
                <input
                  placeholder="Buscar por nome ou turma"
                  className="w-56 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
              <Button variant="outline" className="h-8 rounded-lg border-white/10 bg-white/[0.02] px-3 text-xs text-white/70 hover:bg-white/[0.05]">
                <Icon.Filter />
                Filtrar
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Simulado</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Data / hora</th>
                  <th className="px-4 py-3 font-medium">Duração</th>
                  <th className="px-4 py-3 font-medium">Mix F/M/D</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {provas.map((p) => {
                  const t = statusTag(p.status);
                  return (
                    <tr key={p.id} className="text-white/80">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{p.nome}</span>
                          <span className="font-mono text-[10px] text-white/40">{p.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70">{p.turma}</td>
                      <td className="px-4 py-3 font-mono text-xs text-white/60">
                        {p.data} · {p.hora}
                      </td>
                      <td className="px-4 py-3 text-white/70">{p.duracao} min</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className="text-emerald-300">{p.questoes.facil}</span>
                        <span className="text-white/30"> / </span>
                        <span className="text-amber-300">{p.questoes.medio}</span>
                        <span className="text-white/30"> / </span>
                        <span className="text-rose-300">{p.questoes.dificil}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Tag tone={t.tone}>{t.label}</Tag>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                        >
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </>
  );
}
