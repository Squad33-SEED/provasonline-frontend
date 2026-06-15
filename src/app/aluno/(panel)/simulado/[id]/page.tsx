"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  getSimuladoLivre,
  submeterSimuladoLivre,
  type QuestaoSL,
  type ResultadoSL,
} from "@/lib/simulado-livre"

const toneDif = (d: string) =>
  d === "FACIL" ? "text-emerald-300" : d === "MEDIO" ? "text-amber-300" : "text-rose-300"

export default function RealizarSimuladoLivre() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [titulo, setTitulo] = useState("")
  const [questoes, setQuestoes] = useState<QuestaoSL[]>([])
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [atual, setAtual] = useState(0)
  const [segundos, setSegundos] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoSL | null>(null)
  const [confirmando, setConfirmando] = useState(false)

  const respostasRef = useRef<Record<string, string>>({})
  useEffect(() => {
    respostasRef.current = respostas
  }, [respostas])

  const submeter = useCallback(async () => {
    if (enviando) return
    setEnviando(true)
    const itens = Object.entries(respostasRef.current).map(([questaoId, resposta]) => ({
      questaoId,
      resposta,
    }))
    try {
      const res = await submeterSimuladoLivre(id, itens)
      setResultado(res)
    } catch {
      setResultado(null)
    } finally {
      setEnviando(false)
    }
  }, [id, enviando])

  useEffect(() => {
    getSimuladoLivre(id)
      .then((s) => {
        setTitulo(s.titulo)
        setQuestoes(s.questoes)
        const iniciais: Record<string, string> = {}
        s.questoes.forEach((q) => {
          if (q.respostaSalva) iniciais[q.questaoId] = q.respostaSalva
        })
        setRespostas(iniciais)
        setSegundos(s.duracaoMinutos * 60)
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [id])

  useEffect(() => {
    if (segundos === null || resultado) return
    if (segundos <= 0) {
      submeter()
      return
    }
    const t = setInterval(() => setSegundos((s) => (s ?? 1) - 1), 1000)
    return () => clearInterval(t)
  }, [segundos, resultado, submeter])

  function fmt(s: number) {
    const m = Math.floor(s / 60)
    const ss = s % 60
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
  }

  if (carregando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
        Carregando simulado…
      </div>
    )
  }

  if (resultado) {
    const pct = resultado.total > 0 ? Math.round((resultado.acertos / resultado.total) * 100) : 0
    return (
      <section className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm uppercase tracking-wider text-white/50">Simulado concluído</p>
          <p className="mt-2 text-4xl font-bold text-amber-300">
            {resultado.pontuacao.toFixed(1)}
          </p>
          <p className="mt-1 text-sm text-white/60">
            {resultado.acertos} de {resultado.total} acertos ({pct}%)
          </p>
        </div>

        <h2 className="px-1 pb-3 pt-8 text-sm font-semibold text-white">Gabarito comentado</h2>
        <div className="flex flex-col gap-3">
          {resultado.gabarito.map((g) => (
            <div
              key={g.questaoId}
              className={`rounded-xl border p-4 ${g.correta ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs text-white/40">
                  Questão {g.ordem} · {g.assunto} · <span className={toneDif(g.dificuldade)}>{g.dificuldade}</span>
                </span>
                <span className={g.correta ? "text-xs font-semibold text-emerald-400" : "text-xs font-semibold text-rose-400"}>
                  {g.correta ? "Acertou" : "Errou"}
                </span>
              </div>
              <p className="text-sm text-white/85">{g.enunciado}</p>
              <div className="mt-3 flex flex-col gap-1 text-xs">
                <span className="text-white/60">
                  Sua resposta: <span className="font-mono font-semibold">{g.alternativaMarcada ?? "—"}</span>
                </span>
                <span className="text-emerald-300">
                  Resposta correta: <span className="font-mono font-semibold">{g.alternativaCorreta}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-8">
          <Button
            onClick={() => router.push("/aluno/simulado")}
            className="flex-1 rounded-lg border border-white/10 bg-transparent text-white/80 hover:bg-white/5"
          >
            Novo simulado
          </Button>
          <Button
            onClick={() => router.push("/aluno/resultados")}
            className="flex-1 rounded-lg bg-amber-400 font-semibold text-[#0c1a33] hover:bg-amber-300"
          >
            Ver histórico
          </Button>
        </div>
      </section>
    )
  }

  const q = questoes[atual]
  const respondidas = Object.keys(respostas).length

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">{atual + 1} / {questoes.length}</span>
          <span className="text-xs text-zinc-600">{respondidas} respondidas</span>
        </div>
        <span className="font-mono text-sm font-bold tabular-nums text-zinc-200">
          {segundos !== null ? fmt(segundos) : "--:--"}
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-6">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          {q && (
            <>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <span className="mb-3 block text-xs uppercase tracking-wider text-zinc-500">
                  Questão {q.ordem} · {q.assunto} · <span className={toneDif(q.dificuldade)}>{q.dificuldade}</span>
                </span>
                <p className="text-base leading-relaxed text-zinc-100">{q.enunciado}</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {q.alternativas.map((alt) => {
                  const sel = respostas[q.questaoId] === alt.letra
                  return (
                    <button
                      key={alt.letra}
                      onClick={() => setRespostas((p) => ({ ...p, [q.questaoId]: alt.letra }))}
                      className={`flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition ${sel ? "border-amber-400 bg-amber-400/10 text-white" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"}`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${sel ? "border-amber-400 bg-amber-400 text-[#0c1a33]" : "border-zinc-600 text-zinc-500"}`}>
                        {alt.letra}
                      </span>
                      <span className="pt-0.5 text-sm leading-relaxed">{alt.texto}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              onClick={() => setAtual((a) => Math.max(0, a - 1))}
              disabled={atual === 0}
              className="rounded-xl border border-zinc-700 bg-transparent text-zinc-400 disabled:opacity-30"
            >
              Anterior
            </Button>
            {atual < questoes.length - 1 ? (
              <Button
                onClick={() => setAtual((a) => a + 1)}
                className="rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              >
                Próxima
              </Button>
            ) : (
              <Button
                onClick={() => setConfirmando(true)}
                className="rounded-xl bg-amber-400 font-semibold text-[#0c1a33] hover:bg-amber-300"
              >
                Finalizar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-8 gap-1.5 pt-2">
            {questoes.map((qq, i) => {
              const r = !!respostas[qq.questaoId]
              return (
                <button
                  key={qq.questaoId}
                  onClick={() => setAtual(i)}
                  className={`aspect-square rounded-lg text-xs font-medium ${i === atual ? "bg-amber-400 text-[#0c1a33]" : r ? "border border-emerald-800 bg-emerald-900/50 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="font-semibold text-white">Finalizar simulado?</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Você respondeu {respondidas} de {questoes.length} questões. A correção será exibida na hora.
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                onClick={() => setConfirmando(false)}
                className="flex-1 rounded-xl border border-zinc-700 bg-transparent text-zinc-400"
              >
                Voltar
              </Button>
              <Button
                onClick={() => {
                  setConfirmando(false)
                  submeter()
                }}
                disabled={enviando}
                className="flex-1 rounded-xl bg-amber-400 font-semibold text-[#0c1a33] hover:bg-amber-300"
              >
                {enviando ? "Corrigindo…" : "Finalizar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
