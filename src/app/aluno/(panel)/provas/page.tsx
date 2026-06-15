"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import {
  getEtapasDisponiveis,
  inscreverEmProva,
  type EtapaDisponivel,
} from "@/lib/aluno";

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type TagInfo = { tone: "emerald" | "amber" | "rose"; label: string }

function resolverTag(e: EtapaDisponivel): TagInfo {
  if (e.statusResultado === "FINALIZADO") return { tone: "emerald", label: "Realizada ✓" }
  if (e.statusResultado === "EXPIRADO")   return { tone: "rose",    label: "Expirada" }
  if (e.statusResultado === "EM_ANDAMENTO") return { tone: "amber", label: "Em andamento" }
  if (e.ativa)    return { tone: "emerald", label: "Disponível agora" }
  if (e.inscrito) return { tone: "amber",   label: "Inscrito" }
  return { tone: "amber", label: "Agendada" }
}

interface AcaoProps {
  etapa: EtapaDisponivel
  onNavegar: (href: string) => void
  onInscrever: (id: string) => Promise<void>
  inscrevendo: boolean
}

function AcaoEtapa({ etapa, onNavegar, onInscrever, inscrevendo }: AcaoProps) {
  if (etapa.statusResultado === "FINALIZADO") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-400/70">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Concluída
      </span>
    )
  }

  if (etapa.statusResultado === "EXPIRADO") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
        Tentativa expirada
      </span>
    )
  }

  if (etapa.statusResultado === "EM_ANDAMENTO") {
    return (
      <Button
        onClick={() => onNavegar(`/aluno/prova/${etapa.id}/iniciar`)}
        className="h-8 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-[#0c1a33] hover:bg-amber-300"
      >
        Continuar prova
      </Button>
    )
  }

  if (etapa.ativa) {
    return (
      <Button
        onClick={() => onNavegar(`/aluno/prova/${etapa.id}/iniciar`)}
        className="h-8 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-[#0c1a33] hover:bg-amber-300"
      >
        Fazer prova
      </Button>
    )
  }

  if (etapa.inscrito) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-400/70">
        Inscrito · Início em {formatarData(etapa.janelaInicio)}
      </span>
    )
  }

  if (etapa.vagasDisponiveis <= 0) {
    return (
      <Button
        disabled
        className="h-8 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/30 disabled:opacity-100"
      >
        Vagas esgotadas
      </Button>
    )
  }

  return (
    <Button
      onClick={() => onInscrever(etapa.id)}
      disabled={inscrevendo}
      className="h-8 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 disabled:opacity-50"
    >
      {inscrevendo ? "Inscrevendo..." : "Inscrever-se"}
    </Button>
  )
}

export default function ProvasAluno() {
  const router = useRouter();
  const [etapas, setEtapas] = useState<EtapaDisponivel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [inscrevendoId, setInscrevendoId] = useState<string | null>(null);

  useEffect(() => {
    getEtapasDisponiveis()
      .then(setEtapas)
      .catch(() => setErro("Não foi possível carregar as etapas."))
      .finally(() => setCarregando(false));
  }, []);

  async function handleInscrever(id: string) {
    setInscrevendoId(id);
    try {
      await inscreverEmProva(id);
      setEtapas((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                inscrito: true,
                vagasDisponiveis: Math.max(e.vagasDisponiveis - 1, 0),
              }
            : e
        )
      );
    } catch (err) {
      setErro(
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível realizar a inscrição. Tente novamente."
      );
    } finally {
      setInscrevendoId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Provas reais"
        description="Etapas publicadas pela coordenação — inscreva-se e realize a prova na janela disponível"
      />

      <section className="px-8 py-6">
        {carregando && (
          <p className="text-sm text-white/40">Carregando etapas...</p>
        )}

        {!carregando && erro && (
          <Panel>
            <p className="text-sm text-rose-400">{erro}</p>
          </Panel>
        )}

        {!carregando && !erro && etapas.length === 0 && (
          <Panel>
            <p className="text-sm text-white/40">
              Nenhuma prova disponível no momento.
            </p>
          </Panel>
        )}

        {!carregando && !erro && etapas.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {etapas.map((e) => {
              const tag = resolverTag(e);
              return (
                <Panel key={e.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Tag tone={tag.tone}>{tag.label}</Tag>
                        {e.geraCertificado && (
                          <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300 ring-1 ring-amber-400/30">
                            Certificadora
                          </span>
                        )}
                      </div>
                      <h3 className="pt-2 text-base font-semibold text-white">
                        {e.titulo}
                      </h3>
                      <p className="text-xs text-white/50">
                        {e.componente.nome} · {e.componente.modalidade}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                        Início
                      </span>
                      <span className="pt-1 font-mono text-xs text-white/70">
                        {formatarData(e.janelaInicio)}
                      </span>
                      <span className="font-mono text-xs text-white/40">
                        {formatarHora(e.janelaInicio)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                        Duração
                      </span>
                      <span className="pt-1 font-mono text-xs text-white/70">
                        {e.duracaoMinutos} min
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                        Questões
                      </span>
                      <span className="pt-1 font-mono text-xs text-white/70">
                        {e.totalQuestoes}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                        Vagas
                      </span>
                      <span
                        className={`pt-1 font-mono text-xs ${
                          e.vagasDisponiveis <= 0 ? "text-rose-400" : "text-white/70"
                        }`}
                      >
                        {e.vagasDisponiveis} / {e.vagasTotais}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <AcaoEtapa
                      etapa={e}
                      onNavegar={router.push}
                      onInscrever={handleInscrever}
                      inscrevendo={inscrevendoId === e.id}
                    />
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
