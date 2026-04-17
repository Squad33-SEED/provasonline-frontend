import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const niveis = [
  { id: "n-1", nome: "Ensino Fundamental II", modalidades: ["Regular"], turmas: 8 },
  { id: "n-2", nome: "Ensino Médio", modalidades: ["Regular", "Supletivo"], turmas: 22 },
  { id: "n-3", nome: "EJA", modalidades: ["Supletivo"], turmas: 6 },
];

export default function Niveis() {
  return (
    <>
      <PageHeader
        title="Níveis & Modalidades"
        description="Agrupamento acadêmico das turmas"
        action={
          <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
            <Icon.Plus />
            Novo nível
          </Button>
        }
      />

      <section className="grid grid-cols-3 gap-4 px-8 py-6">
        {niveis.map((n) => (
          <Panel key={n.id}>
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-white">{n.nome}</h3>
              <span className="font-mono text-xs text-amber-300 tabular-nums">
                {n.turmas} turmas
              </span>
            </div>
            <div className="pt-4">
              <p className="pb-2 text-[11px] uppercase tracking-[0.14em] text-white/40">
                Modalidades
              </p>
              <div className="flex flex-wrap gap-1.5">
                {n.modalidades.map((m) => (
                  <Tag key={m} tone={m === "Regular" ? "blue" : "amber"}>
                    {m}
                  </Tag>
                ))}
              </div>
            </div>
          </Panel>
        ))}
      </section>
    </>
  );
}
