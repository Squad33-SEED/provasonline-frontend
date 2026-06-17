"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { useToast } from "@/components/feedback/toast-provider";
import { getSimulados } from "@/lib/simulados";
import { isApiClientError } from "@/lib/api-client";
import type { Simulado } from "@/lib/types";

export default function ProvasPage() {
  const toast = useToast();
  const [simulados, setSimulados] = React.useState<Simulado[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const lista = await getSimulados();
      setSimulados(lista);
    } catch (err) {
      const detail = isApiClientError(err)
        ? err.detail
        : "Erro ao carregar etapas";
      setErro(detail);
      toast.push({
        variant: "destructive",
        title: "Falha ao carregar etapas",
        description: detail,
      });
    } finally {
      setCarregando(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <>
      <PageHeader
        title="Etapas"
        description="Avaliações publicadas para os alunos da rede"
        action={
          <Link href="/admin/provas/nova">
            <Button className="bg-amber-400 text-[#0c1a33] hover:bg-amber-300">
              Nova etapa
            </Button>
          </Link>
        }
      />

      <section className="px-8 py-6">
        <Panel>
          {carregando && (
            <div className="flex h-48 items-center justify-center text-sm text-white/40">
              Carregando etapas...
            </div>
          )}

          {!carregando && erro && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <p className="text-sm text-rose-300">{erro}</p>
              <Button
                variant="ghost"
                onClick={() => void carregar()}
                className="text-white/70 hover:bg-white/[0.05] hover:text-white"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {!carregando && !erro && simulados.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <p className="text-sm font-medium text-white/70">
                Nenhuma etapa publicada ainda
              </p>
              <p className="max-w-md text-center text-xs text-white/40">
                Publique a primeira avaliação para que os alunos possam
                realizá-la durante a janela definida.
              </p>
              <Link href="/admin/provas/nova" className="mt-2">
                <Button className="bg-amber-400 text-[#0c1a33] hover:bg-amber-300">
                  Nova etapa
                </Button>
              </Link>
            </div>
          )}

          {!carregando && !erro && simulados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                      Etapa
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                      Componente
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                      Turmas
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                      Janela
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                      Vagas
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {simulados.map((s) => (
                    <LinhaSimulado key={s.id} simulado={s} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </section>
    </>
  );
}

function LinhaSimulado({ simulado }: { simulado: Simulado }) {
  const inicio = new Date(simulado.janelaInicio);
  const fim = new Date(simulado.janelaFim);
  const janela = `${formatarData(inicio)} → ${formatarData(fim)}`;

  return (
    <tr className="border-b border-white/[0.05] transition-colors hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-white">{simulado.titulo}</span>
          <span className="mt-0.5 flex items-center gap-3 text-[11px] text-white/40">
            <span>{simulado.duracaoMinutos} min</span>
            <span>{simulado.totalQuestoes} questões</span>
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-white/70">
        <div className="flex flex-col">
          <span>
            {(simulado.componentes?.length
              ? simulado.componentes
              : [simulado.componente]
            )
              .map((c) => c.nome)
              .join(" · ")}
          </span>
          <span className="text-[11px] text-white/40">
            {simulado.componente.modalidade.nome}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        {simulado.turmas.length === 0 ? (
          <span className="text-[11px] text-white/30 italic">Todas as turmas</span>
        ) : (
          <div className="flex flex-col gap-0.5">
            {simulado.turmas.slice(0, 2).map((t) => (
              <span key={t.id} className="text-[11px] text-white/60">
                {t.nome}
                <span className="text-white/30"> · {t.escolaNome}</span>
              </span>
            ))}
            {simulado.turmas.length > 2 && (
              <span className="text-[11px] text-amber-400/70">
                +{simulado.turmas.length - 2} turma{simulado.turmas.length - 2 > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-white/70">{janela}</td>
      <td className="px-4 py-3 text-right tabular-nums text-white/70">
        <span className={simulado.totalInscritos > 0 ? "text-amber-300" : ""}>
          {simulado.totalInscritos}
        </span>
        <span className="text-white/30"> / </span>
        {simulado.vagas}
      </td>
      <td className="px-4 py-3 text-right">
        <Tag>{simulado.status}</Tag>
      </td>
      <td className="px-4 py-3 text-right">
        <Link href={`/admin/provas/${simulado.id}`}>
          <button className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/50 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white/80">
            Detalhes
          </button>
        </Link>
      </td>
    </tr>
  );
}

function formatarData(d: Date): string {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const hora = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dia}/${mes} ${hora}:${min}`;
}