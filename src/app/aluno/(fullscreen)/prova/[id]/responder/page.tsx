"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { autoSaveRespostas, iniciarProva, submeterProva } from "@/lib/aluno"
import type { QuestaoParaAluno } from "@/lib/aluno"
import { useModoSeguro } from "@/lib/use-modo-seguro"

const AUTO_SAVE_INTERVAL_MS = 30_000

export default function ResponderProvaPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const resultadoId = searchParams.get("resultadoId") ?? ""
  const expiraEmStr = searchParams.get("expiraEm") ?? ""

  const [questoes, setQuestoes] = useState<QuestaoParaAluno[]>([])
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [questaoAtual, setQuestaoAtual] = useState(0)
  const [segundosRestantes, setSegundosRestantes] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [submetendo, setSubmetendo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [ultimoSalvo, setUltimoSalvo] = useState<Date | null>(null)
  const [confirmandoFinalizar, setConfirmandoFinalizar] = useState(false)

  const respostasRef = useRef<Record<string, string>>({})

  const provaAtiva = !carregando && !submetendo && questoes.length > 0
  const {
    totalViolacoes,
    emTelaCheia,
    alertaVisivel,
    mensagemAlerta,
    entrarTelaCheia,
    dispensarAlerta,
  } = useModoSeguro({ resultadoId, ativo: provaAtiva })

  useEffect(() => {
    respostasRef.current = respostas
  }, [respostas])

  const executarSubmit = useCallback(async () => {
    if (submetendo) return
    setSubmetendo(true)
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {})
    }
    await submeterProva(resultadoId)
      .then(() => router.replace(`/aluno/prova/${id}/resultado?resultadoId=${resultadoId}`))
      .catch(() => router.replace(`/aluno/prova/${id}/resultado?resultadoId=${resultadoId}`))
  }, [id, resultadoId, router, submetendo])

  const executarAutoSave = useCallback(async () => {
    const itens = Object.entries(respostasRef.current).map(([questaoId, resposta]) => ({
      questaoId,
      resposta,
    }))
    if (itens.length === 0) return
    setSalvando(true)
    await autoSaveRespostas(resultadoId, itens)
      .then(() => setUltimoSalvo(new Date()))
      .catch(() => {})
      .finally(() => setSalvando(false))
  }, [resultadoId])

  useEffect(() => {
    if (!resultadoId) return
    iniciarProva(id)
      .then((dados) => {
        setQuestoes(dados.questoes)
        const iniciais: Record<string, string> = {}
        dados.questoes.forEach((q) => {
          if (q.respostaSalva) iniciais[q.questaoId] = q.respostaSalva
        })
        setRespostas(iniciais)
        const expiraEm = new Date(expiraEmStr || dados.expiraEm)
        const diff = Math.floor((expiraEm.getTime() - Date.now()) / 1000)
        setSegundosRestantes(Math.max(0, diff))
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [id, resultadoId, expiraEmStr])

  useEffect(() => {
    if (segundosRestantes === null) return
    if (segundosRestantes <= 0) { executarSubmit(); return }
    const tick = setInterval(() => setSegundosRestantes((s) => (s ?? 1) - 1), 1000)
    return () => clearInterval(tick)
  }, [segundosRestantes, executarSubmit])

  useEffect(() => {
    const intervalo = setInterval(executarAutoSave, AUTO_SAVE_INTERVAL_MS)
    return () => clearInterval(intervalo)
  }, [executarAutoSave])

  function formatarTempo(segundos: number) {
    const h = Math.floor(segundos / 3600)
    const m = Math.floor((segundos % 3600) / 60)
    const s = segundos % 60
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const questaoAtualDados = questoes[questaoAtual]
  const totalRespondidas = Object.keys(respostas).length
  const percentual = questoes.length > 0 ? (totalRespondidas / questoes.length) * 100 : 0
  const tempoPerigoso = (segundosRestantes ?? Infinity) < 300

  if (carregando) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <span className="text-sm">Carregando questões…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-zinc-500 text-sm shrink-0">{questaoAtual + 1} / {questoes.length}</span>
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden min-w-[80px]">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${percentual}%` }} />
          </div>
          <span className="text-zinc-500 text-xs shrink-0">{totalRespondidas} respondidas</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {totalViolacoes > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-950/60 text-red-400 border border-red-800" title="Ocorrências de segurança registradas">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {totalViolacoes}
            </span>
          )}
          {salvando ? (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Salvando…
            </span>
          ) : ultimoSalvo ? (
            <span className="text-xs text-zinc-600">
              Salvo às {ultimoSalvo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : null}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold tabular-nums ${tempoPerigoso ? "bg-red-950/60 text-red-400 border border-red-800" : "bg-zinc-800 text-zinc-200"}`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {segundosRestantes !== null ? formatarTempo(segundosRestantes) : "--:--"}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {questaoAtualDados && (
            <>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 block">Questão {questaoAtualDados.ordem}</span>
                <p className="text-zinc-100 text-base leading-relaxed">{questaoAtualDados.enunciado}</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {questaoAtualDados.alternativas.map((alt) => {
                  const selecionada = respostas[questaoAtualDados.questaoId] === alt.letra
                  return (
                    <button
                      key={alt.letra}
                      onClick={() => setRespostas((prev) => ({ ...prev, [questaoAtualDados.questaoId]: alt.letra }))}
                      className={`w-full flex items-start gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-150 ${selecionada ? "border-emerald-500 bg-emerald-950/40 text-white" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white"}`}
                    >
                      <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${selecionada ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "border-zinc-600 text-zinc-500"}`}>
                        {alt.letra}
                      </span>
                      <span className="text-sm leading-relaxed pt-0.5">{alt.texto}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setQuestaoAtual((q) => Math.max(0, q - 1))}
              disabled={questaoAtual === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Anterior
            </button>
            {questaoAtual < questoes.length - 1 ? (
              <button
                onClick={() => setQuestaoAtual((q) => q + 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm transition-colors"
              >
                Próxima
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ) : (
              <button
                onClick={() => setConfirmandoFinalizar(true)}
                disabled={submetendo}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Finalizar prova
              </button>
            )}
          </div>

          <div className="grid grid-cols-8 gap-1.5 pt-2">
            {questoes.map((q, i) => {
              const respondida = !!respostas[q.questaoId]
              const atual = i === questaoAtual
              return (
                <button
                  key={q.questaoId}
                  onClick={() => setQuestaoAtual(i)}
                  className={`aspect-square rounded-lg text-xs font-medium transition-colors ${atual ? "bg-emerald-500 text-zinc-950" : respondida ? "bg-emerald-900/60 text-emerald-400 border border-emerald-800" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {provaAtiva && !emTelaCheia && (
        <div className="fixed inset-0 z-[60] bg-zinc-950/95 backdrop-blur flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-zinc-900 border border-amber-800/60 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/></svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Modo seguro de avaliação</h3>
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
              Esta é uma prova oficial. Para continuar, ative o modo tela cheia. Sair da tela cheia, trocar de aba ou copiar conteúdo será registrado e o professor será notificado.
            </p>
            <button
              onClick={entrarTelaCheia}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-colors"
            >
              Entrar em tela cheia e iniciar
            </button>
          </div>
        </div>
      )}

      {alertaVisivel && (
        <div className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-red-800 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Ação registrada</h3>
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">{mensagemAlerta}</p>
            <button
              onClick={() => { dispensarAlerta(); if (!emTelaCheia) void entrarTelaCheia() }}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition-colors"
            >
              Entendi, voltar à prova
            </button>
          </div>
        </div>
      )}

      {confirmandoFinalizar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-950/60 border border-amber-800 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Finalizar prova?</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm mb-5">
              Você respondeu <span className="text-white font-medium">{totalRespondidas}</span> de{" "}
              <span className="text-white font-medium">{questoes.length}</span> questões.{" "}
              {totalRespondidas < questoes.length && (
                <span className="text-amber-400">{questoes.length - totalRespondidas} questão(ões) sem resposta serão contadas como erradas.</span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmandoFinalizar(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 hover:text-zinc-200 transition-colors"
              >
                Continuar
              </button>
              <button
  onClick={async () => {
    setConfirmandoFinalizar(false);

    const itens = Object.entries(respostas).map(([questaoId, resposta]) => ({
      questaoId,
      resposta,
    }));

    if (itens.length > 0) {
      await autoSaveRespostas(resultadoId, itens);
    }

    await executarSubmit();
  }}
  disabled={submetendo}
  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-colors"
>
                {submetendo ? "Enviando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}