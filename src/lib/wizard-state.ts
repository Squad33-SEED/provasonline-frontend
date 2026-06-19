"use client";

import * as React from "react";
import type { ComponenteCatalogo, Disponibilidade } from "@/lib/types";

export type PassoIdentificacaoState = {
  titulo: string;
  descricao: string;
  componenteId: string;
  componenteNome: string;
  componenteIds: string[];
  componentesNomes: string[];
  turmaIds: string[];
  geraCertificado: boolean;
  nivelEnsinoId: string;
  notaMinimaCertificacao: string;
};

export type PassoJanelaState = {
  vagas: string;
  duracaoMinutos: string;
  dataInicio: string;
  horaInicio: string;
  dataFim: string;
  horaFim: string;
};

export type ModoComposicao = "SORTEIO" | "MANUAL";

export type DificuldadeCota = "facil" | "medio" | "dificil";

export type CotaComponente = { facil: number; medio: number; dificil: number };

export type PassoComposicaoState = {
  modo: ModoComposicao;
  qtdFacil: number;
  qtdMedio: number;
  qtdDificil: number;
  // Cotas POR componente (etapa multi-componente estilo ENEM). Chave = componenteId.
  composicao: Record<string, CotaComponente>;
  questaoIds: string[];
  embaralharAlternativas: boolean;
};

export type WizardState = {
  passoAtual: 1 | 2 | 3;
  passo1: PassoIdentificacaoState;
  passo2: PassoJanelaState;
  passo3: PassoComposicaoState;
  disponibilidade: Disponibilidade | null;
  disponibilidadePorComponente: Record<string, Disponibilidade>;
  carregandoDisponibilidade: boolean;
  componentes: ComponenteCatalogo[];
  carregandoComponentes: boolean;
  erroSubmit: string | null;
};

export type WizardAction =
  | { type: "ATUALIZAR_PASSO_1"; campo: "titulo" | "descricao" | "nivelEnsinoId" | "notaMinimaCertificacao"; valor: string }
  | { type: "SET_GERA_CERTIFICADO"; valor: boolean }
  | { type: "SELECIONAR_COMPONENTE"; id: string; nome: string }
  | { type: "TOGGLE_TURMA"; turmaId: string }
  | { type: "ATUALIZAR_PASSO_2"; campo: keyof PassoJanelaState; valor: string }
  | { type: "ATUALIZAR_PASSO_3"; campo: "qtdFacil" | "qtdMedio" | "qtdDificil"; valor: number }
  | { type: "ATUALIZAR_COMPOSICAO"; componenteId: string; dificuldade: DificuldadeCota; valor: number }
  | { type: "SET_DISPONIBILIDADE_POR_COMPONENTE"; mapa: Record<string, Disponibilidade> }
  | { type: "SET_MODO_COMPOSICAO"; modo: ModoComposicao }
  | { type: "TOGGLE_QUESTAO"; questaoId: string }
  | { type: "SET_EMBARALHAR"; valor: boolean }
  | { type: "AVANCAR" }
  | { type: "VOLTAR" }
  | { type: "SET_COMPONENTES"; componentes: ComponenteCatalogo[] }
  | { type: "INICIAR_LOAD_COMPONENTES" }
  | { type: "INICIAR_LOAD_DISPONIBILIDADE" }
  | { type: "SET_DISPONIBILIDADE"; disponibilidade: Disponibilidade }
  | { type: "ERRO_SUBMIT"; mensagem: string }| 
    { type: "TOGGLE_COMPONENTE"; id: string; nome: string }
  | { type: "LIMPAR_ERRO" };

