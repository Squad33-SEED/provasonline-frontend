export type ComponenteAprovado = {
  componente: string;
  nota: number;
};

export type CertificadoItem = {
  id: string;
  tipo: "CONCLUSAO" | "PROFICIENCIA_PARCIAL";
  nivel: string;
  anoReferencia: number;
  codigoVerificacao: string;
  emitidoEm: string;
  componentesAprovados: ComponenteAprovado[];
};

export type ComponenteProgresso = {
  componente: string;
  aprovado: boolean;
  nota: number | null;
};

export type AproveitamentoNivel = {
  nivel: string;
  anoReferencia: number;
  totalComponentes: number;
  aprovados: number;
  componentes: ComponenteProgresso[];
};

export async function getCertificados(): Promise<CertificadoItem[]> {
  const res = await fetch("/api/aluno/certificados", { cache: "no-store" });
  if (!res.ok) throw new Error("Erro ao buscar certificados");
  return res.json();
}
