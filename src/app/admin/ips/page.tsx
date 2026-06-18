
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import {
  criarIp,
  editarIp,
  getIps,
  toggleIp,
  type IpAutorizado,
} from "@/lib/ips";
import { ConfirmDialog } from "@/components/dialogs/dialog-confirmacao";

function formatarData(valor: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

function mensagemErro(error: unknown) {
  if (error && typeof error === "object" && "detail" in error) {
    return String((error as { detail?: unknown }).detail ?? "Erro inesperado");
  }

  return "Erro inesperado ao processar a solicitação.";
}

export default function IPs() {
  const [ips, setIps] = useState<IpAutorizado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<IpAutorizado | null>(null);
  const [confirmando, setConfirmando] = useState<IpAutorizado | null>(null);
  const [alternando, setAlternando] = useState(false);

  const [ip, setIp] = useState("");
  const [descricao, setDescricao] = useState("");

  const total = ips.length;
  const ativos = useMemo(() => ips.filter((item) => item.ativo).length, [ips]);
  const inativos = total - ativos;

  async function carregarIps() {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await getIps();
      setIps(dados);
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarIps();
  }, []);

  function abrirCadastro() {
    setEditando(null);
    setIp("");
    setDescricao("");
    setErro(null);
    setFormAberto(true);
  }

  function abrirEdicao(item: IpAutorizado) {
    setEditando(item);
    setIp(item.ip);
    setDescricao(item.descricao ?? "");
    setErro(null);
    setFormAberto(true);
  }

  function fecharFormulario() {
    setFormAberto(false);
    setEditando(null);
    setIp("");
    setDescricao("");
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ip.trim()) {
      setErro("Informe o endereço de IP.");
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      const payload = {
        ip: ip.trim(),
        descricao: descricao.trim() || null,
      };

      if (editando) {
        await editarIp(editando.id, payload);
      } else {
        await criarIp(payload);
      }

      await carregarIps();
      fecharFormulario();
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus(item: IpAutorizado) {
    try {
      setAlternando(true);
      setErro(null);
      await toggleIp(item.id);
      await carregarIps();
      setConfirmando(null);
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setAlternando(false);
    }
  }

  return (
    <>
      <PageHeader
        title="IPs autorizados"
        description="Cadastro e gerenciamento de endereços de IP autorizados para acesso administrativo"
        action={
          <Button
            type="button"
            onClick={abrirCadastro}
            className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300"
          >
            <Icon.Plus />
            Vincular IP
          </Button>
        }
      />

      <section className="grid grid-cols-3 gap-4 px-8 py-6">
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
            Total de IPs
          </p>
          <p className="pt-2 text-2xl font-semibold text-white tabular-nums">
            {total}
          </p>
        </Panel>

        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
            IPs ativos
          </p>
          <p className="pt-2 text-2xl font-semibold text-emerald-300 tabular-nums">
            {ativos}
          </p>
        </Panel>

        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
            IPs inativos
          </p>
          <p className="pt-2 text-2xl font-semibold text-rose-300 tabular-nums">
            {inativos}
          </p>
        </Panel>
      </section>

      <section className="space-y-4 px-8 pb-8">
        {erro && (
          <Panel>
            <p className="text-sm text-rose-300">{erro}</p>
          </Panel>
        )}

        {formAberto && (
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                {editando ? "Editar IP autorizado" : "Vincular novo IP"}
              </h2>

              <Button
                type="button"
                onClick={fecharFormulario}
                className="h-8 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>

            <form onSubmit={salvar} className="grid gap-4 md:grid-cols-[1fr_2fr_auto]">
              <label className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-white/40">
                  IP
                </span>
                <input
                  value={ip}
                  onChange={(event) => setIp(event.target.value)}
                  placeholder="Ex.: 192.168.0.10"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/60"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-white/40">
                  Descrição
                </span>
                <input
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Ex.: Laboratório CEAS"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/60"
                />
              </label>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={salvando}
                  className="h-10 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300 disabled:opacity-60"
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Panel>
        )}

        <Panel>
          <h2 className="pb-4 text-sm font-semibold text-white">Registros</h2>

          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                  <th className="px-4 py-3 font-medium">Criado em</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {carregando && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-white/50">
                      Carregando IPs autorizados...
                    </td>
                  </tr>
                )}

                {!carregando && ips.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-white/50">
                      Nenhum IP autorizado cadastrado.
                    </td>
                  </tr>
                )}

                {!carregando &&
                  ips.map((item) => (
                    <tr key={item.id} className="text-white/80">
                      <td className="px-4 py-3 font-mono text-xs text-white">
                        {item.ip}
                      </td>

                      <td className="px-4 py-3 text-white/70">
                        {item.descricao || "Sem descrição"}
                      </td>

                      <td className="px-4 py-3">
                        <Tag tone={item.ativo ? "emerald" : "rose"}>
                          {item.ativo ? "ativo" : "inativo"}
                        </Tag>
                      </td>

                      <td className="px-4 py-3 text-xs text-white/60">
                        {formatarData(item.criadoEm)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            onClick={() => abrirEdicao(item)}
                            className="h-8 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                          >
                            Editar
                          </Button>

                          <Button
                            type="button"
                            onClick={() => setConfirmando(item)}
                            className="h-8 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                          >
                            {item.ativo ? "Desativar" : "Reativar"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <ConfirmDialog
        open={confirmando !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setConfirmando(null);
        }}
        title={
          confirmando?.ativo
            ? "Desativar IP autorizado?"
            : "Reativar IP autorizado?"
        }
        description={
          confirmando
            ? `Tem certeza que deseja ${
                confirmando.ativo ? "desativar" : "reativar"
              } o IP ${confirmando.ip}?`
            : undefined
        }
        confirmLabel={confirmando?.ativo ? "Desativar" : "Reativar"}
        destructive={confirmando?.ativo ?? false}
        loading={alternando}
        onConfirm={() => {
          if (confirmando) alternarStatus(confirmando);
        }}
      />
    </>
  );
}
