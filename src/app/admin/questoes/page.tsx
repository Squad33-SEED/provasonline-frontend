import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Stat, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const questoes = [
  {
    id: "q-3201",
    enunciado: "Considere o triângulo retângulo ABC, com catetos 6 e 8. Qual o valor da hipotenusa?",
    componente: "Matemática",
    assunto: "Geometria",
    dificuldade: "FACIL",
    autor: "Ana Paula Santos",
    alternativas: 4,
  },
  {
    id: "q-3198",
    enunciado: "Resolva a equação quadrática 2x² − 5x + 2 = 0.",
    componente: "Matemática",
    assunto: "Álgebra",
    dificuldade: "MEDIO",
    autor: "Ana Paula Santos",
    alternativas: 5,
  },
  {
    id: "q-3190",
    enunciado: "Determine os valores de x na equação log₂(x + 3) = 4.",
    componente: "Matemática",
    assunto: "Álgebra",
    dificuldade: "DIFICIL",
    autor: "Ana Paula Santos",
    alternativas: 4,
  },
  {
    id: "q-2812",
    enunciado: "Analise o excerto do romance e identifique a figura de linguagem predominante.",
    componente: "Língua Portuguesa",
    assunto: "Literatura",
    dificuldade: "MEDIO",
    autor: "Carlos Moreira",
    alternativas: 5,
  },
  {
    id: "q-2789",
    enunciado: "Explique o papel da mitocôndria na respiração celular.",
    componente: "Ciências da Natureza",
    assunto: "Biologia",
    dificuldade: "FACIL",
    autor: "Marta Oliveira",
    alternativas: 4,
  },
  {
    id: "q-2744",
    enunciado: "Calcule a aceleração de um corpo submetido a uma força de 50 N e massa 10 kg.",
    componente: "Ciências da Natureza",
    assunto: "Física",
    dificuldade: "FACIL",
    autor: "Marta Oliveira",
    alternativas: 4,
  },
];

const dificuldadeTone = (d: string) =>
  d === "FACIL" ? "emerald" : d === "MEDIO" ? "amber" : "rose";

const componentesFiltro = [
  "Todos",
  "Matemática",
  "Língua Portuguesa",
  "Ciências da Natureza",
  "Ciências Humanas",
];

export default function BancoQuestoesAdmin() {
  return (
    <>
      <PageHeader
        title="Banco de questões"
        description="Visão consolidada de todas as questões cadastradas no sistema"
        action={
          <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
            <Icon.Plus />
            Nova questão
          </Button>
        }
      />

      <section className="grid grid-cols-4 gap-4 px-8 py-6">
        <Stat label="Total de questões" value={931} accent="amber" hint="Todos os componentes" />
        <Stat label="Fáceis" value={298} accent="emerald" />
        <Stat label="Médias" value={452} accent="amber" />
        <Stat label="Difíceis" value={181} accent="rose" />
      </section>

      <section className="px-8 pb-8">
        <Panel>
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              {componentesFiltro.map((c, i) => (
                <button
                  key={c}
                  className={
                    i === 0
                      ? "rounded-lg bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 ring-1 ring-amber-400/20"
                      : "rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                  }
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5">
                <Icon.Search className="size-3 text-white/40" />
                <input
                  placeholder="Buscar no enunciado ou ID"
                  className="w-56 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
              <Button
                variant="outline"
                className="h-8 rounded-lg border-white/10 bg-white/[0.02] px-3 text-xs text-white/70 hover:bg-white/[0.05]"
              >
                <Icon.Filter />
                Filtrar
              </Button>
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
                    <Tag tone={dificuldadeTone(q.dificuldade)}>
                      {q.dificuldade}
                    </Tag>
                    <Tag tone="blue">{q.componente}</Tag>
                    <Tag tone="slate">{q.assunto}</Tag>
                    <span className="font-mono text-[10px] text-white/30">
                      {q.id}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">{q.enunciado}</p>
                  <p className="text-xs text-white/40">
                    {q.alternativas} alternativas · 1 correta · Autor: {q.autor}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                >
                  Ver
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </>
  );
}
