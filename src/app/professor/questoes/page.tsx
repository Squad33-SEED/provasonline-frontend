import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const questoes = [
  {
    id: "q-3201",
    enunciado: "Considere o triângulo retângulo ABC, com catetos 6 e 8. Qual o valor da hipotenusa?",
    assunto: "Geometria",
    dificuldade: "FACIL",
    alternativas: 4,
  },
  {
    id: "q-3198",
    enunciado: "Resolva a equação quadrática 2x² − 5x + 2 = 0.",
    assunto: "Álgebra",
    dificuldade: "MEDIO",
    alternativas: 5,
  },
  {
    id: "q-3190",
    enunciado: "Determine os valores de x na equação log₂(x + 3) = 4.",
    assunto: "Álgebra",
    dificuldade: "DIFICIL",
    alternativas: 4,
  },
  {
    id: "q-3184",
    enunciado: "Calcule sen(45º) + cos(45º).",
    assunto: "Trigonometria",
    dificuldade: "MEDIO",
    alternativas: 4,
  },
];

const dificuldadeTone = (d: string) =>
  d === "FACIL" ? "emerald" : d === "MEDIO" ? "amber" : "rose";

export default function BancoQuestoes() {
  return (
    <>
      <PageHeader
        title="Banco de questões"
        description="Gerencie o acervo do seu componente — filtre por assunto e dificuldade"
        action={
          <Link href="/professor/questoes/nova">
            <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
              <Icon.Plus />
              Nova questão
            </Button>
          </Link>
        }
      />

      <section className="px-8 py-6">
        <Panel>
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              {["Todos", "Geometria", "Álgebra", "Trigonometria", "Estatística"].map(
                (a, i) => (
                  <button
                    key={a}
                    className={
                      i === 0
                        ? "rounded-lg bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 ring-1 ring-amber-400/20"
                        : "rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                    }
                  >
                    {a}
                  </button>
                ),
              )}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5">
              <Icon.Search className="size-3 text-white/40" />
              <input
                placeholder="Buscar no enunciado"
                className="w-64 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
          </div>

          <ul className="flex flex-col gap-2.5">
            {questoes.map((q) => (
              <li
                key={q.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Tag tone={dificuldadeTone(q.dificuldade)}>{q.dificuldade}</Tag>
                    <Tag tone="blue">{q.assunto}</Tag>
                    <span className="font-mono text-[10px] text-white/30">{q.id}</span>
                  </div>
                  <p className="text-sm text-white/80">{q.enunciado}</p>
                  <p className="text-xs text-white/40">
                    {q.alternativas} alternativas · 1 correta
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                >
                  Editar
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </>
  );
}
