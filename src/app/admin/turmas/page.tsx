"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { DialogNovaTurma } from "@/components/dialogs/dialog-nova-turma";
import { DialogProfessoresTurma } from "@/components/dialogs/dialog-professores-turma";
import { useToast } from "@/components/feedback/toast-provider";
import { getCatalogo, getTurmas } from "@/lib/catalogo";
import { isApiClientError } from "@/lib/api-client";
import type { Catalogo, Turma } from "@/lib/types";

export default function TurmasPage() {
  const toast = useToast();

  const [turmas, setTurmas] = React.useState<Turma[]>([]);
  const [catalogo, setCatalogo] = React.useState<Catalogo | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erroCarga, setErroCarga] = React.useState<string | null>(null);
  const [dialogAberto, setDialogAberto] = React.useState(false);
  const [turmaProfessores, setTurmaProfessores] = React.useState<Turma | null>(null);

  const carregarDados = React.useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      const [listaTurmas, dadosCatalogo] = await Promise.all([
        getTurmas(),
        getCatalogo(),
      ]);
      setTurmas(listaTurmas);
      setCatalogo(dadosCatalogo);
    } catch (err) {
      const detail = isApiClientError(err)
        ? err.detail
        : "Erro ao carregar dados";
      setErroCarga(detail);
      toast.push({
        variant: "destructive",
        title: "Falha ao carregar turmas",
        description: detail,
      });
    } finally {
      setCarregando(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  function aoTurmaCriada(novaTurma: Turma) {
    setTurmas((prev) => [novaTurma, ...prev]);
  }

  return (
    <>
      <PageHeader
        title="Turmas"
        description="Gerencie turmas vinculadas a escolas e modalidades"
        action={
          <Button
            onClick={() => setDialogAberto(true)}
            disabled={carregando || !catalogo}
            className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300"
          >
            <Icon.Plus />
            Nova turma
          </Button>
        }
      />

      <section className="px-8 py-6">
        <Panel>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Escola</th>
                  <th className="px-4 py-3 font-medium">Modalidade</th>
                  <th className="px-4 py-3 font-medium">Ano</th>
                  <th className="px-4 py-3 font-medium">Alunos</th>
                  <th className="px-4 py-3 font-medium">Professores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {carregando ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-white/40">
                      Carregando turmas...
                    </td>
                  </tr>
                ) : erroCarga ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-rose-300">
                      {erroCarga}
                    </td>
                  </tr>
                ) : turmas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-white/40">
                      Nenhuma turma cadastrada. Clique em &quot;Nova turma&quot; para criar a primeira.
                    </td>
                  </tr>
                ) : (
                  turmas.map((t) => (
                    <tr key={t.id} className="text-white/80">
                      <td className="px-4 py-3 font-medium text-white">{t.nome}</td>
                      <td className="px-4 py-3 text-white/70">{t.escola.nome}</td>
                      <td className="px-4 py-3">
                        <Tag tone="blue">{t.modalidade.nome}</Tag>
                      </td>
                      <td className="px-4 py-3 font-mono text-white/60">{t.anoLetivo}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-white/60">{t.totalAlunos}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          onClick={() => setTurmaProfessores(t)}
                          className="h-8 rounded-lg px-3 text-xs text-white/70 hover:bg-white/[0.05] hover:text-white"
                        >
                          Gerenciar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <DialogNovaTurma
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        catalogo={catalogo}
        onTurmaCriada={aoTurmaCriada}
      />

      <DialogProfessoresTurma
        open={turmaProfessores !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setTurmaProfessores(null);
        }}
        turma={turmaProfessores}
      />
    </>
  );
}