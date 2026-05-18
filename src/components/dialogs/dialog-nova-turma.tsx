"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { criarTurma } from "@/lib/catalogo";
import { isApiClientError } from "@/lib/api-client";
import type { Catalogo, EscolaResumo, ModalidadeResumo, Turma } from "@/lib/types";

type FormErrors = {
  nome?: string;
  anoLetivo?: string;
  escolaId?: string;
  modalidadeId?: string;
  geral?: string;
};

const ANO_ATUAL = new Date().getFullYear();
const ANO_PADRAO = ANO_ATUAL >= 2026 ? ANO_ATUAL : 2026;

export function DialogNovaTurma({
  open,
  onOpenChange,
  catalogo,
  onTurmaCriada,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogo: Catalogo | null;
  onTurmaCriada: (turma: Turma) => void;
}) {
  const toast = useToast();

  const [nome, setNome] = React.useState("");
  const [anoLetivo, setAnoLetivo] = React.useState<string>(String(ANO_PADRAO));
  const [escolaId, setEscolaId] = React.useState("");
  const [modalidadeId, setModalidadeId] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setNome("");
      setAnoLetivo(String(ANO_PADRAO));
      setEscolaId("");
      setModalidadeId("");
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  function validar(): boolean {
    const novos: FormErrors = {};
    if (!nome.trim()) novos.nome = "Informe o nome da turma";
    else if (nome.trim().length > 50) novos.nome = "Máximo de 50 caracteres";

    const ano = parseInt(anoLetivo, 10);
    if (!Number.isFinite(ano)) novos.anoLetivo = "Ano inválido";
    else if (ano < 2024 || ano > 2030)
      novos.anoLetivo = "Ano deve estar entre 2024 e 2030";

    if (!escolaId) novos.escolaId = "Selecione uma escola";
    if (!modalidadeId) novos.modalidadeId = "Selecione uma modalidade";

    setErrors(novos);
    return Object.keys(novos).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;

    setSubmitting(true);
    try {
      const turma = await criarTurma({
        nome: nome.trim(),
        anoLetivo: parseInt(anoLetivo, 10),
        escolaId,
        modalidadeId,
      });

      toast.push({
        variant: "success",
        title: "Turma criada com sucesso",
        description: `${turma.nome} · ${turma.escola.nome} · ${turma.anoLetivo}`,
      });

      onTurmaCriada(turma);
      onOpenChange(false);
    } catch (err) {
      const apiErr = isApiClientError(err) ? err : null;
      const status = apiErr?.status;
      const detail = apiErr?.detail ?? "Erro ao criar turma";

      if (status === 409) {
        setErrors({
          nome: "Já existe uma turma com este nome nesta escola e ano",
        });
      } else if (status === 422) {
        setErrors({ geral: detail });
      } else if (status === 403) {
        setErrors({ geral: "Acesso restrito a administradores" });
      } else {
        setErrors({ geral: detail });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark">
        <DialogHeader>
          <DialogTitle>Nova turma</DialogTitle>
          <DialogDescription>
            Cadastre uma turma vinculada a uma escola e modalidade existentes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="turma-nome" className="text-xs text-white/70">
                Nome da turma
              </Label>
              <Input
                id="turma-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="3ºA"
                maxLength={50}
                disabled={submitting}
                aria-invalid={Boolean(errors.nome)}
                className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
              />
              {errors.nome && (
                <p className="text-xs text-rose-300">{errors.nome}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="turma-ano" className="text-xs text-white/70">
                Ano letivo
              </Label>
              <Input
                id="turma-ano"
                type="number"
                inputMode="numeric"
                value={anoLetivo}
                onChange={(e) => setAnoLetivo(e.target.value)}
                min={2024}
                max={2030}
                disabled={submitting}
                aria-invalid={Boolean(errors.anoLetivo)}
                className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
              />
              {errors.anoLetivo && (
                <p className="text-xs text-rose-300">{errors.anoLetivo}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-white/70">Escola</Label>
            <Select
              value={escolaId}
              onValueChange={setEscolaId}
              disabled={submitting || !catalogo}
            >
              <SelectTrigger aria-invalid={Boolean(errors.escolaId)}>
                <SelectValue placeholder="Selecione uma escola" />
              </SelectTrigger>
              <SelectContent>
                {catalogo?.escolas.map((escola: EscolaResumo) => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.escolaId && (
              <p className="text-xs text-rose-300">{errors.escolaId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-white/70">Modalidade</Label>
            <Select
              value={modalidadeId}
              onValueChange={setModalidadeId}
              disabled={submitting || !catalogo}
            >
              <SelectTrigger aria-invalid={Boolean(errors.modalidadeId)}>
                <SelectValue placeholder="Selecione uma modalidade" />
              </SelectTrigger>
              <SelectContent>
                {catalogo?.modalidades.map((modalidade: ModalidadeResumo) => (
                  <SelectItem key={modalidade.id} value={modalidade.id}>
                    {modalidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.modalidadeId && (
              <p className="text-xs text-rose-300">{errors.modalidadeId}</p>
            )}
          </div>

          {errors.geral && (
            <div
              role="alert"
              className="rounded-md border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200"
            >
              {errors.geral}
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="text-white/70 hover:bg-white/[0.05] hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting || !catalogo}
              className="bg-amber-400 text-[#0c1a33] hover:bg-amber-300"
            >
              {submitting ? "Criando..." : "Criar turma"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}