import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";

const provas = [
  {
    id: "ag-4212",
    nome: "Bimestral — Ciências",
    componente: "Ciências da Natureza",
    data: "17/04/2026",
    hora: "14:00",
    duracao: 100,
    questoes: 15,
    status: "disponivel",
  },
  {
    id: "ag-4201",
    nome: "Diagnóstica — Matemática",
    componente: "Matemática",
    data: "22/04/2026",
    hora: "09:00",
    duracao: 120,
    questoes: 15,
    status: "agendada",
  },
  {
    id: "ag-4202",
    nome: "Simulado — Português",
    componente: "Língua Portuguesa",
    data: "24/04/2026",
    hora: "10:00",
    duracao: 90,
    questoes: 17,
    status: "agendada",
  },
  {
    id: "ag-4155",
    nome: "Avaliação — História",
    componente: "Ciências Humanas",
    data: "03/04/2026",
    hora: "14:00",
    duracao: 80,
    questoes: 12,
    status: "realizada",
  },
];

const tag = (s: string) =>
  s === "disponivel"
    ? { tone: "emerald" as const, label: "Pronta para iniciar" }
    : s === "agendada"
      ? { tone: "amber" as const, label: "Agendada" }
      : { tone: "slate" as const, label: "Realizada" };

export default function ProvasAluno() {
  return (
    <>
      <PageHeader
        title="Provas reais"
        description="Avaliações oficiais da sua turma — o cronômetro inicia ao abrir a prova"
      />

      <section className="px-8 py-6">
        <div className="grid grid-cols-2 gap-4">
          {provas.map((p) => {
            const t = tag(p.status);
            return (
              <Panel key={p.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <Tag tone={t.tone}>{t.label}</Tag>
                    <h3 className="pt-2 text-base font-semibold text-white">{p.nome}</h3>
                    <p className="text-xs text-white/50">{p.componente}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">Data</span>
                    <span className="pt-1 font-mono text-xs text-white/70">{p.data}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">Duração</span>
                    <span className="pt-1 font-mono text-xs text-white/70">{p.duracao} min</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">Questões</span>
                    <span className="pt-1 font-mono text-xs text-white/70">{p.questoes}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  {p.status === "disponivel" ? (
                    <Link href={`/aluno/prova/${p.id}`}>
                      <Button className="h-8 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-[#0c1a33] hover:bg-amber-300">
                        Iniciar prova
                      </Button>
                    </Link>
                  ) : p.status === "realizada" ? (
                    <Button
                      variant="outline"
                      className="h-8 rounded-lg border-white/10 bg-white/[0.02] px-4 text-xs text-white/70 hover:bg-white/[0.05]"
                    >
                      Ver resultado
                    </Button>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
                      Disponível em {p.data}
                    </span>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      </section>
    </>
  );
}
