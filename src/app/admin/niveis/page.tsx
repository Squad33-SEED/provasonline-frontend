"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/feedback/toast-provider";
import { isApiClientError } from "@/lib/api-client";
import {
  criarModalidade,
  criarNivel,
  editarModalidade,
  editarNivel,
  getNiveisAdmin,
  toggleModalidade,
  toggleNivel,
  type ModalidadeAdmin,
  type NivelAdmin,
} from "@/lib/catalogo-admin";

type NivelComModalidades = NivelAdmin & { modalidades: ModalidadeAdmin[] };

export default function NiveisPage() {
  const toast = useToast();
  const [niveis, setNiveis] = React.useState<NivelComModalidades[]>([]);
  const [carregando, setCarregando] = React.useState(true);

  const [modalNivel, setModalNivel] = React.useState<{
    aberto: boolean;
    editando: NivelComModalidades | null;
  }>({ aberto: false, editando: null });

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    try {
      const niveisList = await getNiveisAdmin();
      const resMod = await fetch("/api/catalogo/modalidades-todas").catch(() => null);
      const todasModal: ModalidadeAdmin[] = resMod?.ok ? await resMod.json() : [];

      const mapa = new Map<string, ModalidadeAdmin[]>();
      todasModal.forEach((m) => {
        if (!mapa.has(m.nivelId)) mapa.set(m.nivelId, []);
        mapa.get(m.nivelId)!.push(m);
      });

      setNiveis(
        niveisList.map((n) => ({
          ...n,
          modalidades: mapa.get(n.id) ?? [],
        }))
      );
    } catch {
      toast.push({ variant: "destructive", title: "Erro ao carregar níveis" });
    } finally {
      setCarregando(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function handleToggleNivel(id: string) {
    try {
      await toggleNivel(id);
      await carregar();
      toast.push({ title: "Status do nível atualizado" });
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
        title="Níveis & Modalidades"
        description="Agrupamento acadêmico das turmas"
        action={
          <Button
            onClick={() => setModalNivel({ aberto: true, editando: null })}
            className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300"
          >
            <Icon.Plus />
            Novo nível
          </Button>
        }
      />

      <section className="grid grid-cols-3 gap-4 px-8 py-6">
        {carregando ? (
          <p className="col-span-3 text-center text-sm text-white/40 py-10">
            Carregando...
          </p>
        ) : niveis.length === 0 ? (
          <p className="col-span-3 text-center text-sm text-white/40 py-10">
            Nenhum nível cadastrado.
          </p>
        ) : (
          niveis.map((n) => (
            <Panel key={n.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className={`text-base font-semibold ${n.ativo ? "text-white" : "text-white/40 line-through"}`}
                  >
                    {n.nome}
                  </h3>
                  <span className="font-mono text-xs text-amber-300 tabular-nums">
                    {n.modalidades.length} modalidade(s)
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    className="h-7 rounded-lg px-2 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                    onClick={() => setModalNivel({ aberto: true, editando: n })}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-7 rounded-lg px-2 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                    onClick={() => handleToggleNivel(n.id)}
                  >
                    {n.ativo ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/40 pb-2">
                  Modalidades
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {n.modalidades.length === 0 ? (
                    <span className="text-xs text-white/30">Nenhuma modalidade</span>
                  ) : (
                    n.modalidades.map((m) => (
                      <Tag key={m.id} tone={m.ativo ? (m.supletivo ? "amber" : "blue") : "slate"}>
                        {m.nome}
                      </Tag>
                    ))
                  )}
                </div>
              </div>
            </Panel>
          ))
        )}
      </section>

      {modalNivel.aberto && (
        <ModalNivel
          editando={modalNivel.editando}
          onClose={() => setModalNivel({ aberto: false, editando: null })}
          onSalvo={carregar}
        />
      )}
    </>
  );
}


function ModalNivel({
  editando,
  onClose,
  onSalvo,
}: {
  editando: NivelComModalidades | null;
  onClose: () => void;
  onSalvo: () => Promise<void>;
}) {
  const toast = useToast();
  const [nome, setNome] = React.useState(editando?.nome ?? "");
  const [descricao, setDescricao] = React.useState(editando?.descricao ?? "");
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState("");

  // Modalidades
  const [modalidades, setModalidades] = React.useState<ModalidadeAdmin[]>(
    editando?.modalidades ?? []
  );
  const [novaModalidade, setNovaModalidade] = React.useState("");
  const [supletivo, setSupletivo] = React.useState(false);
  const [adicionando, setAdicionando] = React.useState(false);
  const [editandoModal, setEditandoModal] = React.useState<ModalidadeAdmin | null>(null);
  const [nomeEditModal, setNomeEditModal] = React.useState("");
  const [suplEditModal, setSuplEditModal] = React.useState(false);

  async function salvar() {
    if (!nome.trim()) { setErro("Informe o nome"); return; }
    setSalvando(true);
    try {
      if (editando) {
        await editarNivel(editando.id, {
          nome: nome.trim(),
          descricao: descricao.trim() || null,
        });
      } else {
        await criarNivel({
          nome: nome.trim(),
          descricao: descricao.trim() || null,
        });
      }
      toast.push({ title: editando ? "Nível atualizado" : "Nível criado" });
      await onSalvo();
      onClose();
    } catch (err) {
      setErro(isApiClientError(err) ? err.detail : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  async function handleAdicionarModalidade() {
    if (!novaModalidade.trim() || !editando) return;
    setAdicionando(true);
    try {
      const criada = await criarModalidade({
        nivelId: editando.id,
        nome: novaModalidade.trim(),
        supletivo,
      });
      setModalidades((prev) => [...prev, criada]);
      setNovaModalidade("");
      setSupletivo(false);
      toast.push({ title: "Modalidade adicionada" });
    } catch (err) {
      toast.push({
        variant: "destructive",
        title: "Erro",
        description: isApiClientError(err) ? err.detail : "Erro",
      });
    } finally {
      setAdicionando(false);
    }
  }

  async function handleToggleModalidade(id: string) {
    try {
      const atualizada = await toggleModalidade(id);
      setModalidades((prev) => prev.map((m) => (m.id === id ? atualizada : m)));
    } catch (err) {
      toast.push({
        variant: "destructive",
        title: "Não foi possível alterar",
        description: isApiClientError(err) ? err.detail : "Erro",
      });
    }
  }

  async function handleSalvarEdicaoModal() {
    if (!editandoModal || !nomeEditModal.trim()) return;
    try {
      const atualizada = await editarModalidade(editandoModal.id, {
        nome: nomeEditModal.trim(),
        supletivo: suplEditModal,
      });
      setModalidades((prev) => prev.map((m) => (m.id === editandoModal.id ? atualizada : m)));
      setEditandoModal(null);
      toast.push({ title: "Modalidade atualizada" });
    } catch (err) {
      toast.push({
        variant: "destructive",
        title: "Erro",
        description: isApiClientError(err) ? err.detail : "Erro",
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c1a33] p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">
          {editando ? "Editar nível" : "Novo nível"}
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-white/70">Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70">Descrição (opcional)</label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>
          {erro && <p className="text-xs text-rose-300">{erro}</p>}
        </div>

        {/* Seção de modalidades — só aparece ao editar */}
        {editando && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
              Modalidades
            </p>

            {/* Lista de modalidades existentes */}
            <div className="mb-3 max-h-40 overflow-y-auto rounded-lg border border-white/10">
              {modalidades.length === 0 ? (
                <p className="py-4 text-center text-xs text-white/30">Nenhuma modalidade</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {modalidades.map((m) =>
                    editandoModal?.id === m.id ? (
                      <li key={m.id} className="flex items-center gap-2 px-3 py-2">
                        <input
                          value={nomeEditModal}
                          onChange={(e) => setNomeEditModal(e.target.value)}
                          className="flex-1 rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white focus:outline-none"
                        />
                        <label className="flex items-center gap-1 text-xs text-white/60">
                          <input
                            type="checkbox"
                            checked={suplEditModal}
                            onChange={(e) => setSuplEditModal(e.target.checked)}
                            className="accent-amber-400"
                          />
                          EJA
                        </label>
                        <button
                          onClick={handleSalvarEdicaoModal}
                          className="text-xs text-emerald-300 hover:text-emerald-200"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditandoModal(null)}
                          className="text-xs text-white/30 hover:text-white/60"
                        >
                          Cancelar
                        </button>
                      </li>
                    ) : (
                      <li key={m.id} className="flex items-center justify-between px-3 py-2">
                        <span className={`text-sm ${m.ativo ? "text-white/80" : "text-white/30 line-through"}`}>
                          {m.nome}
                          {m.supletivo && <span className="ml-1 text-[10px] text-amber-300">EJA</span>}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditandoModal(m);
                              setNomeEditModal(m.nome);
                              setSuplEditModal(m.supletivo);
                            }}
                            className="text-xs text-white/40 hover:text-white/70"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleModalidade(m.id)}
                            className={`text-xs ${m.ativo ? "text-rose-300 hover:text-rose-200" : "text-emerald-300 hover:text-emerald-200"}`}
                          >
                            {m.ativo ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>

            {/* Adicionar nova modalidade */}
            <div className="flex gap-2">
              <input
                value={novaModalidade}
                onChange={(e) => setNovaModalidade(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleAdicionarModalidade()}
                placeholder="Nova modalidade"
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
              />
              <label className="flex items-center gap-1 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={supletivo}
                  onChange={(e) => setSupletivo(e.target.checked)}
                  className="accent-amber-400"
                />
                EJA
              </label>
              <Button
                variant="ghost"
                onClick={handleAdicionarModalidade}
                disabled={adicionando || !novaModalidade.trim()}
                className="h-9 rounded-lg border border-white/10 px-3 text-xs text-white/70 hover:bg-white/[0.05]"
              >
                Adicionar
              </Button>
            </div>
          </div>
        )}

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
