"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/feedback/toast-provider";
import { isApiClientError } from "@/lib/api-client";
import {
  criarAssunto,
  criarComponente,
  editarComponente,
  getComponentesAdmin,
  getNomesAssuntosExistentes,
  toggleAssunto,
  toggleComponente,
  type AssuntoAdmin,
  type ComponenteAdmin,
} from "@/lib/catalogo-admin";
import { apiGet } from "@/lib/api-client";
import type { ModalidadeResumo } from "@/lib/types";

export default function ComponentesPage() {
  const toast = useToast();
  const [componentes, setComponentes] = React.useState<ComponenteAdmin[]>([]);
  const [modalidades, setModalidades] = React.useState<ModalidadeResumo[]>([]);
  const [carregando, setCarregando] = React.useState(true);

  const [modalComp, setModalComp] = React.useState<{
    aberto: boolean;
    editando: ComponenteAdmin | null;
  }>({ aberto: false, editando: null });

  const [modalGerenciar, setModalGerenciar] = React.useState<ComponenteAdmin | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    try {
      const [comps, mods] = await Promise.all([
        getComponentesAdmin(),
        apiGet<ModalidadeResumo[]>("/api/catalogo/modalidades"),
      ]);
      setComponentes(comps);
      setModalidades(mods);
    } catch {
      toast.push({ variant: "destructive", title: "Erro ao carregar componentes" });
    } finally {
      setCarregando(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function handleToggle(id: string) {
    try {
      await toggleComponente(id);
      await carregar();
      toast.push({ title: "Status atualizado" });
    } catch (err) {
      toast.push({
        variant: "destructive",
        title: "Não foi possível alterar",
        description: isApiClientError(err) ? err.detail : "Erro",
      });
    }
  }

  return (
    <>
      <PageHeader
        title="Componentes curriculares"
        description="Disciplinas e seus assuntos — base para o banco de questões"
        action={
          <Button
            onClick={() => setModalComp({ aberto: true, editando: null })}
            className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300"
          >
            <Icon.Plus />
            Novo componente
          </Button>
        }
      />

      <section className="grid grid-cols-2 gap-4 px-8 py-6">
        {carregando ? (
          <p className="col-span-2 py-10 text-center text-sm text-white/40">
            Carregando...
          </p>
        ) : componentes.length === 0 ? (
          <p className="col-span-2 py-10 text-center text-sm text-white/40">
            Nenhum componente cadastrado.
          </p>
        ) : (
          componentes.map((c) => (
            <Panel key={c.id}>
              <div className="flex items-start justify-between pb-4">
                <div>
                  <h3
                    className={`text-base font-semibold ${c.ativo ? "text-white" : "text-white/40 line-through"}`}
                  >
                    {c.nome}
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                    {c.codigo} ·{" "}
                    {(c.assuntos?.length ?? c.totalAssuntos)} assuntos ·{" "}
                    {c.totalQuestoes} questões
                  </p>
                  {c.modalidade && (
                    <p className="mt-1 text-xs text-white/50">{c.modalidade.nome}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                    onClick={() => setModalGerenciar(c)}
                  >
                    Gerenciar
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                    onClick={() => setModalComp({ aberto: true, editando: c })}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-7 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                    onClick={() => handleToggle(c.id)}
                  >
                    {c.ativo ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(c.assuntos ?? []).map((a) => (
                  <span
                    key={a.id}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/70"
                  >
                    {a.nome}
                  </span>
                ))}
              </div>
            </Panel>
          ))
        )}
      </section>

      {modalComp.aberto && (
        <ModalComponente
          editando={modalComp.editando}
          modalidades={modalidades}
          onClose={() => setModalComp({ aberto: false, editando: null })}
          onSalvo={carregar}
        />
      )}

      {modalGerenciar && (
        <ModalGerenciarComponente
          componente={modalGerenciar}
          onClose={() => { setModalGerenciar(null); void carregar(); }}
        />
      )}
    </>
  );
}


const DISCIPLINAS_API: { slug: string; label: string }[] = [
  { slug: "biologia", label: "Biologia" },
  { slug: "fisica", label: "Física" },
  { slug: "geografia", label: "Geografia" },
  { slug: "historia", label: "História" },
  { slug: "ingles", label: "Inglês" },
  { slug: "matematica", label: "Matemática" },
  { slug: "portugues", label: "Português" },
  { slug: "quimica", label: "Química" },
];


function ModalComponente({
  editando,
  modalidades,
  onClose,
  onSalvo,
}: {
  editando: ComponenteAdmin | null;
  modalidades: ModalidadeResumo[];
  onClose: () => void;
  onSalvo: () => Promise<void>;
}) {
  const toast = useToast();
  const [nome, setNome] = React.useState(editando?.nome ?? "");
  const [codigo, setCodigo] = React.useState(editando?.codigo ?? "");
  const [modalidadeId, setModalidadeId] = React.useState(
    editando?.modalidadeId ?? ""
  );
  const [subjectSlug, setSubjectSlug] = React.useState(
    editando?.questionsSubjectSlug ?? ""
  );
  const [assuntos, setAssuntos] = React.useState<string[]>([]);
  const [novoAssunto, setNovoAssunto] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState("");
  const [nomesExistentes, setNomesExistentes] = React.useState<string[]>([]);

  React.useEffect(() => {
    getNomesAssuntosExistentes().then(setNomesExistentes).catch(() => {});
  }, []);

  function adicionarAssunto() {
    const v = novoAssunto.trim();
    if (!v) return;
    if (assuntos.includes(v)) return;
    setAssuntos((prev) => [...prev, v]);
    setNovoAssunto("");
  }

  function removerAssunto(nome: string) {
    setAssuntos((prev) => prev.filter((a) => a !== nome));
  }

  async function salvar() {
    if (!nome.trim()) { setErro("Informe o nome"); return; }
    if (!codigo.trim()) { setErro("Informe o código"); return; }
    if (!editando && !modalidadeId) { setErro("Selecione uma modalidade"); return; }
    setSalvando(true);
    try {
      if (editando) {
        await editarComponente(editando.id, {
          nome: nome.trim(),
          codigo: codigo.trim(),
          questionsSubjectSlug: subjectSlug || null,
        });
      } else {
        await criarComponente({
          modalidadeId,
          nome: nome.trim(),
          codigo: codigo.trim(),
          assuntos,
          questionsSubjectSlug: subjectSlug || null,
        });
      }
      toast.push({ title: editando ? "Componente atualizado" : "Componente criado" });
      await onSalvo();
      onClose();
    } catch (err) {
      setErro(isApiClientError(err) ? err.detail : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c1a33] p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">
          {editando ? "Editar componente" : "Novo componente"}
        </h2>
        <div className="flex flex-col gap-3">
          {!editando && (
            <div>
              <label className="mb-1 block text-xs text-white/70">Modalidade</label>
              <select
                value={modalidadeId}
                onChange={(e) => setModalidadeId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="">Selecione</option>
                {modalidades.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-white/70">Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70">Código</label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: MAT001"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70">
              Disciplina (banco de questões)
            </label>
            <select
              value={subjectSlug}
              onChange={(e) => setSubjectSlug(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="">Sem vínculo</option>
              {DISCIPLINAS_API.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-white/40">
              Necessário para montar etapas com questões da API.
            </p>
          </div>
          {!editando && (
            <div>
              <label className="mb-1 block text-xs text-white/70">
                Assuntos (opcional)
              </label>
              <div className="flex gap-2">
                <input
                  value={novoAssunto}
                  onChange={(e) => setNovoAssunto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      adicionarAssunto();
                    }
                  }}
                  placeholder="Nome do assunto"
                  list="assuntos-existentes-novo"
                  className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
                />
                <datalist id="assuntos-existentes-novo">
                  {nomesExistentes.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
                <Button
                  variant="ghost"
                  onClick={adicionarAssunto}
                  className="h-9 rounded-lg border border-white/10 px-3 text-xs text-white/70 hover:bg-white/[0.05]"
                >
                  Adicionar
                </Button>
              </div>
              {assuntos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {assuntos.map((a) => (
                    <span
                      key={a}
                      className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/70"
                    >
                      {a}
                      <button
                        onClick={() => removerAssunto(a)}
                        className="text-white/40 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {erro && <p className="text-xs text-rose-300">{erro}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={salvando}
            className="text-white/70 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={salvar}
            disabled={salvando}
            className="bg-amber-400 text-[#0c1a33] hover:bg-amber-300"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}


function ModalGerenciarComponente({
  componente,
  onClose,
}: {
  componente: ComponenteAdmin;
  onClose: () => void;
}) {
  const toast = useToast();
  const [assuntos, setAssuntos] = React.useState<AssuntoAdmin[]>([]);

  React.useEffect(() => {
    fetch(`/api/catalogo/assuntos-admin/${componente.id}`)
      .then((r) => r.json())
      .then((data: AssuntoAdmin[]) => setAssuntos(data))
      .catch(() => {});
  }, [componente.id]);
  
  const [novoAssunto, setNovoAssunto] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);
  const [nomesExistentes, setNomesExistentes] = React.useState<string[]>([]);

  React.useEffect(() => {
    getNomesAssuntosExistentes().then(setNomesExistentes).catch(() => {});
  }, []);

  async function adicionar() {
    if (!novoAssunto.trim()) return;
    setSalvando(true);
    try {
      const criado = await criarAssunto(componente.id, { nome: novoAssunto.trim() });
      setAssuntos((prev) => [...prev, criado]);
      setNovoAssunto("");
      toast.push({ title: "Assunto adicionado" });
    } catch (err) {
      toast.push({
        variant: "destructive",
        title: "Erro",
        description: isApiClientError(err) ? err.detail : "Erro",
      });
    } finally {
      setSalvando(false);
    }
  }

  async function handleToggleAssunto(id: string) {
    try {
      const atualizado = await toggleAssunto(id);
      setAssuntos((prev) =>
        prev.map((a) => (a.id === id ? atualizado : a))
      );
    } catch (err) {
      toast.push({
        variant: "destructive",
        title: "Não foi possível alterar",
        description: isApiClientError(err) ? err.detail : "Erro",
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c1a33] p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Gerenciar: {componente.nome}
          </h2>
          <p className="text-xs text-white/50">Código: {componente.codigo}</p>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            value={novoAssunto}
            onChange={(e) => setNovoAssunto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void adicionar()}
            placeholder="Nome do novo assunto"
            list="assuntos-existentes-gerenciar"
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
          />
          <datalist id="assuntos-existentes-gerenciar">
            {nomesExistentes.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <Button
            onClick={adicionar}
            disabled={salvando || !novoAssunto.trim()}
            className="bg-amber-400 text-[#0c1a33] hover:bg-amber-300"
          >
            Adicionar
          </Button>
        </div>

        <div className="max-h-64 overflow-y-auto rounded-lg border border-white/10">
          {assuntos.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/40">
              Nenhum assunto cadastrado.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {assuntos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <span
                    className={`text-sm ${a.ativo ? "text-white/80" : "text-white/30 line-through"}`}
                  >
                    {a.nome}
                  </span>
                  <button
                    onClick={() => handleToggleAssunto(a.id)}
                    className={`text-xs ${a.ativo ? "text-rose-300 hover:text-rose-200" : "text-emerald-300 hover:text-emerald-200"}`}
                  >
                    {a.ativo ? "Desativar" : "Reativar"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-amber-400 text-[#0c1a33] hover:bg-amber-300"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}