const ESTADO_INICIAL: WizardState = {
  passoAtual: 1,
  passo1: {
    titulo: "",
    descricao: "",
    componenteId: "",
    componenteNome: "",
    componenteIds: [],
    componentesNomes: [],
    turmaIds: [],
    geraCertificado: false,
    nivelEnsinoId: "",
    notaMinimaCertificacao: "6.0",
  },
  passo2: {
    vagas: "100",
    duracaoMinutos: "90",
    dataInicio: "",
    horaInicio: "08:00",
    dataFim: "",
    horaFim: "18:00",
  },
  passo3: {
    modo: "SORTEIO",
    qtdFacil: 0,
    qtdMedio: 0,
    qtdDificil: 0,
    composicao: {},
    questaoIds: [],
    embaralharAlternativas: false,
  },
  disponibilidade: null,
  disponibilidadePorComponente: {},
  carregandoDisponibilidade: false,
  componentes: [],
  carregandoComponentes: false,
  erroSubmit: null,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "ATUALIZAR_PASSO_1":
      return {
        ...state,
        passo1: { ...state.passo1, [action.campo]: action.valor },
      };

    case "SET_GERA_CERTIFICADO":
      return {
        ...state,
        passo1: {
          ...state.passo1,
          geraCertificado: action.valor,
          nivelEnsinoId: action.valor ? state.passo1.nivelEnsinoId : "",
        },
      };

    case "SELECIONAR_COMPONENTE":
      return {
      ...state,
      passo1: {
      ...state.passo1,
      componenteId: action.id,
      componenteNome: action.nome,
      componenteIds: [action.id],
      componentesNomes: [action.nome],
      },
      disponibilidade: null,
      disponibilidadePorComponente: {},
      passo3: {
      ...state.passo3,
      qtdFacil: 0,
      qtdMedio: 0,
      qtdDificil: 0,
      composicao: {},
      questaoIds: [],
    },
  };
case "TOGGLE_COMPONENTE": {
  const ids = state.passo1.componenteIds;
  const nomes = state.passo1.componentesNomes;
  const jaExiste = ids.includes(action.id);

  const novosIds = jaExiste
    ? ids.filter((id) => id !== action.id)
    : [...ids, action.id];

  const novosNomes = jaExiste
    ? nomes.filter((nome) => nome !== action.nome)
    : [...nomes, action.nome];

  return {
    ...state,
    passo1: {
      ...state.passo1,
      componenteIds: novosIds,
      componentesNomes: novosNomes,
      componenteId: novosIds[0] ?? "",
      componenteNome: novosNomes[0] ?? "",
    },
    disponibilidade: null,
    disponibilidadePorComponente: {},
    passo3: {
      ...state.passo3,
      qtdFacil: 0,
      qtdMedio: 0,
      qtdDificil: 0,
      composicao: {},
      questaoIds: [],
    },
  };
}

    case "TOGGLE_TURMA": {
      const ids = state.passo1.turmaIds;
      const jaExiste = ids.includes(action.turmaId);
      return {
        ...state,
        passo1: {
          ...state.passo1,
          turmaIds: jaExiste
            ? ids.filter((id) => id !== action.turmaId)
            : [...ids, action.turmaId],
        },
      };
    }

    case "ATUALIZAR_PASSO_2":
      return {
        ...state,
        passo2: { ...state.passo2, [action.campo]: action.valor },
      };

    case "ATUALIZAR_PASSO_3":
      return {
        ...state,
        passo3: { ...state.passo3, [action.campo]: action.valor },
      };

    case "ATUALIZAR_COMPOSICAO": {
      const atual = state.passo3.composicao[action.componenteId] ?? {
        facil: 0,
        medio: 0,
        dificil: 0,
      };
      return {
        ...state,
        passo3: {
          ...state.passo3,
          composicao: {
            ...state.passo3.composicao,
            [action.componenteId]: { ...atual, [action.dificuldade]: action.valor },
          },
        },
      };
    }

    case "SET_DISPONIBILIDADE_POR_COMPONENTE":
      return {
        ...state,
        disponibilidadePorComponente: action.mapa,
        carregandoDisponibilidade: false,
      };

    case "SET_MODO_COMPOSICAO":
      return {
        ...state,
        passo3: { ...state.passo3, modo: action.modo },
      };

    case "TOGGLE_QUESTAO": {
      const ids = state.passo3.questaoIds;
      const jaExiste = ids.includes(action.questaoId);
      return {
        ...state,
        passo3: {
          ...state.passo3,
          questaoIds: jaExiste
            ? ids.filter((id) => id !== action.questaoId)
            : [...ids, action.questaoId],
        },
      };
    }

    case "SET_EMBARALHAR":
      return {
        ...state,
        passo3: { ...state.passo3, embaralharAlternativas: action.valor },
      };

    case "AVANCAR": {
      if (state.passoAtual >= 3) return state;
      const proximo = (state.passoAtual + 1) as 1 | 2 | 3;
      return { ...state, passoAtual: proximo };
    }

    case "VOLTAR": {
      if (state.passoAtual <= 1) return state;
      const anterior = (state.passoAtual - 1) as 1 | 2 | 3;
      return { ...state, passoAtual: anterior };
    }

    case "INICIAR_LOAD_COMPONENTES":
      return { ...state, carregandoComponentes: true };

    case "SET_COMPONENTES":
      return {
        ...state,
        componentes: action.componentes,
        carregandoComponentes: false,
      };

    case "INICIAR_LOAD_DISPONIBILIDADE":
      return { ...state, carregandoDisponibilidade: true };

    case "SET_DISPONIBILIDADE":
      return {
        ...state,
        disponibilidade: action.disponibilidade,
        carregandoDisponibilidade: false,
      };

    case "ERRO_SUBMIT":
      return { ...state, erroSubmit: action.mensagem };

    case "LIMPAR_ERRO":
      return { ...state, erroSubmit: null };

    default:
      return state;
  }
}

export function useWizard() {
  return React.useReducer(wizardReducer, ESTADO_INICIAL);
}

export function passo1Valido(state: WizardState): boolean {
  const titulo = state.passo1.titulo.trim();
  if (titulo.length < 3 || state.passo1.componenteIds.length === 0) return false;
  if (state.passo1.geraCertificado && !state.passo1.nivelEnsinoId) return false;
  return true;
}

