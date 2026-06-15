"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { DialogNovoAluno } from "@/components/dialogs/dialog-novo-aluno";
import { useToast } from "@/components/feedback/toast-provider";
import { getAlunos, getTurmas } from "@/lib/catalogo";
import { isApiClientError } from "@/lib/api-client";
import { maskCpf } from "@/lib/cpf";
import type { Aluno, Turma } from "@/lib/types";

export default function AlunosPage() {
  const toast = useToast();

  const [alunos, setAlunos] = React.useState<Aluno[]>([]);
  const [turmas, setTurmas] = React.useState<Turma[]>([]);
  const [busca, setBusca] = React.useState("");
  const [buscaAplicada, setBuscaAplicada] = React.useState("");
  const [carregando, setCarregando] = React.useState(true);
  const [erroCarga, setErroCarga] = React.useState<string | null>(null);
  const [dialogAberto, setDialogAberto] = React.useState(false);

  const [modalImportarAberto, setModalImportarAberto] = React.useState(false);
  const [arquivoCsv, setArquivoCsv] = React.useState<File | null>(null);
  const [importando, setImportando] = React.useState(false);
  const [progresso, setProgresso] = React.useState<{
    processadas: number;
    total: number;
    importados: number;
    ignorados: number;
  } | null>(null);

  React.useEffect(() => {
    const id = setTimeout(() => setBuscaAplicada(busca.trim()), 350);
    return () => clearTimeout(id);
  }, [busca]);

  const carregarDados = React.useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      const [listaAlunos, listaTurmas] = await Promise.all([
        getAlunos(buscaAplicada ? { busca: buscaAplicada } : undefined),
        getTurmas(),
      ]);
      setAlunos(listaAlunos);
      setTurmas(listaTurmas);
    } catch (err) {
      const detail = isApiClientError(err)
        ? err.detail
        : "Erro ao carregar dados";
      setErroCarga(detail);
      toast.push({
        variant: "destructive",
        title: "Falha ao carregar alunos",
        description: detail,
      });
    } finally {
      setCarregando(false);
    }
  }, [buscaAplicada, toast]);

  React.useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  function aoAlunoCriado() {
    void carregarDados();
  }

  function fecharModalImportar() {
    setArquivoCsv(null);
    setProgresso(null);
    setModalImportarAberto(false);
  }

  function aoSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];

    if (!arquivo) {
      setArquivoCsv(null);
      return;
    }

    if (!arquivo.name.toLowerCase().endsWith(".csv")) {
      setArquivoCsv(null);
      toast.push({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Selecione um arquivo no formato .csv.",
      });
      return;
    }

    setArquivoCsv(arquivo);
  }

  async function enviarPlanilha() {
    if (!arquivoCsv) return;

    setImportando(true);
    setProgresso(null);

    try {
      const formData = new FormData();
      formData.append("arquivo", arquivoCsv);

      const respostaUpload = await fetch("/api/alunos/importar", {
        method: "POST",
        body: formData,
      });

      const dadosUpload = await respostaUpload.json();

      if (!respostaUpload.ok) {
        throw new Error(dadosUpload.detail || "Erro ao enviar planilha");
      }

      const importacaoId = dadosUpload.id;
      setProgresso({
        processadas: 0,
        total: dadosUpload.totalLinhas ?? 0,
        importados: 0,
        ignorados: 0,
      });

      let concluida = false;
      let importados = 0;
      let ignorados = 0;

      while (!concluida) {
        const respostaLote = await fetch(
          `/api/alunos/importar/${importacaoId}/processar`,
          { method: "POST" },
        );

        const dadosLote = await respostaLote.json();

        if (!respostaLote.ok) {
          throw new Error(dadosLote.detail || "Erro ao processar importação");
        }

        importados = dadosLote.importados;
        ignorados = dadosLote.ignorados;
        concluida = dadosLote.concluida;

        setProgresso({
          processadas: dadosLote.processadas,
          total: dadosLote.totalLinhas,
          importados,
          ignorados,
        });
      }

      toast.push({
        variant: ignorados > 0 ? "default" : "success",
        title: "Importação concluída",
        description: `${importados} aluno(s) importado(s)${
          ignorados > 0 ? ` · ${ignorados} ignorado(s)` : ""
        }.`,
      });

      fecharModalImportar();

      await carregarDados();
    } catch (err) {
      toast.push({
        variant: "destructive",
        title: "Falha na importação",
        description:
          err instanceof Error ? err.message : "Erro ao enviar planilha",
      });
    } finally {
      setImportando(false);
    }
  }

  function formatarData(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("pt-BR");
    } catch {
      return iso;
    }
  }

  return (
    <>
      <PageHeader
        title="Alunos"
        description="Cadastro individual de alunos com vínculo opcional de turma"
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setModalImportarAberto(true)}
              disabled={carregando}
              className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white hover:bg-white/[0.08]"
            >
              Importar CSV
            </Button>

            <Button
              onClick={() => setDialogAberto(true)}
              disabled={carregando}
              className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300"
            >
              <Icon.Plus />
              Novo aluno
            </Button>
          </div>
        }
      />

      <section className="px-8 py-6">
        <Panel>
          <div className="flex items-center justify-between pb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
              {alunos.length} alunos
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5">
              <Icon.Search className="size-3 text-white/40" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou CPF"
                className="w-56 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">CPF</th>
                  <th className="px-4 py-3 font-medium">Data de nascimento</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {carregando ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-white/40">
                      Carregando alunos...
                    </td>
                  </tr>
                ) : erroCarga ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-rose-300">
                      {erroCarga}
                    </td>
                  </tr>
                ) : alunos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-white/40">
                      {buscaAplicada
                        ? "Nenhum aluno encontrado para essa busca."
                        : "Nenhum aluno cadastrado. Clique em \"Novo aluno\" para criar o primeiro."}
                    </td>
                  </tr>
                ) : (
                  alunos.map((a) => (
                    <tr key={a.id} className="text-white/80">
                      <td className="px-4 py-3 font-medium text-white">{a.nome}</td>
                      <td className="px-4 py-3 font-mono text-white/60">{maskCpf(a.cpf)}</td>
                      <td className="px-4 py-3 font-mono text-white/60">
                        {formatarData(a.dataNascimento)}
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {a.turmaNome ? (
                          <span>
                            {a.turmaNome}
                            {a.escolaNome && (
                              <span className="text-white/40"> · {a.escolaNome}</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-white/30">Sem turma</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {a.necessidadeEspecial && (
                          <Tag tone="amber">Necessidade especial</Tag>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      {modalImportarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c1a33] p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Importar alunos via CSV
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Envie um arquivo .csv com as colunas: nome, email, cpf,
                data_nascimento, turma_id.
              </p>
            </div>

            {progresso ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Importando alunos...</span>
                  <span className="font-mono tabular-nums">
                    {progresso.processadas}/{progresso.total}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{
                      width: `${
                        progresso.total > 0
                          ? Math.round(
                              (progresso.processadas / progresso.total) * 100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex gap-4 text-xs">
                  <span className="text-emerald-300">
                    {progresso.importados} importados
                  </span>
                  <span className="text-rose-300">
                    {progresso.ignorados} ignorados
                  </span>
                </div>
              </div>
            ) : (
              <>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-8 text-center hover:bg-white/[0.05]">
                  <span className="text-sm font-medium text-white">
                    Clique para selecionar a planilha
                  </span>
                  <span className="mt-1 text-xs text-white/40">
                    Apenas arquivos .csv
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={aoSelecionarArquivo}
                    className="hidden"
                  />
                </label>

                {arquivoCsv && (
                  <p className="mt-3 rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-white/70">
                    Arquivo selecionado:{" "}
                    <span className="font-medium text-white">
                      {arquivoCsv.name}
                    </span>
                  </p>
                )}
              </>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                onClick={fecharModalImportar}
                disabled={importando}
                className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                onClick={enviarPlanilha}
                disabled={!arquivoCsv || importando}
                className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importando ? "Importando..." : "Enviar Planilha"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DialogNovoAluno
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        turmas={turmas}
        onAlunoCriado={aoAlunoCriado}
      />
    </>
  );
}