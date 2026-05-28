export interface ComponenteResumo {
  id: string
  nome: string
  modalidade: string
}

export interface EtapaDisponivel {
  id: string
  titulo: string
  descricao: string | null
  componente: ComponenteResumo
  duracaoMinutos: number
  totalQuestoes: number
  vagas: number
  janelaInicio: string
  janelaFim: string
  ativa: boolean
}

export interface AlternativaParaAluno {
  letra: string
  texto: string
}

export interface QuestaoParaAluno {
  ordem: number
  questaoId: string
  enunciado: string
  alternativas: AlternativaParaAluno[]
  respostaSalva: string | null
}

export interface IniciarProvaResponse {
  resultadoId: string
  iniciadoEm: string
  expiraEm: string
  duracaoMinutos: number
  totalQuestoes: number
  questoes: QuestaoParaAluno[]
}

export interface RespostaItem {
  questaoId: string
  resposta: string
}

export interface AutoSaveResponse {
  salvo: boolean
  totalSalvas: number
  salvoEm: string
}

export interface GabaritoItemDetalhado {
  ordem: number
  questaoId: string
  enunciado: string
  alternativaMarcada: string | null
  alternativaCorreta: string
  correta: boolean
}

export interface SimuladoResumoResultado {
  titulo: string
  componente: string
  duracaoMinutos: number
}

export interface ResultadoResponse {
  resultadoId: string
  pontuacao: number
  acertos: number
  total: number
  statusResultado: "EM_ANDAMENTO" | "FINALIZADO" | "EXPIRADO"
  finalizadoEm: string
  simulado: SimuladoResumoResultado
  gabaritoDisponivel: boolean
  gabaritoDisponivelEm: string
  gabarito: GabaritoItemDetalhado[] | null
}

export interface HistoricoItem {
  resultadoId: string
  simuladoId: string
  titulo: string
  componente: string
  pontuacao: number | null
  acertos: number | null
  total: number
  statusResultado: "EM_ANDAMENTO" | "FINALIZADO" | "EXPIRADO"
  finalizadoEm: string | null
  gabaritoDisponivel: boolean
  gabaritoDisponivelEm: string
}

export class ErroProva409 extends Error {
  resultadoId: string
  statusResultado: "EM_ANDAMENTO" | "FINALIZADO" | "EXPIRADO"

  constructor(resultadoId: string, statusResultado: "EM_ANDAMENTO" | "FINALIZADO" | "EXPIRADO") {
    super("Etapa já iniciada")
    this.name = "ErroProva409"
    this.resultadoId = resultadoId
    this.statusResultado = statusResultado
  }
}

export async function getEtapasDisponiveis(): Promise<EtapaDisponivel[]> {
  const res = await fetch("/api/aluno/etapas-disponiveis", { cache: "no-store" })
  if (!res.ok) throw new Error("Erro ao buscar etapas")
  return res.json()
}

export async function iniciarProva(simuladoId: string): Promise<IniciarProvaResponse> {
  const res = await fetch(`/api/aluno/iniciar-prova/${simuladoId}`, { method: "POST" })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? "Erro ao iniciar prova")
  }
  return res.json()
}

export async function autoSaveRespostas(
  resultadoId: string,
  respostas: RespostaItem[]
): Promise<AutoSaveResponse> {
  const res = await fetch(`/api/aluno/responder/${resultadoId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ respostas }),
  })
  if (!res.ok) throw new Error("Erro ao salvar respostas")
  return res.json()
}

export async function submeterProva(resultadoId: string): Promise<ResultadoResponse> {
  const res = await fetch(`/api/aluno/submeter/${resultadoId}`, { method: "POST" })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? "Erro ao submeter prova")
  }
  return res.json()
}

export async function getResultado(resultadoId: string): Promise<ResultadoResponse> {
  const res = await fetch(`/api/aluno/resultado/${resultadoId}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Erro ao buscar resultado")
  return res.json()
}

export async function getHistorico(): Promise<HistoricoItem[]> {
  const res = await fetch("/api/aluno/historico", { cache: "no-store" })
  if (!res.ok) throw new Error("Erro ao buscar histórico")
  return res.json()
}