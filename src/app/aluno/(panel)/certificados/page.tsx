import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const certificados = [
  { id: "cert-102", nome: "Avaliação — Funções", data: "04/04/2026", percentual: 72 },
  { id: "cert-091", nome: "Bimestral — Português", data: "20/03/2026", percentual: 68 },
];

export default function Certificados() {
  return (
    <>
      <PageHeader
        title="Certificados"
        description="Certificados emitidos após aprovação nas provas reais"
      />

      <section className="grid grid-cols-2 gap-4 px-8 py-6">
        {certificados.map((c) => (
          <Panel key={c.id}>
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                <Icon.Certificate className="size-6" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-base font-semibold text-white">{c.nome}</h3>
                <p className="font-mono text-xs text-white/50">
                  Emitido em {c.data} · {c.percentual}% de aproveitamento
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                {c.id}
              </span>
              <Button className="h-8 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-[#0c1a33] hover:bg-amber-300">
                Baixar PDF
              </Button>
            </div>
          </Panel>
        ))}
      </section>
    </>
  );
}
