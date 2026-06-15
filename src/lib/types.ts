export type EscolaResumo = {
  id: string;
  nome: string;
};

export type ModalidadeResumo = {
  id: string;
  nome: string;
};

export type TurmaResumoSimples = {
  id: string;
  nome: string;
  escolaNome: string;
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

export type ComponenteCatalogo = {
  id: string;
  nome: string;
  modalidade: ModalidadeResumo;
};

export type NivelCatalogo = {
  id: string;
  nome: string;
  ordem: number;
};

export type Disponibilidade = {
  componenteId: string;
  facil: number;
  medio: number;
  dificil: number;
};

export type QuestaoBanco = {
  id: string;
  enunciado: string;
  assunto: string;
  dificuldade: string;
  componenteId: string;
};

export type ProfessorQuestaoItem = {
  id: string;
  enunciado: string;
  componente: string;
  assunto: string;
  dificuldade: string;
  ativa: boolean;
  totalAlternativas: number;
};

export type Simulado = {
  id: string;
  titulo: string;
  descricao: string | null;
  componente: ComponenteCatalogo;
  qtdFacil: number;
  qtdMedio: number;
  qtdDificil: number;
  totalQuestoes: number;
  vagas: number;
  totalInscritos: number;
  vagasDisponiveis: number;
  duracaoMinutos: number;
  janelaInicio: string;
  janelaFim: string;
  status: string;
  criadoEm: string;
  turmas: TurmaResumoSimples[];
};

export type SimuladoCreatePayload = {
  titulo: string;
  descricao: string | null;
  componenteId: string;
  qtdFacil: number;
  qtdMedio: number;
  qtdDificil: number;
  vagas: number;
  duracaoMinutos: number;
  janelaInicio: string;
  janelaFim: string;
  turmaIds: string[];
  questaoIds: string[];
  embaralharAlternativas: boolean;
  geraCertificado: boolean;
  nivelEnsinoId: string | null;
  notaMinimaCertificacao: number | null;
};