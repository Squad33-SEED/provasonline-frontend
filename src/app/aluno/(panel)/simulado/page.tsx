"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PageHeader, Panel } from "@/components/app-shell"
import { Icon } from "@/components/icons"
import {
  getBancoQuestoes,
  getDisciplinas,
  selecionarSimulado,
  sortearSimulado,
  type DisciplinaSimulado,
  type QuestaoBanco,
} from "@/lib/simulado-livre"

type Modo = "sortear" | "selecionar"

export default function MontarSimuladoLivre() {
  const router = useRouter()

  const [disciplinas, setDisciplinas] = useState<DisciplinaSimulado[]>([])
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [modo, setModo] = useState<Modo>("sortear")
  const [duracao, setDuracao] = useState(45)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [facil, setFacil] = useState(3)
  const [medio, setMedio] = useState(5)
  const [dificil, setDificil] = useState(2)

  const [banco, setBanco] = useState<QuestaoBanco[]>([])
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set())
  const [filtroDif, setFiltroDif] = useState<string>("")

  useEffect(() => {
    getDisciplinas()
      .then((ds) => {
        setDisciplinas(ds)
        if (ds.length > 0) setSelecionados([ds[0].nome])
      })
      .catch(() => setErro("Não foi possível carregar as disciplinas"))
  }, [])

  const componenteIdsSelecionados = useMemo(
    () =>
      disciplinas
        .filter((d) => selecionados.includes(d.nome))
        .flatMap((d) => d.componenteIds),
    [disciplinas, selecionados],
  )

  const disp = useMemo(() => {
    return disciplinas
      .filter((d) => selecionados.includes(d.nome))
      .reduce(
        (acc, d) => ({
          facil: acc.facil + d.facil,
          medio: acc.medio + d.medio,
          dificil: acc.dificil + d.dificil,
        }),
        { facil: 0, medio: 0, dificil: 0 },
      )
  }, [disciplinas, selecionados])

  useEffect(() => {
    if (modo !== "selecionar" || componenteIdsSelecionados.length === 0) return
    getBancoQuestoes(
      componenteIdsSelecionados.join(","),
      filtroDif ? { dificuldade: filtroDif } : undefined,
    )
      .then(setBanco)
      .catch(() => setBanco([]))
  }, [modo, componenteIdsSelecionados, filtroDif])

  const totalSorteio = facil + medio + dificil
  const avisos: string[] = []
  if (facil > disp.facil) avisos.push(`Só há ${disp.facil} fáceis`)
  if (medio > disp.medio) avisos.push(`Só há ${disp.medio} médias`)
  if (dificil > disp.dificil) avisos.push(`Só há ${disp.dificil} difíceis`)

  function toggleComponente(nome: string) {
    setSelecionados((prev) =>
      prev.includes(nome)
        ? prev.length === 1
          ? prev
          : prev.filter((x) => x !== nome)
        : [...prev, nome],
    )
  }

  function toggleQuestao(id: string) {
    setMarcadas((prev) => {
      const novo = new Set(prev)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  async function gerar() {
    setErro(null)
    if (selecionados.length === 0) return
    try {
      setCarregando(true)
      let simulado
      if (modo === "sortear") {
        if (totalSorteio === 0 || avisos.length > 0) return
        simulado = await sortearSimulado({
          componenteIds: componenteIdsSelecionados,
          qtdFacil: facil,
          qtdMedio: medio,
          qtdDificil: dificil,
          duracaoMinutos: duracao,
        })
      } else {
        if (marcadas.size === 0) return
        simulado = await selecionarSimulado({
          componenteIds: componenteIdsSelecionados,
          questaoIds: [...marcadas],
          duracaoMinutos: duracao,
        })
      }
      router.push(`/aluno/simulado/${simulado.id}`)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar simulado")
    } finally {
      setCarregando(false)
    }
  }

  const podeGerar =
    selecionados.length > 0 &&
    !carregando &&
    (modo === "sortear" ? totalSorteio > 0 && avisos.length === 0 : marcadas.size > 0)

  return (
    <>
      <PageHeader
        title="Simulado livre"
        description="Monte seu próprio simulado de treino — escolha os componentes e como selecionar as questões"
      />

      <section className="grid grid-cols-3 gap-4 px-8 py-6">
        <div className="col-span-2 flex flex-col gap-4">
          <Panel>
            <h3 className="pb-4 text-sm font-semibold text-white">Disciplinas</h3>
            <div className="grid grid-cols-2 gap-2">
              {disciplinas.map((d) => {
                const ativo = selecionados.includes(d.nome)
                return (
                  <button
                    key={d.nome}
                    onClick={() => toggleComponente(d.nome)}
                    className={
                      ativo
                        ? "flex items-center justify-between rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-200"
                        : "flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white"
                    }
                  >
                    <span>{d.nome}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                      {d.totalQuestoes} questões
                    </span>
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel>
            <div className="flex gap-2 pb-4">
              <button
                onClick={() => setModo("sortear")}
                className={
                  modo === "sortear"
                    ? "flex-1 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-[#0c1a33]"
                    : "flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
                }
              >
                Sortear automaticamente
              </button>
              <button
                onClick={() => setModo("selecionar")}
                className={
                  modo === "selecionar"
                    ? "flex-1 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-[#0c1a33]"
                    : "flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
                }
              >
                Escolher questões
              </button>
            </div>

            {modo === "sortear" ? (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Fáceis", v: disp.facil, tone: "text-emerald-300" },
                    { label: "Médias", v: disp.medio, tone: "text-amber-300" },
                    { label: "Difíceis", v: disp.dificil, tone: "text-rose-300" },
                  ].map((d) => (
                    <div key={d.label} className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
                      <p className={`font-mono text-2xl font-bold ${d.tone}`}>{d.v}</p>
                      <p className="mt-1 text-xs text-white/50">{d.label}</p>
                    </div>
                  ))}
                </div>
                {[
                  { label: "Fácil", value: facil, set: setFacil, max: disp.facil, tone: "text-emerald-300" },
                  { label: "Médio", value: medio, set: setMedio, max: disp.medio, tone: "text-amber-300" },
                  { label: "Difícil", value: dificil, set: setDificil, max: disp.dificil, tone: "text-rose-300" },
                ].map((d) => (
                  <div key={d.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-white/70">{d.label}</Label>
                      <span className={`font-mono text-sm font-semibold ${d.value > d.max ? "text-rose-400" : d.tone}`}>
                        {d.value} <span className="text-white/30">/ {d.max}</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={d.max}
                      value={Math.min(d.value, d.max)}
                      onChange={(e) => d.set(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/5 accent-amber-400"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">Filtrar:</span>
                  {["", "FACIL", "MEDIO", "DIFICIL"].map((d) => (
                    <button
                      key={d || "todas"}
                      onClick={() => setFiltroDif(d)}
                      className={
                        filtroDif === d
                          ? "rounded-md bg-white/10 px-2.5 py-1 text-xs text-white"
                          : "rounded-md px-2.5 py-1 text-xs text-white/50 hover:text-white"
                      }
                    >
                      {d === "" ? "Todas" : d === "FACIL" ? "Fáceis" : d === "MEDIO" ? "Médias" : "Difíceis"}
                    </button>
                  ))}
                </div>
                <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
                  {banco.map((q) => {
                    const sel = marcadas.has(q.id)
                    return (
                      <button
                        key={q.id}
                        onClick={() => toggleQuestao(q.id)}
                        className={
                          sel
                            ? "flex items-start gap-3 rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-left"
                            : "flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-left hover:bg-white/[0.05]"
                        }
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${sel ? "border-amber-400 bg-amber-400 text-[#0c1a33]" : "border-white/30"}`}
                        >
                          {sel && <span className="text-[10px] font-bold">✓</span>}
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="line-clamp-2 text-sm text-white/80">{q.enunciado}</span>
                          <span className="flex gap-2 text-[10px] uppercase tracking-wider text-white/40">
                            <span>{q.assunto}</span>·<span>{q.dificuldade}</span>
                          </span>
                        </span>
                      </button>
                    )
                  })}
                  {banco.length === 0 && (
                    <p className="py-6 text-center text-sm text-white/40">
                      Nenhuma questão encontrada para este filtro.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-white/70">Duração (minutos)</Label>
              <span className="font-mono text-sm font-semibold text-amber-300">{duracao} min</span>
            </div>
            <input
              type="range"
              min={10}
              max={180}
              step={5}
              value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/5 accent-amber-400"
            />
          </Panel>
        </div>

        <Panel className="self-start">
          <h3 className="pb-4 text-sm font-semibold text-white">Resumo</h3>
          <dl className="flex flex-col gap-3 border-b border-white/10 pb-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/50">Componentes</dt>
              <dd className="font-mono text-white">{selecionados.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/50">Modo</dt>
              <dd className="text-white">{modo === "sortear" ? "Sorteio" : "Seleção"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/50">Total de questões</dt>
              <dd className="font-mono text-base font-semibold text-amber-300">
                {modo === "sortear" ? totalSorteio : marcadas.size}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/50">Duração</dt>
              <dd className="font-mono text-white">{duracao} min</dd>
            </div>
          </dl>

          {modo === "sortear" && avisos.length > 0 && (
            <div className="my-4 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3">
              <p className="text-xs font-semibold text-rose-300">Questões insuficientes:</p>
              {avisos.map((a) => (
                <p key={a} className="text-xs text-rose-200">
                  {a}
                </p>
              ))}
            </div>
          )}

          {erro && <p className="my-3 text-xs text-rose-400">{erro}</p>}

          <Button
            onClick={gerar}
            disabled={!podeGerar}
            className="mt-4 h-10 w-full rounded-lg bg-amber-400 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300 disabled:opacity-50"
          >
            <Icon.Play />
            {carregando ? "Gerando..." : "Gerar e iniciar"}
          </Button>
          <p className="pt-3 text-center text-[10px] uppercase tracking-[0.14em] text-white/30">
            Simulado de treino · correção imediata
          </p>
        </Panel>
      </section>
    </>
  )
}
