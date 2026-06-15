"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/feedback/toast-provider";
import {
  desvincularProfessor,
  getProfessores,
  getProfessoresDaTurma,
  vincularProfessor,
  type ProfessorResumo,
} from "@/lib/catalogo";
import { isApiClientError } from "@/lib/api-client";

export function DialogProfessoresTurma({
  open,
  onOpenChange,
  turma,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turma: { id: string; nome: string } | null;
}) {
  const toast = useToast();

  const [todos, setTodos] = React.useState<ProfessorResumo[]>([]);
  const [vinculados, setVinculados] = React.useState<ProfessorResumo[]>([]);
  const [selecionado, setSelecionado] = React.useState("");
  const [carregando, setCarregando] = React.useState(false);
  const [submetendo, setSubmetendo] = React.useState(false);

  const carregar = React.useCallback(async () => {
    if (!turma) return;
    setCarregando(true);
    try {
      const [lista, daTurma] = await Promise.all([
        getProfessores(),
        getProfessoresDaTurma(turma.id),
      ]);
      setTodos(lista);
      setVinculados(daTurma);
    } catch (err) {
      const detail = isApiClientError(err) ? err.detail : "Erro ao carregar professores";
      toast.push({ variant: "destructive", title: "Falha ao carregar", description: detail });
    } finally {
      setCarregando(false);
    }
  }, [turma, toast]);

  React.useEffect(() => {
    if (open) {
      setSelecionado("");
      void carregar();
    }
  }, [open, carregar]);

  const disponiveis = todos.filter(
    (p) => !vinculados.some((v) => v.id === p.id),
  );

  async function adicionar() {
    if (!turma || !selecionado) return;
    setSubmetendo(true);
    try {
      await vincularProfessor(turma.id, selecionado);
      setSelecionado("");
      await carregar();
      toast.push({ variant: "success", title: "Professor vinculado" });
    } catch (err) {
      const detail = isApiClientError(err) ? err.detail : "Erro ao vincular";
      toast.push({ variant: "destructive", title: "Falha ao vincular", description: detail });
    } finally {
      setSubmetendo(false);
    }
  }

  async function remover(professorId: string) {
    if (!turma) return;
    setSubmetendo(true);
    try {
      await desvincularProfessor(turma.id, professorId);
      await carregar();
      toast.push({ variant: "success", title: "Vínculo removido" });
    } catch (err) {
      const detail = isApiClientError(err) ? err.detail : "Erro ao remover";
      toast.push({ variant: "destructive", title: "Falha ao remover", description: detail });
    } finally {
      setSubmetendo(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark">
        <DialogHeader>
          <DialogTitle>Professores da turma</DialogTitle>
          <DialogDescription>
            {turma ? `Vincule ou remova professores da turma ${turma.nome}.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs text-white/70">Adicionar professor</label>
              <Select
                value={selecionado}
                onValueChange={setSelecionado}
                disabled={carregando || submetendo || disponiveis.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      disponiveis.length === 0
                        ? "Nenhum professor disponível"
                        : "Selecione um professor"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {disponiveis.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                      {p.especialidade ? ` · ${p.especialidade}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={adicionar}
              disabled={!selecionado || submetendo}
              className="h-10 bg-amber-400 text-[#0c1a33] hover:bg-amber-300"
            >
              Adicionar
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/40">
              Vinculados ({vinculados.length})
            </p>
            {carregando ? (
              <p className="py-6 text-center text-sm text-white/40">Carregando...</p>
            ) : vinculados.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">
                Nenhum professor vinculado a esta turma.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {vinculados.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{p.nome}</span>
                      {p.especialidade && (
                        <span className="text-xs text-white/40">{p.especialidade}</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => remover(p.id)}
                      disabled={submetendo}
                      className="h-8 rounded-lg px-3 text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                    >
                      Remover
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
