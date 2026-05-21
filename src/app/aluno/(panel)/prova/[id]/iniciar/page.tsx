"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { iniciarProva } from "@/lib/aluno"

export default function IniciarProvaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [iniciando, setIniciando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleIniciar() {
    setIniciando(true)
    setErro(null)
    await iniciarProva(id)
      .then((dados) => {
        router.push(
          `/aluno/prova/${id}/responder?resultadoId=${dados.resultadoId}&expiraEm=${encodeURIComponent(dados.expiraEm)}`
        )
      })
      .catch(() => {
        setErro("Não foi possível iniciar a prova. Verifique se a etapa ainda está dentro da janela.")
        setIniciando(false)
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-emerald-400 mb-4">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Etapa disponível
          </span>
          <h1 className="text-3xl font-bold text-white leading-tight mb-2">
            Antes de começar
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Leia as instruções com atenção. O cronômetro inicia assim que você clicar em Começar agora.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {[
            {
              svg: <svg className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              texto: "O tempo corre a partir do momento em que você iniciar a prova.",
            },
            {
              svg: <svg className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
              texto: "Suas respostas são salvas automaticamente a cada 30 segundos.",
            },
            {
              svg: <svg className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.67"/></svg>,
              texto: "Se perder a conexão, pode reabrir a prova e continuar de onde parou.",
            },
            {
              svg: <svg className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
              texto: "Não é possível realizar a mesma etapa mais de uma vez.",
            },
            {
              svg: <svg className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
              texto: "O gabarito é liberado somente após você finalizar.",
            },
          ].map(({ svg, texto }, i) => (
            <div key={i} className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
              {svg}
              <span className="text-zinc-300 text-sm leading-relaxed">{texto}</span>
            </div>
          ))}
        </div>

        {erro && (
          <div className="mb-4 flex items-center gap-2 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            {erro}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-200 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={handleIniciar}
            disabled={iniciando}
            className="flex-[2] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {iniciando ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Iniciando…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Começar agora
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}