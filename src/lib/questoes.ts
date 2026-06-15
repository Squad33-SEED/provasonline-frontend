import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api-client";

export type Dificuldade = "FACIL" | "MEDIO" | "DIFICIL";

export interface QuestaoAlternativa {
  letra: string;
  texto: string;
}

export interface QuestaoListItem {
  id: string;
  enunciado: string;
  componente: string;
  assunto: string;
  tipo: string;
  dificuldade: Dificuldade;
  ativa: boolean;
  totalAlternativas: number;
  professorNome: string;
}

export interface QuestaoDetalhe {
  id: string;
  enunciado: string;
  componenteId: string;
  componente: string;
  assuntoId: string;
  assunto: string;
  tipo: string;
  dificuldade: Dificuldade;
  alternativas: QuestaoAlternativa[];
  respostaCorreta: string;
  urlImagem: string | null;
  ativa: boolean;
  criadoEm: string;
}

export interface QuestaoPayload {
  componenteId: string;
  assuntoId: string;
  tipo: string;
  dificuldade: Dificuldade;
  enunciado: string;
  alternativas: QuestaoAlternativa[];
  respostaCorreta: string;
  urlImagem: string | null;
}

export interface ComponenteOpcao {
  id: string;
  nome: string;
}

export interface AssuntoOpcao {
  id: string;
  nome: string;
}

export interface QuestaoFiltros {
  componenteId?: string;
  assuntoId?: string;
  dificuldade?: Dificuldade;
  ativa?: boolean;
  somenteMinhas?: boolean;
}

export function getQuestoes(filtros?: QuestaoFiltros): Promise<QuestaoListItem[]> {
  const params = new URLSearchParams();
  if (filtros?.componenteId) params.set("componenteId", filtros.componenteId);
  if (filtros?.assuntoId) params.set("assuntoId", filtros.assuntoId);
  if (filtros?.dificuldade) params.set("dificuldade", filtros.dificuldade);
  if (filtros?.ativa !== undefined) params.set("ativa", String(filtros.ativa));
  if (filtros?.somenteMinhas) params.set("somente_minhas", "true");
  const qs = params.toString();
  return apiGet<QuestaoListItem[]>(qs ? `/api/questoes?${qs}` : "/api/questoes");
}

export function getQuestao(id: string): Promise<QuestaoDetalhe> {
  return apiGet<QuestaoDetalhe>(`/api/questoes/${id}`);
}

export function criarQuestao(payload: QuestaoPayload): Promise<QuestaoDetalhe> {
  return apiPost<QuestaoDetalhe>("/api/questoes", payload);
}

export function editarQuestao(
  id: string,
  payload: QuestaoPayload,
): Promise<QuestaoDetalhe> {
  return apiPut<QuestaoDetalhe>(`/api/questoes/${id}`, payload);
}

export function toggleQuestao(id: string): Promise<QuestaoDetalhe> {
  return apiPatch<QuestaoDetalhe>(`/api/questoes/${id}/toggle`);
}

export function getComponentesQuestao(): Promise<ComponenteOpcao[]> {
  return apiGet<ComponenteOpcao[]>("/api/catalogo/componentes");
}

export function getAssuntosDoComponente(
  componenteId: string,
): Promise<AssuntoOpcao[]> {
  return apiGet<AssuntoOpcao[]>(`/api/catalogo/assuntos/${componenteId}`);
}
