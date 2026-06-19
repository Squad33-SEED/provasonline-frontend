"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getResultado } from "@/lib/aluno"
import type { ResultadoResponse } from "@/lib/aluno"

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ResultadoProvaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const resultadoId = searchParams.get("resultadoId") ?? ""

  const [resultado, setResultado] = useState<ResultadoResponse | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [gabaritoAberto, setGabaritoAberto] = useState(false)

  useEffect(() => {
    if (!resultadoId) return
    getResultado(resultadoId)
      .then(setResultado)
      .catch(() => setErro("Não foi possível carregar o resultado."))
      .finally(() => setCarregando(false))
  }, [resultadoId])

  if (carregando) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span className="text-sm">Carregando resultado…</span>
        </div>
      </div>
    )
  }

  if (erro || !resultado) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="w-10 h-10 text-red-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <p className="text-zinc-300 text-sm mb-4">{erro ?? "Resultado não encontrado."}</p>
          <button
            onClick={() => router.push("/aluno/provas")}
            className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            Voltar às etapas
          </button>
        </div>
      </div>
    )
  }

  const percentualAcerto = resultado.total > 0
    ? Math.round((resultado.acertos / resultado.total) * 100)
    : 0
  const corNota = resultado.pontuacao >= 7
    ? "text-emerald-400"
    : resultado.pontuacao >= 5
    ? "text-amber-400"
    : "text-red-400"
  const corBarra = resultado.pontuacao >= 7
    ? "bg-emerald-500"
    : resultado.pontuacao >= 5
    ? "bg-amber-500"
    : "bg-red-500"

  const corNotaComponente = (nota: number) =>
    nota >= 7 ? "text-emerald-400" : nota >= 5 ? "text-amber-400" : "text-red-400"
  const corBarraComponente = (nota: number) =>
    nota >= 7 ? "bg-emerald-500" : nota >= 5 ? "bg-amber-500" : "bg-red-500"

  // Agrupa o gabarito por componente quando a etapa é multi-componente (ENEM).
  const nomeComponente = new Map(
    (resultado.componentes ?? []).map((c) => [c.componenteId, c.componente]),
  )
  const gabaritoPorComponente: {
    componenteId: string | null
    nome: string | null
    itens: NonNullable<ResultadoResponse["gabarito"]>
  }[] = []
  if (resultado.gabarito) {
    const indice = new Map<string | null, number>()
    for (const item of resultado.gabarito) {
      const chave = item.componenteId ?? null
      let pos = indice.get(chave)
      if (pos === undefined) {
        pos = gabaritoPorComponente.length
        indice.set(chave, pos)
        gabaritoPorComponente.push({
          componenteId: chave,
          nome: chave ? nomeComponente.get(chave) ?? null : null,
          itens: [],
        })
      }
      gabaritoPorComponente[pos].itens.push(item)
    }
  }
  const agruparGabarito =
    gabaritoPorComponente.filter((g) => g.componenteId !== null).length > 1

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">

        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-zinc-500 mb-3">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Prova finalizada
          </span>
          <h1 className="text-2xl font-bold text-white mb-1">{resultado.simulado.titulo}</h1>
          <p className="text-zinc-500 text-sm">{resultado.simulado.componente}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-4">
          <span className={`text-7xl font-black tabular-nums leading-none ${corNota}`}>
            {resultado.pontuacao.toFixed(1)}
          </span>
          <span className="text-zinc-500 text-sm">nota final</span>
          <div className="w-full max-w-xs">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${corBarra}`}
                style={{ width: `${percentualAcerto}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-zinc-500">
              <span>{resultado.acertos} acertos</span>
              <span>{resultado.total - resultado.acertos} erros</span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-2 text-sm">
            <div className="text-center">
              <span className="block text-2xl font-bold text-white">{resultado.acertos}</span>
              <span className="text-zinc-500 text-xs">acertos</span>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-white">{resultado.total}</span>
              <span className="text-zinc-500 text-xs">questões</span>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-white">{percentualAcerto}%</span>
              <span className="text-zinc-500 text-xs">aproveitamento</span>
            </div>
          </div>
        </div>

        {resultado.componentes && resultado.componentes.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-zinc-300">Desempenho por componente</h2>
            <div className="flex flex-col gap-3.5">
              {resultado.componentes.map((c) => {
                const pct = c.total > 0 ? Math.round((c.acertos / c.total) * 100) : 0
                return (
                  <div key={c.componenteId} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-200 text-sm truncate">{c.componente}</span>
                        {c.aprovado !== null && (
                          <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                            c.aprovado
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-red-500/15 text-red-400"
                          }`}>
                            {c.aprovado ? "Aprovado" : "Pendente"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-zinc-500 text-xs tabular-nums">{c.acertos}/{c.total}</span>
                        <span className={`text-sm font-bold tabular-nums ${corNotaComponente(c.nota)}`}>
                          {c.nota.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${corBarraComponente(c.nota)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {resultado.gabaritoDisponivel && resultado.gabarito ? (
          <>
            <button
              onClick={() => setGabaritoAberto((v) => !v)}
              className="flex items-center justify-between w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl px-5 py-4 text-left transition-colors"
            >
              <span className="text-zinc-200 font-medium text-sm">Ver gabarito completo</span>
              {gabaritoAberto
                ? <svg className="w-4 h-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                : <svg className="w-4 h-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              }
            </button>

            {gabaritoAberto && (
              <div className="flex flex-col gap-5">
                {gabaritoPorComponente.map((grupo) => (
                  <div key={grupo.componenteId ?? "_"} className="flex flex-col gap-3">
                    {agruparGabarito && (
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          {grupo.nome ?? "Sem componente"}
                        </span>
                        <span className="text-zinc-600 text-xs">
                          ({grupo.itens.filter((i) => i.correta).length}/{grupo.itens.length})
                        </span>
                        <div className="flex-1 h-px bg-zinc-800" />
                      </div>
                    )}
                    {grupo.itens.map((item) => (
                      <div
                        key={item.questaoId}
                        className={`flex flex-col gap-3 px-5 py-4 rounded-xl border ${
                          item.correta
                            ? "border-emerald-800 bg-emerald-950/30"
                            : "border-red-900 bg-red-950/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                            item.correta
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {item.correta
                              ? <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                              : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-zinc-500 text-xs block mb-1">Questão {item.ordem}</span>
                            <p className="text-zinc-200 text-sm leading-relaxed">{item.enunciado}</p>
                          </div>
                        </div>

                        <div className="ml-10 flex flex-col gap-1.5">
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-zinc-500 shrink-0">Sua resposta:</span>
                            <span className={`font-medium ${item.correta ? "text-emerald-400" : "text-red-400"}`}>
                              {item.alternativaMarcada ?? "Não respondida"}
                            </span>
                          </div>
                          {!item.correta && (
                            <div className="flex items-start gap-2 text-sm">
                              <span className="text-zinc-500 shrink-0">Resposta correta:</span>
                              <span className="font-medium text-emerald-400">{item.alternativaCorreta}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-start gap-4 rounded-2xl border border-amber-800/40 bg-amber-950/20 px-5 py-4">
            <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div className="flex flex-col gap-0.5">
              <span className="text-amber-300 text-sm font-medium">Gabarito ainda não disponível</span>
              <span className="text-amber-400/70 text-xs">
                Disponível após {formatarDataHora(resultado.gabaritoDisponivelEm)} — quando a janela da etapa encerrar.
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/aluno/resultados")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            Meu histórico
          </button>
          <button
            onClick={() => router.push("/aluno/provas")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Voltar às etapas
          </button>
        </div>
      </div>
    </div>
  )
}