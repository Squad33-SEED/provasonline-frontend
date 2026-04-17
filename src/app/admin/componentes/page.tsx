import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const componentes = [
  {
    id: "c-1",
    nome: "Matemática",
    assuntos: ["Geometria", "Álgebra", "Trigonometria", "Estatística"],
    questoes: 312,
  },
  {
    id: "c-2",
    nome: "Língua Portuguesa",
    assuntos: ["Interpretação", "Gramática", "Literatura"],
    questoes: 245,
  },
  {
    id: "c-3",
    nome: "Ciências da Natureza",
    assuntos: ["Biologia", "Física", "Química"],
    questoes: 198,
  },
  {
    id: "c-4",
    nome: "Ciências Humanas",
    assuntos: ["História", "Geografia", "Filosofia", "Sociologia"],
    questoes: 176,
  },
];

export default function Componentes() {
  return (
    <>
      <PageHeader
        title="Componentes curriculares"
        description="Disciplinas e seus assuntos — base para o banco de questões"
        action={
          <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
            <Icon.Plus />
            Novo componente
          </Button>
        }
      />

      <section className="grid grid-cols-2 gap-4 px-8 py-6">
        {componentes.map((c) => (
          <Panel key={c.id}>
            <div className="flex items-start justify-between pb-4">
              <div>
                <h3 className="text-base font-semibold text-white">{c.nome}</h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                  {c.assuntos.length} assuntos · {c.questoes} questões
                </p>
              </div>
              <Button
                variant="ghost"
                className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
              >
                Gerenciar
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.assuntos.map((a) => (
                <span
                  key={a}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/70"
                >
                  {a}
                </span>
              ))}
            </div>
          </Panel>
        ))}
      </section>
    </>
  );
}
