"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader, Panel, Stat } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { getHistorico } from "@/lib/aluno"
import type { HistoricoItem } from "@/lib/aluno"

function formatarData(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function Resultados() {
  const router = useRouter()
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    getHistorico()
      .then(setHistorico)
      .catch(() => setErro("Não foi possível carregar o histórico."))
      .finally(() => setCarregando(false))
  }, [])

  const totalRealizadas = historico.length
  const comNota = historico.filter((h) => h.pontuacao !== null)
  const mediaGeral = comNota.length > 0
    ? (comNota.reduce((acc, h) => acc + (h.pontuacao ?? 0), 0) / comNota.length).toFixed(1)
    : "—"
  const melhorNota = comNota.length > 0
    ? Math.max(...comNota.map((h) => h.pontuacao ?? 0)).toFixed(1)
    : "—"
  const melhorItem = comNota.find((h) => h.pontuacao === Math.max(...comNota.map((x) => x.pontuacao ?? 0)))
  const acertoTotal = historico.length > 0 && historico.some((h) => h.total > 0)
    ? Math.round(
        historico.reduce((acc, h) => acc + (h.acertos ?? 0), 0) /
        historico.reduce((acc, h) => acc + h.total, 0) * 100
      ) + "%"
    : "—"

  return (
    <>
      <PageHeader
        title="Resultados"
        description="Histórico de provas realizadas com gabarito"
      />

      <section className="grid grid-cols-4 gap-4 px-8 py-6">
        <Stat label="Provas realizadas" value={totalRealizadas} accent="amber" />
        <Stat label="Média geral" value={mediaGeral} accent="emerald" />
        <Stat
          label="Melhor nota"
          value={melhorNota}
          accent="blue"
          hint={melhorItem?.titulo ?? undefined}
        />
        <Stat label="Acertos totais" value={acertoTotal} accent="amber" />
      </section>

      <section className="px-8 pb-8">
        <Panel>
          <h2 className="pb-4 text-sm font-semibold text-white">Histórico</h2>

          {carregando && (
            <div className="flex h-32 items-center justify-center text-sm text-white/40">
              Carregando histórico...
            </div>
          )}

          {!carregando && erro && (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <p className="text-sm text-rose-300">{erro}</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setCarregando(true)
                  setErro(null)
                  getHistorico()
                    .then(setHistorico)
                    .catch(() => setErro("Não foi possível carregar o histórico."))
                    .finally(() => setCarregando(false))
                }}
                className="text-white/70 hover:bg-white/[0.05] hover:text-white"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {!carregando && !erro && historico.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <p className="text-sm font-medium text-white/60">Nenhuma prova realizada ainda</p>
              <p className="text-xs text-white/30">Suas provas finalizadas aparecerão aqui.</p>
              <Button
                variant="ghost"
                onClick={() => router.push("/aluno/provas")}
                className="mt-2 text-amber-400 hover:bg-amber-400/10 hover:text-amber-300"
              >
                Ver provas disponíveis
              </Button>
            </div>
          )}

          {!carregando && !erro && historico.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Prova</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Nota</th>
                    <th className="px-4 py-3 font-medium">Acerto</th>
                    <th className="px-4 py-3 font-medium">Gabarito</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historico.map((h) => (
                    <LinhaHistorico
                      key={h.resultadoId}
                      item={h}
                      onVerResultado={() =>
                        router.push(`/aluno/prova/${h.simuladoId}/resultado?resultadoId=${h.resultadoId}`)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </section>
    </>
  )
}

function LinhaHistorico({
  item,
  onVerResultado,
}: {
  item: HistoricoItem
  onVerResultado: () => void
}) {
  const percentual = item.total > 0 && item.acertos !== null
    ? Math.round((item.acertos / item.total) * 100)
    : null

  return (
    <tr className="text-white/80 hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-white">{item.titulo}</span>
          <span className="text-[11px] text-white/40">{item.componente}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-white/60">
        {formatarData(item.finalizadoEm)}
      </td>
      <td className="px-4 py-3 font-mono text-base font-semibold tabular-nums">
        {item.pontuacao !== null ? (
          <span className={
            item.pontuacao >= 7
              ? "text-emerald-400"
              : item.pontuacao >= 5
              ? "text-amber-400"
              : "text-red-400"
          }>
            {item.pontuacao.toFixed(1)}
          </span>
        ) : (
          <span className="text-white/30">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {percentual !== null ? (
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${percentual}%` }}
              />
            </div>
            <span className="w-8 text-right font-mono text-xs text-white/50">
              {percentual}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-white/30">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {item.gabaritoDisponivel ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Disponível
          </span>
        ) : (
          <span className="text-[11px] text-white/30" title={`Disponível após ${formatarDataHora(item.gabaritoDisponivelEm)}`}>
            Após {formatarDataHora(item.gabaritoDisponivelEm)}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          onClick={onVerResultado}
          className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
        >
          {item.gabaritoDisponivel ? "Ver gabarito" : "Ver resultado"}
        </Button>
      </td>
    </tr>
  )
}