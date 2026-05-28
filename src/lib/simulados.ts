import { apiGet, apiPost } from "@/lib/api-client";
import type {
  ComponenteCatalogo,
  Disponibilidade,
  Simulado,
  SimuladoCreatePayload,
  Turma,
} from "@/lib/types";

export async function getComponentes(): Promise<ComponenteCatalogo[]> {
  return apiGet<ComponenteCatalogo[]>("/api/catalogo/componentes");
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