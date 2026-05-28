"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

interface Assunto {
  id: string;
  nome: string;
}

interface Componente {
  id: string;
  nome: string;
  modalidade: { id: string; nome: string };
  assuntos?: Assunto[];
}

interface Disponibilidade {
  facil: number;
  medio: number;
  dificil: number;
}

export default function SimuladoLivre() {
  const router = useRouter();
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [assuntosVisiveis, setAssuntosVisiveis] = useState<string[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade>({ facil: 0, medio: 0, dificil: 0 });
  const [facil, setFacil] = useState(3);
  const [medio, setMedio] = useState(5);
  const [dificil, setDificil] = useState(2);
  const [duracao, setDuracao] = useState(45);
  const [carregando, setCarregando] = useState(false);

  const total = facil + medio + dificil;

  // Avisos de disponibilidade
  const avisos: string[] = [];
  if (facil > disponibilidade.facil) avisos.push(`Só há ${disponibilidade.facil} questão(ões) fácil(is) disponível(is)`);
  if (medio > disponibilidade.medio) avisos.push(`Só há ${disponibilidade.medio} questão(ões) média(s) disponível(is)`);
  if (dificil > disponibilidade.dificil) avisos.push(`Só há ${disponibilidade.dificil} questão(ões) difícil(is) disponível(is)`);
  const temAviso = avisos.length > 0;

  useEffect(() => {
    async function carregarComponentes() {
      try {
        const res = await fetch("/api/catalogo/componentes");
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const unicos = data.filter(
          (c: Componente) => c.modalidade.nome === "Ensino Médio — Regular"
        );
        setComponentes(unicos);
        if (unicos.length > 0) {
          setSelecionados([unicos[0].nome]);
        }
      } catch (err) {
        console.error("Erro ao carregar componentes:", err);
      }
    }
    carregarComponentes();
  }, []);

  // Busca disponibilidade quando muda seleção
  useEffect(() => {
    async function buscarDisponibilidade() {
      const ids = selecionados
        .map((nome) => componentes.find((c) => c.nome === nome)?.id)
        .filter(Boolean) as string[];

      if (ids.length === 0) return;

      try {
        const resultados = await Promise.all(
          ids.map((id) =>
            fetch(`/api/simulados/disponibilidade?componenteId=${id}`)
              .then((r) => r.json())
          )
        );

        // Soma disponibilidade de todos os componentes selecionados
        const total = resultados.reduce(
          (acc, r) => ({
            facil: acc.facil + (r.facil ?? 0),
            medio: acc.medio + (r.medio ?? 0),
            dificil: acc.dificil + (r.dificil ?? 0),
          }),
          { facil: 0, medio: 0, dificil: 0 }
        );

        setDisponibilidade(total);
      } catch (err) {
        console.error("Erro ao buscar disponibilidade:", err);
      }
    }

    if (componentes.length > 0 && selecionados.length > 0) {
      buscarDisponibilidade();
    }
  }, [selecionados, componentes]);

  // Atualiza assuntos visíveis
  useEffect(() => {
    const assuntos = componentes
      .filter((c) => selecionados.includes(c.nome))
      .flatMap((c) => c.assuntos?.map((a) => a.nome) ?? []);
    setAssuntosVisiveis([...new Set(assuntos)]);
  }, [selecionados, componentes]);

  function toggleComponente(nome: string) {
    setSelecionados((prev) =>
      prev.includes(nome)
        ? prev.length === 1 ? prev : prev.filter((c) => c !== nome)
        : [...prev, nome]
    );
  }

  function toggleTodos() {
    if (selecionados.length === componentes.length) {
      setSelecionados([componentes[0]?.nome ?? ""]);
    } else {
      setSelecionados(componentes.map((c) => c.nome));
    }
  }

  async function aoGerarSimulado() {
    if (total === 0 || carregando || selecionados.length === 0 || temAviso) return;
    try {
      setCarregando(true);

      const ids = selecionados.map(
        (nome) => componentes.find((c) => c.nome === nome)!.id
      );
      const componentePrincipal = ids[0];

      const dadosFormulario = {
        titulo: `Simulado Livre - ${selecionados.join(", ")}`,
        descricao: `IDS:${ids.join(",")}`,
        componenteId: componentePrincipal,
        qtdFacil: facil,
        qtdMedio: medio,
        qtdDificil: dificil,
        vagas: 1,
        duracaoMinutos: duracao,
        janelaInicio: new Date(Date.now() + 60 * 1000).toISOString(),
        janelaFim: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      };

      const resposta = await fetch("/api/simulados/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosFormulario),
      });

      if (!resposta.ok) {
        const erroTxt = await resposta.text();
        throw new Error(`Erro no servidor: ${erroTxt}`);
      }

      const novoSimulado = await resposta.json();
      router.push(`/aluno/simulado/${novoSimulado.id}`);
    } catch (error) {
      console.error("Erro:", error);
      alert("Houve um erro ao gerar o simulado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Simulado livre"
        description="Monte seu próprio simulado — o sistema sorteia as questões do banco conforme seus critérios"
      />
      <section className="grid grid-cols-3 gap-4 px-8 py-6">
        <div className="col-span-2 flex flex-col gap-4">
          <Panel>
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-sm font-semibold text-white">Escolha o componente</h3>
              <button onClick={toggleTodos} className="text-xs text-amber-400 hover:text-amber-300">
                {selecionados.length === componentes.length ? "Desmarcar todos" : "Selecionar todos"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {componentes.map((c) => {
                const ativo = selecionados.includes(c.nome);
                return (
                  <button key={c.id} onClick={() => toggleComponente(c.nome)}
                    className={ativo
                      ? "flex items-center justify-between rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-200"
                      : "flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white"
                    }>
                    <span>{c.nome}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                      {c.assuntos?.length ?? 0} assuntos
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Disponibilidade */}
          <Panel>
            <h3 className="pb-3 text-sm font-semibold text-white">Questões disponíveis no banco</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-emerald-400/10 border border-emerald-400/20 p-3 text-center">
                <p className="font-mono text-2xl font-bold text-emerald-300">{disponibilidade.facil}</p>
                <p className="text-xs text-white/50 mt-1">Fáceis</p>
              </div>
              <div className="rounded-lg bg-amber-400/10 border border-amber-400/20 p-3 text-center">
                <p className="font-mono text-2xl font-bold text-amber-300">{disponibilidade.medio}</p>
                <p className="text-xs text-white/50 mt-1">Médias</p>
              </div>
              <div className="rounded-lg bg-rose-400/10 border border-rose-400/20 p-3 text-center">
                <p className="font-mono text-2xl font-bold text-rose-300">{disponibilidade.dificil}</p>
                <p className="text-xs text-white/50 mt-1">Difíceis</p>
              </div>
            </div>

            {/* Avisos */}
            {temAviso && (
              <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3">
                <p className="text-xs font-semibold text-rose-300 mb-1">⚠️ Questões insuficientes:</p>
                {avisos.map((aviso, i) => (
                  <p key={i} className="text-xs text-rose-200">{aviso}</p>
                ))}
              </div>
            )}
          </Panel>

          <Panel>
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-sm font-semibold text-white">Assuntos</h3>
              <span className="text-xs text-white/40">Todos selecionados</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assuntosVisiveis.map((a) => <Tag key={a} tone="blue">{a}</Tag>)}
            </div>
          </Panel>

          <Panel>
            <h3 className="pb-4 text-sm font-semibold text-white">Mix de dificuldade</h3>
            <div className="flex flex-col gap-5">
              {[
                { label: "Fácil", value: facil, set: setFacil, tone: "text-emerald-300", max: disponibilidade.facil },
                { label: "Médio", value: medio, set: setMedio, tone: "text-amber-300", max: disponibilidade.medio },
                { label: "Difícil", value: dificil, set: setDificil, tone: "text-rose-300", max: disponibilidade.dificil },
              ].map((d) => (
                <div key={d.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-white/70">{d.label}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/30">máx {d.max}</span>
                      <span className={`font-mono text-sm font-semibold ${d.value > d.max ? "text-rose-400" : d.tone} tabular-nums`}>
                        {d.value}
                      </span>
                    </div>
                  </div>
                   <input type="range" min={0} max={d.max} value={d.value}
                    onChange={(e) => d.set(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/5 accent-amber-400"
                  />
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-white/70">Duração (minutos)</Label>
              <span className="font-mono text-sm font-semibold text-amber-300 tabular-nums">{duracao} min</span>
            </div>
            <input type="range" min={10} max={180} step={5} value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/5 accent-amber-400"
            />
          </Panel>
        </div>

        <Panel className="self-start">
          <h3 className="pb-4 text-sm font-semibold text-white">Resumo do simulado</h3>
          <dl className="flex flex-col gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center justify-between text-sm">
              <dt className="text-white/50">Componentes</dt>
              <dd className="text-right font-medium text-white text-xs">{selecionados.join(", ")}</dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="text-white/50">Duração</dt>
              <dd className="font-mono text-white">{duracao} min</dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="text-white/50">Total de questões</dt>
              <dd className="font-mono text-base font-semibold text-amber-300">{total}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2 py-4 text-xs">
            <div className="flex justify-between text-emerald-300"><span>Fáceis</span><span className="font-mono">{facil}</span></div>
            <div className="flex justify-between text-amber-300"><span>Médias</span><span className="font-mono">{medio}</span></div>
            <div className="flex justify-between text-rose-300"><span>Difíceis</span><span className="font-mono">{dificil}</span></div>
          </div>
          <Button onClick={aoGerarSimulado} disabled={total === 0 || carregando || temAviso}
            className="h-10 w-full rounded-lg bg-amber-400 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300 disabled:opacity-50">
            <Icon.Play />
            {carregando ? "Gerando simulado..." : "Gerar e iniciar"}
          </Button>
          {temAviso && (
            <p className="pt-2 text-center text-[10px] text-rose-300">Ajuste as quantidades para continuar</p>
          )}
          <p className="pt-3 text-center text-[10px] uppercase tracking-[0.14em] text-white/30">Sorteio aleatório do banco</p>
        </Panel>
      </section>
    </>
  );
}