import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Stat, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const proximas = [
  { id: "ag-4201", nome: "Diagnóstica — Matemática", data: "22/04/2026", hora: "09:00", duracao: 120, disponivel: false },
  { id: "ag-4202", nome: "Simulado — Português", data: "24/04/2026", hora: "10:00", duracao: 90, disponivel: false },
  { id: "ag-4212", nome: "Bimestral — Ciências", data: "17/04/2026", hora: "14:00", duracao: 100, disponivel: true },
];

const ultimas = [
  { id: "rt-988", nome: "Simulado — Álgebra", data: "14/04", nota: 8.5, acerto: 85 },
  { id: "rt-964", nome: "Avaliação — Funções", data: "04/04", nota: 7.2, acerto: 72 },
];

export default function AlunoDashboard() {
  return (
    <>
      <PageHeader
        title="Olá, Lucas"
        description="Acompanhe suas provas agendadas e pratique com simulados livres"
        action={
          <Link href="/aluno/simulado">
            <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
              <Icon.Play />
              Iniciar simulado livre
            </Button>
          </Link>
        }
      />

      <section className="grid grid-cols-4 gap-4 px-8 py-6">
        <Stat label="Próximas provas" value={3} accent="amber" hint="Agendadas na sua turma" />
        <Stat label="Média geral" value="7.8" accent="emerald" hint="Últimos 6 simulados" />
        <Stat label="Simulados livres" value={12} accent="blue" hint="Realizados este mês" />
        <Stat label="Certificados" value={2} accent="amber" hint="Disponíveis para download" />
      </section>

      <section className="grid grid-cols-3 gap-4 px-8 pb-8">
        <Panel className="col-span-2">
          <h3 className="pb-4 text-sm font-semibold text-white">Próximas provas</h3>
          <ul className="flex flex-col gap-2.5">
            {proximas.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-3.5"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{p.nome}</span>
                    {p.disponivel && <Tag tone="emerald">Pronta</Tag>}
                  </div>
                  <p className="font-mono text-xs text-white/50">
                    {p.data} · {p.hora} · {p.duracao} min
                  </p>
                </div>
                {p.disponivel ? (
                  <Link href={`/aluno/prova/${p.id}`}>
                    <Button className="h-8 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-[#0c1a33] hover:bg-amber-300">
                      Iniciar
                    </Button>
                  </Link>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
                    Aguardando
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h3 className="pb-4 text-sm font-semibold text-white">Últimos resultados</h3>
          <ul className="flex flex-col divide-y divide-white/5">
            {ultimas.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3 first:pt-0">
                <div className="flex flex-col">
                  <span className="text-sm text-white">{r.nome}</span>
                  <span className="font-mono text-xs text-white/40">{r.data}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-base font-semibold text-amber-300 tabular-nums">
                    {r.nota.toFixed(1)}
                  </span>
                  <span className="text-xs text-emerald-300">{r.acerto}% acertos</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </>
  );
}
