"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Stat, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

import {
  getEtapasDisponiveis,
  getHistorico,
  getProvaEmAndamento,
  getUsuarioLogado,
  type EtapaDisponivel,
  type HistoricoItem,
} from "@/lib/aluno";
import { getHistoricoSimuladoLivre } from "@/lib/simulado-livre";
import { getCertificados } from "@/lib/certificados";

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
  const router = useRouter();

  const [proximas, setProximas] = useState<EtapaDisponivel[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [nome, setNome] = useState("");
  const [qtdSimuladosLivres, setQtdSimuladosLivres] = useState(0);
  const [qtdCertificados, setQtdCertificados] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    getProvaEmAndamento().then((prova) => {
      if (prova.emAndamento && prova.simuladoId && prova.resultadoId) {
        router.replace(
          `/aluno/prova/${prova.simuladoId}/responder?resultadoId=${prova.resultadoId}&expiraEm=${encodeURIComponent(prova.expiraEm ?? "")}`
        )
        return
      }

      Promise.all([
        getEtapasDisponiveis(),
        getHistorico(),
        getUsuarioLogado().catch(() => null),
        getHistoricoSimuladoLivre().catch(() => []),
        getCertificados().catch(() => []),
      ])
        .then(([etapas, hist, usuario, simulados, certificados]) => {
          setProximas(etapas);
          setHistorico(hist);
          if (usuario) setNome(usuario.nome);
          setQtdSimuladosLivres(
            simulados.filter((s) => s.status === "FINALIZADO").length,
          );
          setQtdCertificados(certificados.length);
        })
        .finally(() => setCarregando(false));
    })
  }, [router]);

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

  const primeiroNome = nome.split(" ")[0] ?? "";

  const ultimosResultados = [...resultadosFinalizados]
    .sort((a, b) => (b.finalizadoEm ?? "").localeCompare(a.finalizadoEm ?? ""))
    .slice(0, 4);

  return (
    <>
      <PageHeader
        title={primeiroNome ? `Olá, ${primeiroNome}` : "Olá!"}
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
          value={qtdSimuladosLivres}
          accent="blue"
          hint="Realizados"
        />

        <Stat
          label="Certificados"
          value={qtdCertificados}
          accent="amber"
          hint="Emitidos"
        />
      </section>

      <section className="grid grid-cols-3 gap-4 px-8 pb-8">
        <Panel className="col-span-2">
          <h3 className="pb-4 text-sm font-semibold text-white">
            Próximas provas
          </h3>

          {carregando ? (
            <p className="text-sm text-white/40">Carregando provas...</p>
          ) : proximas.length === 0 ? (
            <p className="text-sm text-white/40">Nenhuma prova disponível.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {proximas.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-3.5"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{p.titulo}</span>

                      {p.ativa && (
                        <Tag tone="emerald">Pronta</Tag>
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
                  ) : p.statusResultado === "EM_ANDAMENTO" || p.ativa ? (
                    <Link href={`/aluno/prova/${p.id}/iniciar`}>
                      <Button className="h-8 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-[#0c1a33] hover:bg-amber-300">
                        {p.statusResultado === "EM_ANDAMENTO" ? "Continuar" : "Iniciar"}
                      </Button>
                    </Link>
                  ) : p.inscrito ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-400/70">
                      Inscrito · Aguardando início
                    </span>
                  ) : (
                    <Link href="/aluno/provas">
                      <Button className="h-8 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 text-xs font-semibold text-amber-300 hover:bg-amber-400/20">
                        Inscrever-se
                      </Button>
                    </Link>
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

          {ultimosResultados.length === 0 ? (
            <p className="text-sm text-white/40">Nenhum resultado ainda.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/5">
              {ultimosResultados.map((r) => {
                const acerto =
                  r.total > 0
                    ? Math.round(((r.acertos ?? 0) / r.total) * 100)
                    : 0;
                return (
                  <li
                    key={r.resultadoId}
                    className="flex items-center justify-between py-3 first:pt-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-white">{r.titulo}</span>

                      <span className="font-mono text-xs text-white/40">
                        {r.finalizadoEm ? formatarData(r.finalizadoEm) : ""}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-mono text-base font-semibold text-amber-300 tabular-nums">
                        {(r.pontuacao ?? 0).toFixed(1)}
                      </span>

                      <span className="text-xs text-emerald-300">
                        {acerto}% acertos
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </section>
    </>
  );
}