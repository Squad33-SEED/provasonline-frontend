export interface ViolacaoOcorrencia {
  id: string
  resultadoId: string
  tipo: string
  detalhe: string | null
  criadoEm: string
  alunoNome: string
  alunoCpf: string
  etapaTitulo: string
  componenteNome: string
}

export interface ViolacaoEtapaResumo {
  simuladoId: string
  etapaTitulo: string
  totalViolacoes: number
  alunosEnvolvidos: number
}

export interface PainelViolacoes {
  total: number
  porEtapa: ViolacaoEtapaResumo[]
  ocorrencias: ViolacaoOcorrencia[]
}

export async function getViolacoes(): Promise<PainelViolacoes> {
  const res = await fetch("/api/violacoes", { cache: "no-store" })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? "Erro ao carregar violações")
  }
  return res.json()
}

export async function getViolacoesProfessor(): Promise<PainelViolacoes> {
  const res = await fetch("/api/professor/violacoes", { cache: "no-store" })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? "Erro ao carregar violações")
  }
  return res.json()
}
