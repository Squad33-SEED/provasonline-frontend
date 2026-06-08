"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Stat, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

import {
  getEtapasDisponiveis,
  getHistorico,
  type EtapaDisponivel,
  type HistoricoItem,
} from "@/lib/aluno";

const ultimas = [
  {
    id: "rt-988",
    nome: "Simulado — Álgebra",
    data: "14/04",
    nota: 8.5,
    acerto: 85,
  },
  {
    id: "rt-964",
    nome: "Avaliação — Funções",
    data: "04/04",
    nota: 7.2,
    acerto: 72,
  },
];

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlunoDashboard() {
  const [proximas, setProximas] = useState<EtapaDisponivel[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
  Promise.all([
    getEtapasDisponiveis(),
    getHistorico(),
  ])
    .then(([etapas, hist]) => {
      setProximas(etapas);
      setHistorico(hist);
    })
    .finally(() => setCarregando(false));
}, []);

const resultadosFinalizados = historico.filter(
  (h) =>
    h.statusResultado === "FINALIZADO" &&
    h.pontuacao !== null
);

const mediaGeral =
  resultadosFinalizados.length > 0
    ? (
        resultadosFinalizados.reduce(
          (acc, item) => acc + (item.pontuacao ?? 0),
          0
        ) / resultadosFinalizados.length
      ).toFixed(1)
    : "0.0";

  return (
    <>
      <PageHeader
        title="Olá, Lucas"
        description="Acompanhe suas provas agendadas e pratique com simulados livres"
        action={
          <Link href="/aluno/simulado">
            <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
              <Icon.Play />
              Iniciar simulado livre
            </Button>
          </Link>
        }
      />

      <section className="grid grid-cols-4 gap-4 px-8 py-6">
        <Stat
          label="Próximas provas"
          value={proximas.length}
          accent="amber"
          hint="Agendadas na sua turma"
        />

        <Stat
          label="Média geral"
          value={mediaGeral}
          accent="emerald"
          hint="Resultados das provas realizadas"
        />

        <Stat
          label="Simulados livres"
          value={12}
          accent="blue"
          hint="Realizados este mês"
        />

        <Stat
          label="Certificados"
          value={2}
          accent="amber"
          hint="Disponíveis para download"
        />
      </section>

      <section className="grid grid-cols-3 gap-4 px-8 pb-8">
        <Panel className="col-span-2">
          <h3 className="pb-4 text-sm font-semibold text-white">
            Próximas provas
          </h3>

          {carregando ? (
            <p className="text-sm text-white/40">
              Carregando provas...
            </p>
          ) : proximas.length === 0 ? (
            <p className="text-sm text-white/40">
              Nenhuma prova disponível.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {proximas.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-3.5"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {p.titulo}
                      </span>

                      {p.ativa && (
                        <Tag tone="emerald">
                          Pronta
                        </Tag>
                      )}
                    </div>

                    <p className="font-mono text-xs text-white/50">
                      {formatarData(p.janelaInicio)} ·{" "}
                      {formatarHora(p.janelaInicio)} ·{" "}
                      {p.duracaoMinutos} min
                    </p>
                  </div>

                  {p.statusResultado === "FINALIZADO" ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-400/70">
                      Concluída
                    </span>
                  ) : p.ativa ? (
                    <Link href={`/aluno/prova/${p.id}/iniciar`}>
                      <Button className="h-8 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-[#0c1a33] hover:bg-amber-300">
                        Iniciar
                  </Button>
                    </Link>
                  ) : (
  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
    Aguardando
  </span>
)}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <h3 className="pb-4 text-sm font-semibold text-white">
            Últimos resultados
          </h3>

          <ul className="flex flex-col divide-y divide-white/5">
            {ultimas.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between py-3 first:pt-0"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-white">
                    {r.nome}
                  </span>

                  <span className="font-mono text-xs text-white/40">
                    {r.data}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-mono text-base font-semibold text-amber-300 tabular-nums">
                    {r.nota.toFixed(1)}
                  </span>

                  <span className="text-xs text-emerald-300">
                    {r.acerto}% acertos
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </>
  );
}