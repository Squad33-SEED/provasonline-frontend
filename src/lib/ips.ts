import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api-client";

export interface IpAutorizado {
  id: string;
  ip: string;
  descricao: string | null;
  ativo: boolean;
  criadoEm: string;
}

export interface IpPayload {
  ip: string;
  descricao?: string | null;
}

export interface IpFiltros {
  ativo?: boolean;
}

export function getIps(filtros?: IpFiltros): Promise<IpAutorizado[]> {
  const params = new URLSearchParams();

  if (filtros?.ativo !== undefined) {
    params.set("ativo", String(filtros.ativo));
  }

  const qs = params.toString();

  return apiGet<IpAutorizado[]>(qs ? `/api/ips?${qs}` : "/api/ips");
}

export function criarIp(payload: IpPayload): Promise<IpAutorizado> {
  return apiPost<IpAutorizado>("/api/ips", payload);
}

export function editarIp(
  id: string,
  payload: IpPayload,
): Promise<IpAutorizado> {
  return apiPut<IpAutorizado>(`/api/ips/${id}`, payload);
}

export function toggleIp(id: string): Promise<IpAutorizado> {
  return apiPatch<IpAutorizado>(`/api/ips/${id}/toggle`);
}
