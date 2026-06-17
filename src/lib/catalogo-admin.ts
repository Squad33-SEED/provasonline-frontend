import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api-client";

export interface NivelAdmin {
  id: string;
  nome: string;
  descricao: string | null;
  ordem: number;
  ativo: boolean;
}

export interface ModalidadeAdmin {
  id: string;
  nivelId: string;
  nome: string;
  supletivo: boolean;
  ativo: boolean;
}

export interface ComponenteAdmin {
  id: string;
  modalidadeId: string;
  nome: string;
  codigo: string;
  ativo: boolean;
  totalAssuntos: number;
  totalQuestoes: number;
  modalidade?: { id: string; nome: string };
  assuntos?: { id: string; nome: string }[];
}

export interface AssuntoAdmin {
  id: string;
  componenteId: string;
  nome: string;
  ativo: boolean;
}


export function getNiveisAdmin(): Promise<NivelAdmin[]> {
  return apiGet<NivelAdmin[]>("/api/catalogo/niveis");
}

export function criarNivel(data: {
  nome: string;
  descricao?: string | null;
  ordem?: number;
}): Promise<NivelAdmin> {
  return apiPost<NivelAdmin>("/api/catalogo/niveis", data);
}

export function editarNivel(
  id: string,
  data: { nome: string; descricao?: string | null; ordem?: number }
): Promise<NivelAdmin> {
  return apiPut<NivelAdmin>(`/api/catalogo/niveis/${id}`, data);
}

export function toggleNivel(id: string): Promise<NivelAdmin> {
  return apiPatch<NivelAdmin>(`/api/catalogo/niveis/${id}`);
}


export function criarModalidade(data: {
  nivelId: string;
  nome: string;
  supletivo: boolean;
}): Promise<ModalidadeAdmin> {
  return apiPost<ModalidadeAdmin>("/api/catalogo/modalidades", data);
}

export function editarModalidade(
  id: string,
  data: { nome: string; supletivo: boolean }
): Promise<ModalidadeAdmin> {
  return apiPut<ModalidadeAdmin>(`/api/catalogo/modalidades/${id}`, data);
}

export function toggleModalidade(id: string): Promise<ModalidadeAdmin> {
  return apiPatch<ModalidadeAdmin>(`/api/catalogo/modalidades/${id}`);
}


export function getComponentesAdmin(): Promise<ComponenteAdmin[]> {
  return apiGet<ComponenteAdmin[]>("/api/catalogo/componentes-admin");
}

export function criarComponente(data: {
  modalidadeId: string;
  nome: string;
  codigo: string;
  assuntos?: string[];
}): Promise<ComponenteAdmin> {
  return apiPost<ComponenteAdmin>("/api/catalogo/componentes-admin", data);
}

export function editarComponente(
  id: string,
  data: { nome: string; codigo: string }
): Promise<ComponenteAdmin> {
  return apiPut<ComponenteAdmin>(`/api/catalogo/componentes-admin/${id}`, data);
}

export function toggleComponente(id: string): Promise<ComponenteAdmin> {
  return apiPatch<ComponenteAdmin>(`/api/catalogo/componentes-admin/${id}`);
}


export function criarAssunto(
  componenteId: string,
  data: { nome: string }
): Promise<AssuntoAdmin> {
  return apiPost<AssuntoAdmin>(
    `/api/catalogo/assuntos-admin/${componenteId}`,
    data
  );
}

export function toggleAssunto(id: string): Promise<AssuntoAdmin> {
  return apiPatch<AssuntoAdmin>(`/api/catalogo/assuntos-admin/toggler/${id}`);
}

export function getNomesAssuntosExistentes(): Promise<string[]> {
  return apiGet<string[]>("/api/catalogo/assuntos-admin/nomes");
}