import { apiGet, apiPost } from "@/lib/api-client";
import type {
  ComponenteCatalogo,
  Disponibilidade,
  NivelCatalogo,
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

export async function getNiveis(): Promise<NivelCatalogo[]> {
  return apiGet<NivelCatalogo[]>("/api/catalogo/niveis");
}

export async function getDisponibilidade(
  componenteIds: string | string[],
): Promise<Disponibilidade> {
  const ids = Array.isArray(componenteIds) ? componenteIds : [componenteIds];

  const listas = await Promise.all(
    ids.map((id) =>
      apiGet<Disponibilidade>(
        `/api/simulados/disponibilidade?componenteId=${encodeURIComponent(id)}`,
      ),
    ),
  );

  return {
    componenteId: ids[0] ?? "",
    facil: listas.reduce((total, item) => total + item.facil, 0),
    medio: listas.reduce((total, item) => total + item.medio, 0),
    dificil: listas.reduce((total, item) => total + item.dificil, 0),
  };
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

export type { QuestaoBanco };

export async function getBancoQuestoesAdmin(
  componenteIds: string | string[],
): Promise<QuestaoBanco[]> {
  const ids = Array.isArray(componenteIds) ? componenteIds : [componenteIds];

  const listas = await Promise.all(
    ids.map((id) =>
      apiGet<QuestaoBanco[]>(
        `/api/simulados/banco?componenteId=${encodeURIComponent(id)}`,
      ),
    ),
  );

  return listas.flat();
}

export interface RelatorioItemAluno {
  alunoNome: string;
  alunoCpf: string;
  turma: string | null;
  nota: number | null;
  acertos: number | null;
  total: number;
  statusResultado: "EM_ANDAMENTO" | "FINALIZADO" | "EXPIRADO";
  finalizadoEm: string | null;
}

export interface RelatorioEtapa {
  simuladoId: string;
  titulo: string;
  componente: string;
  inscritos: number;
  totalAlunos: number;
  finalizados: number;
  mediaNota: number | null;
  percentualAcerto: number | null;
  itens: RelatorioItemAluno[];
}

export async function getRelatorioEtapa(id: string): Promise<RelatorioEtapa> {
  return apiGet<RelatorioEtapa>(`/api/simulados/${id}/relatorio`);
}