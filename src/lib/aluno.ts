import { apiGet } from "@/lib/api-client";

export interface EtapaDisponivel {
  id: string;
  titulo: string;
  descricao: string | null;
  componente: {
    id: string;
    nome: string;
    modalidade: string;
  };
  duracaoMinutos: number;
  totalQuestoes: number;
  vagas: number;
  janelaInicio: string;
  janelaFim: string;
  ativa: boolean;
}

export async function getEtapasDisponiveis(): Promise<EtapaDisponivel[]> {
  return apiGet<EtapaDisponivel[]>("/api/aluno/etapas-disponiveis");
}