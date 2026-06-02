export interface AssuntoCatalogo {
  id: string
  nome: string
}

export interface ComponenteCatalogo {
  id: string
  nome: string
  modalidade: { id: string; nome: string }
  assuntos: AssuntoCatalogo[]
}

export interface QuestaoBanco {
  id: string
  enunciado: string
  assunto: string
  dificuldade: "FACIL" | "MEDIO" | "DIFICIL"
  componenteId: string
}

export interface AlternativaSL {
  letra: string
  texto: string
}

export interface QuestaoSL {
  ordem: number
  questaoId: string
  enunciado: string
  assunto: string
  dificuldade: string
  alternativas: AlternativaSL[]
  respostaSalva: string | null
}

export interface SimuladoLivre {
  id: string
  titulo: string
  duracaoMinutos: number
  totalQuestoes: number
  status: string
  questoes: QuestaoSL[]
}

export interface GabaritoItemSL {
  ordem: number
  questaoId: string
  enunciado: string
  assunto: string
  dificuldade: string
  alternativaMarcada: string | null
  alternativaCorreta: string
  correta: boolean
}

export interface ResultadoSL {
  id: string
  titulo: string
  pontuacao: number
  acertos: number
  total: number
  status: string
  finalizadoEm: string | null
  gabarito: GabaritoItemSL[]
}

export interface HistoricoSL {
  id: string
  titulo: string
  totalQuestoes: number
  pontuacao: number | null
  status: string
  criadoEm: string
  finalizadoEm: string | null
}

export interface DisciplinaSimulado {
  nome: string
  componenteIds: string[]
  totalQuestoes: number
  facil: number
  medio: number
  dificil: number
}

export async function getComponentesCatalogo(): Promise<ComponenteCatalogo[]> {
  const res = await fetch("/api/catalogo/componentes", { cache: "no-store" })
  if (!res.ok) throw new Error("Erro ao carregar componentes")
  return res.json()
}

export async function getDisciplinas(): Promise<DisciplinaSimulado[]> {
  const res = await fetch("/api/simulado-livre/disciplinas", { cache: "no-store" })
  if (!res.ok) throw new Error("Erro ao carregar disciplinas")
  return res.json()
}

export async function getDisponibilidade(
  componenteId: string,
): Promise<{ facil: number; medio: number; dificil: number }> {
  const res = await fetch(
    `/api/simulados/disponibilidade?componenteId=${encodeURIComponent(componenteId)}`,
    { cache: "no-store" },
  )
  if (!res.ok) throw new Error("Erro ao buscar disponibilidade")
  return res.json()
}

export async function getBancoQuestoes(
  componenteId: string,
  filtros?: { assuntoId?: string; dificuldade?: string },
): Promise<QuestaoBanco[]> {
  const params = new URLSearchParams({ componente_id: componenteId })
  if (filtros?.assuntoId) params.set("assunto_id", filtros.assuntoId)
  if (filtros?.dificuldade) params.set("dificuldade", filtros.dificuldade)
  const res = await fetch(`/api/simulado-livre/banco?${params.toString()}`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Erro ao carregar banco de questões")
  return res.json()
}

export async function sortearSimulado(payload: {
  componenteIds: string[]
  qtdFacil: number
  qtdMedio: number
  qtdDificil: number
  duracaoMinutos: number
}): Promise<SimuladoLivre> {
  const res = await fetch("/api/simulado-livre/sortear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? "Erro ao sortear simulado")
  }
  return res.json()
}

export async function selecionarSimulado(payload: {
  componenteIds: string[]
  questaoIds: string[]
  duracaoMinutos: number
}): Promise<SimuladoLivre> {
  const res = await fetch("/api/simulado-livre/selecionar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? "Erro ao criar simulado")
  }
  return res.json()
}

export async function getSimuladoLivre(id: string): Promise<SimuladoLivre> {
  const res = await fetch(`/api/simulado-livre/${id}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Erro ao carregar simulado")
  return res.json()
}

export async function submeterSimuladoLivre(
  id: string,
  respostas: { questaoId: string; resposta: string }[],
): Promise<ResultadoSL> {
  const res = await fetch(`/api/simulado-livre/${id}/submeter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ respostas }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? "Erro ao submeter simulado")
  }
  return res.json()
}

export async function getHistoricoSimuladoLivre(): Promise<HistoricoSL[]> {
  const res = await fetch("/api/simulado-livre", { cache: "no-store" })
  if (!res.ok) throw new Error("Erro ao carregar histórico")
  return res.json()
}
