import { apiGet, apiPost } from "@/lib/api-client";
import type {
  Aluno,
  AlunoCriado,
  Catalogo,
  Turma,
} from "@/lib/types";

export type TurmaCreatePayload = {
  nome: string;
  anoLetivo: number;
  escolaId: string;
  modalidadeId: string;
};

export type AlunoCreatePayload = {
  nome: string;
  email: string | null;
  cpf: string;
  dataNascimento: string;
  necessidadeEspecial: boolean;
  turmaId: string | null;
};

export async function getCatalogo(): Promise<Catalogo> {
  return apiGet<Catalogo>("/api/catalogo");
}

export async function getTurmas(): Promise<Turma[]> {
  return apiGet<Turma[]>("/api/turmas");
}

export async function criarTurma(payload: TurmaCreatePayload): Promise<Turma> {
  return apiPost<Turma>("/api/turmas", payload);
}

export async function getAlunos(filtros?: {
  turmaId?: string;
  escolaId?: string;
  busca?: string;
}): Promise<Aluno[]> {
  const params = new URLSearchParams();
  if (filtros?.turmaId) params.set("turma_id", filtros.turmaId);
  if (filtros?.escolaId) params.set("escola_id", filtros.escolaId);
  if (filtros?.busca) params.set("busca", filtros.busca);

  const qs = params.toString();
  const path = qs ? `/api/alunos?${qs}` : "/api/alunos";
  return apiGet<Aluno[]>(path);
}

export async function criarAluno(
  payload: AlunoCreatePayload,
): Promise<AlunoCriado> {
  return apiPost<AlunoCriado>("/api/alunos", payload);
}