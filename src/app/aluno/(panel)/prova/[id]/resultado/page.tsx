"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getResultado } from "@/lib/aluno"
import type { ResultadoResponse } from "@/lib/aluno"

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
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <span className="text-sm">Carregando resultado…</span>
        </div>
      </div>
    )
  }

  if (erro || !resultado) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="w-10 h-10 text-red-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <p className="text-zinc-300 text-sm mb-4">{erro ?? "Resultado não encontrado."}</p>
          <button onClick={() => router.push("/aluno/provas")} className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
            Voltar às etapas
          </button>
        </div>
      </div>
    )
  }

  const percentualAcerto = resultado.total > 0 ? Math.round((resultado.acertos / resultado.total) * 100) : 0
  const corNota = resultado.pontuacao >= 7 ? "text-emerald-400" : resultado.pontuacao >= 5 ? "text-amber-400" : "text-red-400"
  const corBarra = resultado.pontuacao >= 7 ? "bg-emerald-500" : resultado.pontuacao >= 5 ? "bg-amber-500" : "bg-red-500"

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">

        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-zinc-500 mb-3">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
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
              <div className={`h-full rounded-full transition-all duration-700 ${corBarra}`} style={{ width: `${percentualAcerto}%` }} />
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
          <div className="flex flex-col gap-3">
            {resultado.gabarito.map((item) => (
              <div key={item.questaoId} className={`flex items-start gap-4 px-5 py-4 rounded-xl border ${item.correta ? "border-emerald-800 bg-emerald-950/30" : "border-red-900 bg-red-950/20"}`}>
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${item.correta ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {item.correta
                    ? <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-zinc-500 text-xs block mb-1">Questão {item.ordem}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-zinc-400">
                      Sua resposta:{" "}
                      <span className={item.correta ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                        {item.respostaAluno ?? "Não respondida"}
                      </span>
                    </span>
                    {!item.correta && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-zinc-400">
                          Correta: <span className="text-emerald-400 font-bold">{item.respostaCorreta}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push("/aluno/provas")}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Voltar às etapas
        </button>
      </div>
    </div>
  )
}