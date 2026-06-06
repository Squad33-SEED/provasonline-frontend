"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel } from "@/components/app-shell";
import { useToast } from "@/components/feedback/toast-provider";
import { isApiClientError } from "@/lib/api-client";
import {
  criarQuestao,
  getAssuntosDoComponente,
  getComponentesQuestao,
  type AssuntoOpcao,
  type ComponenteOpcao,
  type Dificuldade,
} from "@/lib/questoes";

const LETRAS = ["A", "B", "C", "D", "E"];

export default function NovaQuestao() {
  const router = useRouter();
  const toast = useToast();

  const [componentes, setComponentes] = React.useState<ComponenteOpcao[]>([]);
  const [assuntos, setAssuntos] = React.useState<AssuntoOpcao[]>([]);

  const [componenteId, setComponenteId] = React.useState("");
  const [assuntoId, setAssuntoId] = React.useState("");
  const [dificuldade, setDificuldade] = React.useState<Dificuldade>("FACIL");
  const [enunciado, setEnunciado] = React.useState("");
  const [urlImagem, setUrlImagem] = React.useState("");
  const [textos, setTextos] = React.useState<Record<string, string>>({
    A: "",
    B: "",
    C: "",
    D: "",
    E: "",
  });
  const [correta, setCorreta] = React.useState("A");
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      try {
        setComponentes(await getComponentesQuestao());
      } catch {
        toast.push({
          variant: "destructive",
          title: "Falha ao carregar componentes",
        });
      }
    })();
  }, [toast]);

  React.useEffect(() => {
    if (!componenteId) {
      setAssuntos([]);
      setAssuntoId("");
      return;
    }
    void (async () => {
      try {
        const lista = await getAssuntosDoComponente(componenteId);
        setAssuntos(lista);
        setAssuntoId("");
      } catch {
        toast.push({
          variant: "destructive",
          title: "Falha ao carregar assuntos",
        });
      }
    })();
  }, [componenteId, toast]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    if (!componenteId || !assuntoId) {
      toast.push({
        variant: "destructive",
        title: "Selecione componente e assunto",
      });
      return;
    }
    if (!enunciado.trim()) {
      toast.push({ variant: "destructive", title: "Informe o enunciado" });
      return;
    }

    const alternativas = LETRAS.map((letra) => ({
      letra,
      texto: textos[letra].trim(),
    })).filter((a) => a.texto.length > 0);

    if (alternativas.length < 2) {
      toast.push({
        variant: "destructive",
        title: "Mínimo de 2 alternativas obrigatórias",
      });
      return;
    }
    if (!alternativas.some((a) => a.letra === correta)) {
      toast.push({
        variant: "destructive",
        title: "A alternativa correta precisa ter texto",
      });
      return;
    }

    setSalvando(true);
    try {
      await criarQuestao({
        componenteId,
        assuntoId,
        tipo: "MULTIPLA_ESCOLHA",
        dificuldade,
        enunciado: enunciado.trim(),
        alternativas,
        respostaCorreta: correta,
        urlImagem: urlImagem.trim() || null,
      });
      toast.push({ title: "Questão criada com sucesso" });
      router.push("/professor/questoes");
    } catch (err) {
      const detail = isApiClientError(err)
        ? err.detail
        : "Erro ao salvar questão";
      toast.push({
        variant: "destructive",
        title: "Falha ao salvar",
        description: detail,
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Nova questão"
        description="Cadastre uma nova questão com 2 a 5 alternativas e exatamente 1 correta"
      />

      <section className="px-8 py-6">
        <form className="flex flex-col gap-4" onSubmit={salvar}>
          <Panel>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="enunciado" className="text-xs font-medium text-white/70">
                  Enunciado
                </Label>
                <textarea
                  id="enunciado"
                  rows={4}
                  value={enunciado}
                  onChange={(e) => setEnunciado(e.target.value)}
                  placeholder="Descreva o enunciado da questão..."
                  className="resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus-visible:border-amber-400/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-white/70">Componente</Label>
                  <select
                    value={componenteId}
                    onChange={(e) => setComponenteId(e.target.value)}
                    className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus-visible:border-amber-400/60 focus-visible:outline-none"
                  >
                    <option value="">Selecione</option>
                    {componentes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-white/70">Assunto</Label>
                  <select
                    value={assuntoId}
                    onChange={(e) => setAssuntoId(e.target.value)}
                    disabled={!componenteId}
                    className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus-visible:border-amber-400/60 focus-visible:outline-none disabled:opacity-40"
                  >
                    <option value="">
                      {componenteId ? "Selecione" : "Escolha um componente"}
                    </option>
                    {assuntos.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-white/70">Dificuldade</Label>
                  <select
                    value={dificuldade}
                    onChange={(e) => setDificuldade(e.target.value as Dificuldade)}
                    className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus-visible:border-amber-400/60 focus-visible:outline-none"
                  >
                    <option value="FACIL">Fácil</option>
                    <option value="MEDIO">Médio</option>
                    <option value="DIFICIL">Difícil</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="urlImagem" className="text-xs font-medium text-white/70">
                  URL da imagem (opcional)
                </Label>
                <Input
                  id="urlImagem"
                  value={urlImagem}
                  onChange={(e) => setUrlImagem(e.target.value)}
                  placeholder="https://..."
                  className="h-10 rounded-lg border-white/10 bg-white/[0.03] px-3 text-sm text-white placeholder:text-white/25 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/20"
                />
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-sm font-semibold text-white">Alternativas</h3>
              <span className="text-xs text-white/40">Marque a alternativa correta</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {LETRAS.map((letra, i) => (
                <div
                  key={letra}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
                >
                  <input
                    type="radio"
                    name="correta"
                    checked={correta === letra}
                    onChange={() => setCorreta(letra)}
                    className="size-4 accent-amber-400"
                  />
                  <span className="w-6 font-mono text-sm font-semibold text-amber-300">
                    {letra}
                  </span>
                  <Input
                    value={textos[letra]}
                    onChange={(e) =>
                      setTextos((prev) => ({ ...prev, [letra]: e.target.value }))
                    }
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
              onClick={() => router.push("/professor/questoes")}
              className="h-9 rounded-lg border-white/10 bg-white/[0.02] px-4 text-sm text-white/70 hover:bg-white/[0.05]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvando}
              className="h-9 rounded-lg bg-amber-400 px-5 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300 disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar questão"}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
