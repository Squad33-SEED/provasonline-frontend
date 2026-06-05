export type DashboardEmExecucaoItem = {
  id: string;
  titulo: string;
  componente: string;
  turmaEscola: string;
  janelaInicio: string;
  janelaFim: string;
  iniciados: number;
  finalizados: number;
};

export type DashboardResponse = {
  etapasAtivas: number;
  etapasFinalizadas: number;
  emExecucao: DashboardEmExecucaoItem[];
};

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await fetch("/api/admin/dashboard", {
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.detail ?? "Erro ao carregar dashboard");
  }

  return body as DashboardResponse;
}
