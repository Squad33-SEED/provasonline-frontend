import { apiGet, apiPost } from "@/lib/api-client";
import type {
  ComponenteCatalogo,
  Disponibilidade,
  ProfessorQuestaoItem,
  QuestaoBanco,
  Simulado,
  SimuladoCreatePayload,
  Turma,
} from "@/lib/types";

export async function getComponentes(): Promise<ComponenteCatalogo[]> {
  return apiGet<ComponenteCatalogo[]>("/api/catalogo/componentes");
}

export async function getBancoQuestoes(
  componenteId: string,
): Promise<QuestaoBanco[]> {
  return apiGet<QuestaoBanco[]>(
    `/api/simulados/banco?componenteId=${encodeURIComponent(componenteId)}`,
  );
}

export async function getBancoQuestoesProfessor(
  componenteId: string,
): Promise<ProfessorQuestaoItem[]> {
  return apiGet<ProfessorQuestaoItem[]>(
    `/api/professor/questoes?componenteId=${encodeURIComponent(componenteId)}`,
  );
}

export async function getDisponibilidade(
  componenteId: string,
): Promise<Disponibilidade> {
  return apiGet<Disponibilidade>(
    `/api/simulados/disponibilidade?componenteId=${encodeURIComponent(componenteId)}`,
  );
}

export async function getSimulados(): Promise<Simulado[]> {
  return apiGet<Simulado[]>("/api/simulados");
}

export async function getTurmas(): Promise<Turma[]> {
  return apiGet<Turma[]>("/api/turmas");
}

export async function criarSimulado(
  payload: SimuladoCreatePayload,
): Promise<Simulado> {
  return apiPost<Simulado>("/api/simulados", payload);
}