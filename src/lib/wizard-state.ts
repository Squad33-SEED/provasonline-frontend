"use client";

import * as React from "react";
import type { ComponenteCatalogo, Disponibilidade } from "@/lib/types";

export type PassoIdentificacaoState = {
  titulo: string;
  descricao: string;
  componenteId: string;
  componenteNome: string;
  turmaIds: string[];
};

export type PassoJanelaState = {
  vagas: string;
  duracaoMinutos: string;
  dataInicio: string;
  horaInicio: string;
  dataFim: string;
  horaFim: string;
};

export type PassoComposicaoState = {
  qtdFacil: number;
  qtdMedio: number;
  qtdDificil: number;
};

export type WizardState = {
  passoAtual: 1 | 2 | 3;
  passo1: PassoIdentificacaoState;
  passo2: PassoJanelaState;
  passo3: PassoComposicaoState;
  disponibilidade: Disponibilidade | null;
  carregandoDisponibilidade: boolean;
  componentes: ComponenteCatalogo[];
  carregandoComponentes: boolean;
  erroSubmit: string | null;
};

export type WizardAction =
  | { type: "ATUALIZAR_PASSO_1"; campo: keyof PassoIdentificacaoState; valor: string }
  | { type: "SELECIONAR_COMPONENTE"; id: string; nome: string }
  | { type: "TOGGLE_TURMA"; turmaId: string }
  | { type: "ATUALIZAR_PASSO_2"; campo: keyof PassoJanelaState; valor: string }
  | { type: "ATUALIZAR_PASSO_3"; campo: keyof PassoComposicaoState; valor: number }
  | { type: "AVANCAR" }
  | { type: "VOLTAR" }
  | { type: "SET_COMPONENTES"; componentes: ComponenteCatalogo[] }
  | { type: "INICIAR_LOAD_COMPONENTES" }
  | { type: "INICIAR_LOAD_DISPONIBILIDADE" }
  | { type: "SET_DISPONIBILIDADE"; disponibilidade: Disponibilidade }
  | { type: "ERRO_SUBMIT"; mensagem: string }
  | { type: "LIMPAR_ERRO" };

const ESTADO_INICIAL: WizardState = {
  passoAtual: 1,
  passo1: {
    titulo: "",
    descricao: "",
    componenteId: "",
    componenteNome: "",
    turmaIds: [],
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
    qtdFacil: 0,
    qtdMedio: 0,
    qtdDificil: 0,
  },
  disponibilidade: null,
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

    case "SELECIONAR_COMPONENTE":
      return {
        ...state,
        passo1: {
          ...state.passo1,
          componenteId: action.id,
          componenteNome: action.nome,
        },
        disponibilidade: null,
        passo3: { qtdFacil: 0, qtdMedio: 0, qtdDificil: 0 },
      };

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
  return titulo.length >= 3 && state.passo1.componenteId.length > 0;
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

export function passo3Valido(state: WizardState): boolean {
  const { qtdFacil, qtdMedio, qtdDificil } = state.passo3;
  const total = qtdFacil + qtdMedio + qtdDificil;

  if (total < 1) return false;
  if (!state.disponibilidade) return false;

  return (
    qtdFacil <= state.disponibilidade.facil &&
    qtdMedio <= state.disponibilidade.medio &&
    qtdDificil <= state.disponibilidade.dificil
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

  return {
    titulo: state.passo1.titulo.trim(),
    descricao: state.passo1.descricao.trim() || null,
    componenteId: state.passo1.componenteId,
    qtdFacil: state.passo3.qtdFacil,
    qtdMedio: state.passo3.qtdMedio,
    qtdDificil: state.passo3.qtdDificil,
    vagas: parseInt(state.passo2.vagas, 10),
    duracaoMinutos: parseInt(state.passo2.duracaoMinutos, 10),
    janelaInicio: inicio.toISOString(),
    janelaFim: fim.toISOString(),
    turmaIds: state.passo1.turmaIds,
  };
}