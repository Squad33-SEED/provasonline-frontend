"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import {
  getComponentes,
  getBancoQuestoesProfessor,
} from "@/lib/simulados";
import type { ComponenteCatalogo, ProfessorQuestaoItem } from "@/lib/types";

const dificuldadeTone = (d: string) =>
  d === "FACIL" ? "emerald" : d === "MEDIO" ? "amber" : "rose";

export default function BancoQuestoes() {
  const [componentes, setComponentes] = useState<ComponenteCatalogo[]>([]);
  const [componenteId, setComponenteId] = useState<string | null>(null);
  const [questoes, setQuestoes] = useState<ProfessorQuestaoItem[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getComponentes()
      .then((cs) => {
        setComponentes(cs);
        if (cs.length > 0) {
          setComponenteId(cs[0].id);
        } else {
          setCarregando(false);
        }
      })
      .catch(() => {
        setErro("Falha ao carregar os componentes.");
        setCarregando(false);
      });
  }, []);

  useEffect(() => {
    if (!componenteId) return;
    setCarregando(true);
    setErro(null);
    getBancoQuestoesProfessor(componenteId)
      .then(setQuestoes)
      .catch((e: { detail?: string }) =>
        setErro(e?.detail ?? "Falha ao carregar as questões."),
      )
      .finally(() => setCarregando(false));
  }, [componenteId]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return questoes;
    return questoes.filter((q) => q.enunciado.toLowerCase().includes(termo));
  }, [questoes, busca]);

  return (
    <>
      <PageHeader
        title="Banco de questões"
        description="Acervo puxado da API Questions (questions.zenixcode.cloud) — selecione o componente"
      />

      <section className="px-8 py-6">
        <Panel>
          <div className="flex items-center justify-between pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {componentes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setComponenteId(c.id)}
                  className={
                    c.id === componenteId
                      ? "rounded-lg bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 ring-1 ring-amber-400/20"
                      : "rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                  }
                >
                  {c.nome}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar no enunciado"
                className="w-64 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
          </div>

          {carregando ? (
            <p className="py-12 text-center text-sm text-white/40">
              Carregando questões…
            </p>
          ) : erro ? (
            <p className="py-12 text-center text-sm text-rose-300">{erro}</p>
          ) : filtradas.length === 0 ? (
            <p className="py-12 text-center text-sm text-white/40">
              Nenhuma questão encontrada para este componente.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {filtradas.map((q) => (
                <li
                  key={q.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Tag tone={dificuldadeTone(q.dificuldade)}>
                        {q.dificuldade}
                      </Tag>
                      <Tag tone="blue">{q.assunto}</Tag>
                      <span className="font-mono text-[10px] text-white/30">
                        {q.id}
                      </span>
                    </div>
                    <p className="text-sm text-white/80">{q.enunciado}</p>
                    <p className="text-xs text-white/40">
                      {q.totalAlternativas} alternativas · 1 correta
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </>
  );
}
