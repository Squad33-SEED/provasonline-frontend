export type EscolaResumo = {
  id: string;
  nome: string;
};

export type ModalidadeResumo = {
  id: string;
  nome: string;
};

export type Turma = {
  id: string;
  nome: string;
  anoLetivo: number;
  escola: EscolaResumo;
  modalidade: ModalidadeResumo;
  totalAlunos: number;
};

export type Aluno = {
  id: string;
  nome: string;
  cpf: string;
  email: string | null;
  dataNascimento: string;
  necessidadeEspecial: boolean;
  turmaNome: string | null;
  escolaNome: string | null;
};

export type AlunoCriado = {
  id: string;
  usuarioId: string;
  nome: string;
  cpf: string;
  email: string | null;
  senhaProvisoria: string;
  dataNascimento: string;
  turmaId: string | null;
};

export type Catalogo = {
  escolas: EscolaResumo[];
  modalidades: ModalidadeResumo[];
};