export function passo2Valido(state: WizardState): boolean {
  const vagas = parseInt(state.passo2.vagas, 10);
  const duracao = parseInt(state.passo2.duracaoMinutos, 10);

  if (!Number.isFinite(vagas) || vagas < 1 || vagas > 10000) return false;
  if (!Number.isFinite(duracao) || duracao < 15 || duracao > 240) return false;
  if (!state.passo2.dataInicio || !state.passo2.dataFim) return false;
  if (!state.passo2.horaInicio || !state.passo2.horaFim) return false;

  const inicio = montarDataHora(state.passo2.dataInicio, state.passo2.horaInicio);
  const fim = montarDataHora(state.passo2.dataFim, state.passo2.horaFim);

  if (!inicio || !fim) return false;
  if (inicio >= fim) return false;
  if (inicio <= new Date()) return false;

  return true;
}

// Composição POR componente: ativa no modo SORTEIO quando há 2+ componentes
// (etapa multi-componente estilo ENEM). Com 1 componente, segue a cota global.
export function usaComposicaoPorComponente(state: WizardState): boolean {
  return state.passo3.modo === "SORTEIO" && state.passo1.componenteIds.length > 1;
}

export function totalComposicao(state: WizardState): number {
  return state.passo1.componenteIds.reduce((soma, id) => {
    const c = state.passo3.composicao[id];
    return soma + (c ? c.facil + c.medio + c.dificil : 0);
  }, 0);
}

export function passo3Valido(state: WizardState): boolean {
  const p = state.passo3;

  if (p.modo === "MANUAL") {
    return p.questaoIds.length >= 1;
  }

  if (usaComposicaoPorComponente(state)) {
    let total = 0;
    for (const id of state.passo1.componenteIds) {
      const cota = p.composicao[id] ?? { facil: 0, medio: 0, dificil: 0 };
      const disp = state.disponibilidadePorComponente[id];
      if (!disp) return false;
      if (cota.facil > disp.facil || cota.medio > disp.medio || cota.dificil > disp.dificil) {
        return false;
      }
      total += cota.facil + cota.medio + cota.dificil;
    }
    return total >= 1;
  }

  const total = p.qtdFacil + p.qtdMedio + p.qtdDificil;
  if (total < 1) return false;
  if (!state.disponibilidade) return false;

  return (
    p.qtdFacil <= state.disponibilidade.facil &&
    p.qtdMedio <= state.disponibilidade.medio &&
    p.qtdDificil <= state.disponibilidade.dificil
  );
}

export function podeConfirmar(state: WizardState): boolean {
  return passo1Valido(state) && passo2Valido(state) && passo3Valido(state);
}

export function montarDataHora(data: string, hora: string): Date | null {
  if (!data || !hora) return null;
  const iso = `${data}T${hora}:00`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function montarPayloadSubmit(state: WizardState) {
  const inicio = montarDataHora(state.passo2.dataInicio, state.passo2.horaInicio);
  const fim = montarDataHora(state.passo2.dataFim, state.passo2.horaFim);

  if (!inicio || !fim) return null;

  const manual = state.passo3.modo === "MANUAL";
  const porComponente = !manual && usaComposicaoPorComponente(state);

  // Quando há cotas por componente, o backend deriva componenteIds e os totais
  // a partir de `composicao`; ainda enviamos as somas para coerência do payload.
  const composicaoArray = porComponente
    ? state.passo1.componenteIds.map((id) => {
        const c = state.passo3.composicao[id] ?? { facil: 0, medio: 0, dificil: 0 };
        return {
          componenteId: id,
          qtdFacil: c.facil,
          qtdMedio: c.medio,
          qtdDificil: c.dificil,
        };
      })
    : [];

  const somaCampo = (campo: DificuldadeCota) =>
    composicaoArray.reduce(
      (s, c) =>
        s + (campo === "facil" ? c.qtdFacil : campo === "medio" ? c.qtdMedio : c.qtdDificil),
      0,
    );

  return {
    titulo: state.passo1.titulo.trim(),
    descricao: state.passo1.descricao.trim() || null,
    componenteId: state.passo1.componenteIds[0],
    componenteIds: state.passo1.componenteIds,
    composicao: composicaoArray,
    qtdFacil: manual ? 0 : porComponente ? somaCampo("facil") : state.passo3.qtdFacil,
    qtdMedio: manual ? 0 : porComponente ? somaCampo("medio") : state.passo3.qtdMedio,
    qtdDificil: manual ? 0 : porComponente ? somaCampo("dificil") : state.passo3.qtdDificil,
    vagas: parseInt(state.passo2.vagas, 10),
    duracaoMinutos: parseInt(state.passo2.duracaoMinutos, 10),
    janelaInicio: inicio.toISOString(),
    janelaFim: fim.toISOString(),
    turmaIds: state.passo1.turmaIds,
    questaoIds: manual ? state.passo3.questaoIds : [],
    embaralharAlternativas: state.passo3.embaralharAlternativas,
    geraCertificado: state.passo1.geraCertificado,
    nivelEnsinoId: state.passo1.geraCertificado ? state.passo1.nivelEnsinoId : null,
    notaMinimaCertificacao: state.passo1.geraCertificado
      ? parseFloat(state.passo1.notaMinimaCertificacao.replace(",", ".")) || 6.0
      : null,
  };
}