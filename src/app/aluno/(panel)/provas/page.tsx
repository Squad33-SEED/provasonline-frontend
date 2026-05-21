"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { getEtapasDisponiveis, type EtapaDisponivel } from "@/lib/aluno";

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

export default function ProvasAluno() {
  const router = useRouter();
  const [etapas, setEtapas] = useState<EtapaDisponivel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getEtapasDisponiveis()
      .then(setEtapas)
      .catch(() => {
        setErro("Não foi possível carregar as etapas.");
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Provas disponíveis"
        description="Etapas publicadas pela coordenação — o cronômetro inicia ao abrir a prova"
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
              Nenhuma etapa disponível no momento.
            </p>
          </Panel>
        )}

        {!carregando && !erro && etapas.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {etapas.map((e) => (
              <Panel key={e.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <Tag tone={e.ativa ? "emerald" : "amber"}>
                      {e.ativa ? "Pronta para iniciar" : "Agendada"}
                    </Tag>
                    <h3 className="pt-2 text-base font-semibold text-white">
                      {e.titulo}
                    </h3>
                    <p className="text-xs text-white/50">
                      {e.componente.nome} · {e.componente.modalidade}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
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
                </div>

                <div className="mt-4 flex items-center justify-end">
                  {e.ativa ? (
                    <Button
                      onClick={() => router.push(`/aluno/prova/${e.id}/iniciar`)}
                      className="h-8 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-[#0c1a33] hover:bg-amber-300"
                    >
                      Iniciar prova
                    </Button>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
                      Disponível em {formatarData(e.janelaInicio)}
                    </span>
                  )}
                </div>
              </Panel>
            ))}
          </div>
        )}
      </section>
    </>
  );
}