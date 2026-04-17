"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const componentes = [
  "Matemática",
  "Língua Portuguesa",
  "Ciências da Natureza",
  "Ciências Humanas",
];

const assuntosPor: Record<string, string[]> = {
  "Matemática": ["Geometria", "Álgebra", "Trigonometria", "Estatística"],
  "Língua Portuguesa": ["Interpretação", "Gramática", "Literatura"],
  "Ciências da Natureza": ["Biologia", "Física", "Química"],
  "Ciências Humanas": ["História", "Geografia", "Filosofia", "Sociologia"],
};

export default function SimuladoLivre() {
  const [componente, setComponente] = useState("Matemática");
  const [facil, setFacil] = useState(3);
  const [medio, setMedio] = useState(5);
  const [dificil, setDificil] = useState(2);
  const [duracao, setDuracao] = useState(45);

  const total = facil + medio + dificil;

  return (
    <>
      <PageHeader
        title="Simulado livre"
        description="Monte seu próprio simulado — o sistema sorteia as questões do banco conforme seus critérios"
      />

      <section className="grid grid-cols-3 gap-4 px-8 py-6">
        <div className="col-span-2 flex flex-col gap-4">
          <Panel>
            <h3 className="pb-4 text-sm font-semibold text-white">Escolha o componente</h3>
            <div className="grid grid-cols-2 gap-2">
              {componentes.map((c) => (
                <button
                  key={c}
                  onClick={() => setComponente(c)}
                  className={
                    c === componente
                      ? "flex items-center justify-between rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-200"
                      : "flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white"
                  }
                >
                  <span>{c}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                    {assuntosPor[c].length} assuntos
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-sm font-semibold text-white">Assuntos</h3>
              <span className="text-xs text-white/40">Todos selecionados</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assuntosPor[componente].map((a) => (
                <Tag key={a} tone="blue">
                  {a}
                </Tag>
              ))}
            </div>
          </Panel>

          <Panel>
            <h3 className="pb-4 text-sm font-semibold text-white">
              Mix de dificuldade
            </h3>
            <div className="flex flex-col gap-5">
              {[
                { label: "Fácil", value: facil, set: setFacil, tone: "text-emerald-300", bar: "bg-emerald-400" },
                { label: "Médio", value: medio, set: setMedio, tone: "text-amber-300", bar: "bg-amber-400" },
                { label: "Difícil", value: dificil, set: setDificil, tone: "text-rose-300", bar: "bg-rose-400" },
              ].map((d) => (
                <div key={d.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-white/70">{d.label}</Label>
                    <span className={`font-mono text-sm font-semibold ${d.tone} tabular-nums`}>
                      {d.value}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    value={d.value}
                    onChange={(e) => d.set(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/5 accent-amber-400"
                  />
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-white/70">
                Duração (minutos)
              </Label>
              <span className="font-mono text-sm font-semibold text-amber-300 tabular-nums">
                {duracao} min
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={180}
              step={5}
              value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/5 accent-amber-400"
            />
          </Panel>
        </div>

        <Panel className="self-start">
          <h3 className="pb-4 text-sm font-semibold text-white">Resumo do simulado</h3>
          <dl className="flex flex-col gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center justify-between text-sm">
              <dt className="text-white/50">Componente</dt>
              <dd className="font-medium text-white">{componente}</dd>
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
            <div className="flex justify-between text-emerald-300">
              <span>Fáceis</span>
              <span className="font-mono">{facil}</span>
            </div>
            <div className="flex justify-between text-amber-300">
              <span>Médias</span>
              <span className="font-mono">{medio}</span>
            </div>
            <div className="flex justify-between text-rose-300">
              <span>Difíceis</span>
              <span className="font-mono">{dificil}</span>
            </div>
          </div>
          <Link href="/aluno/prova/simulado">
            <Button
              disabled={total === 0}
              className="h-10 w-full rounded-lg bg-amber-400 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300 disabled:opacity-50"
            >
              <Icon.Play />
              Gerar e iniciar
            </Button>
          </Link>
          <p className="pt-3 text-center text-[10px] uppercase tracking-[0.14em] text-white/30">
            Sorteio aleatório do banco
          </p>
        </Panel>
      </section>
    </>
  );
}
