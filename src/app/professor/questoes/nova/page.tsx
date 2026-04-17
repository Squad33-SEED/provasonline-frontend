import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel } from "@/components/app-shell";
import { Icon } from "@/components/icons";

export default function NovaQuestao() {
  return (
    <>
      <PageHeader
        title="Nova questão"
        description="Cadastre uma nova questão com 4 ou 5 alternativas e exatamente 1 correta"
      />

      <section className="px-8 py-6">
        <form className="flex flex-col gap-4">
          <Panel>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="enunciado" className="text-xs font-medium text-white/70">
                  Enunciado
                </Label>
                <textarea
                  id="enunciado"
                  rows={4}
                  placeholder="Descreva o enunciado da questão..."
                  className="resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus-visible:border-amber-400/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-white/70">Componente</Label>
                  <select className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus-visible:border-amber-400/60 focus-visible:outline-none">
                    <option>Matemática</option>
                    <option>Língua Portuguesa</option>
                    <option>Ciências</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-white/70">Assunto</Label>
                  <select className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus-visible:border-amber-400/60 focus-visible:outline-none">
                    <option>Geometria</option>
                    <option>Álgebra</option>
                    <option>Trigonometria</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-white/70">Dificuldade</Label>
                  <select className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus-visible:border-amber-400/60 focus-visible:outline-none">
                    <option value="FACIL">Fácil</option>
                    <option value="MEDIO">Médio</option>
                    <option value="DIFICIL">Difícil</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-white/70">
                  Imagem (opcional)
                </Label>
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-4 py-5">
                  <Icon.Upload className="size-5 text-white/40" />
                  <div className="flex flex-col">
                    <span className="text-sm text-white/70">Anexar imagem ou gráfico</span>
                    <span className="text-xs text-white/40">PNG, JPG até 5 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-sm font-semibold text-white">Alternativas</h3>
              <span className="text-xs text-white/40">Marque a alternativa correta</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {["A", "B", "C", "D", "E"].map((letra, i) => (
                <div
                  key={letra}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
                >
                  <input
                    type="radio"
                    name="correta"
                    defaultChecked={i === 0}
                    className="size-4 accent-amber-400"
                  />
                  <span className="w-6 font-mono text-sm font-semibold text-amber-300">
                    {letra}
                  </span>
                  <Input
                    placeholder={`Texto da alternativa ${letra}${i >= 4 ? " (opcional)" : ""}`}
                    className="h-9 flex-1 rounded-md border-white/10 bg-white/[0.03] px-3 text-sm text-white placeholder:text-white/25 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/20"
                  />
                </div>
              ))}
            </div>
          </Panel>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-white/10 bg-white/[0.02] px-4 text-sm text-white/70 hover:bg-white/[0.05]"
            >
              Cancelar
            </Button>
            <Button className="h-9 rounded-lg bg-amber-400 px-5 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
              Salvar questão
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
