export interface ProfessorTurma {
  id: string
  nome: string
  anoLetivo: number
  escolaNome: string
  modalidadeNome: string
  totalAlunos: number
}

export interface ProfessorQuestao {
  id: string
  enunciado: string
  componente: string
  assunto: string
  dificuldade: "FACIL" | "MEDIO" | "DIFICIL"
  ativa: boolean
  totalAlternativas: number
}

export interface ProfessorResultadoEtapa {
  simuladoId: string
  etapaTitulo: string
  componente: string
  finalizados: number
  mediaNota: number | null
  percentualAcerto: number | null
}

async function getJson<T>(url: string, mensagemErro: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? mensagemErro)
  }
  return res.json()
}

export function getTurmasProfessor(): Promise<ProfessorTurma[]> {
  return getJson("/api/professor/turmas", "Erro ao carregar turmas")
}

export function getQuestoesProfessor(): Promise<ProfessorQuestao[]> {
  return getJson("/api/professor/questoes", "Erro ao carregar questões")
}

export function getResultadosProfessor(): Promise<ProfessorResultadoEtapa[]> {
  return getJson("/api/professor/resultados", "Erro ao carregar resultados")
}
