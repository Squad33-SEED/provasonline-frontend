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
import { ConteudoSenhaProvisoria } from "@/components/feedback/toast-senha-provisoria";
import { criarAluno } from "@/lib/catalogo";
import { isApiClientError } from "@/lib/api-client";
import { isValidCpf, maskCpf, unmaskCpf } from "@/lib/cpf";
import type { Turma } from "@/lib/types";

const TURMA_NENHUMA = "__nenhuma__";

type FormErrors = {
  nome?: string;
  cpf?: string;
  email?: string;
  dataNascimento?: string;
  geral?: string;
};

export function DialogNovoAluno({
  open,
  onOpenChange,
  turmas,
  onAlunoCriado,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turmas: Turma[];
  onAlunoCriado: () => void;
}) {
  const toast = useToast();

  const [nome, setNome] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [dataNascimento, setDataNascimento] = React.useState("");
  const [necessidadeEspecial, setNecessidadeEspecial] = React.useState(false);
  const [turmaId, setTurmaId] = React.useState<string>(TURMA_NENHUMA);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setNome("");
      setCpf("");
      setEmail("");
      setDataNascimento("");
      setNecessidadeEspecial(false);
      setTurmaId(TURMA_NENHUMA);
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  function validar(): boolean {
    const novos: FormErrors = {};

    if (!nome.trim() || nome.trim().length < 2) {
      novos.nome = "Informe o nome completo do aluno";
    } else if (nome.trim().length > 200) {
      novos.nome = "Máximo de 200 caracteres";
    }

    if (!isValidCpf(cpf)) {
      novos.cpf = "CPF inválido";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      novos.email = "Email inválido";
    }

    if (!dataNascimento) {
      novos.dataNascimento = "Informe a data de nascimento";
    } else {
      const data = new Date(dataNascimento);
      if (isNaN(data.getTime())) {
        novos.dataNascimento = "Data inválida";
      } else if (data > new Date()) {
        novos.dataNascimento = "Data não pode estar no futuro";
      }
    }

    setErrors(novos);
    return Object.keys(novos).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;

    setSubmitting(true);
    try {
      const aluno = await criarAluno({
        nome: nome.trim(),
        cpf: unmaskCpf(cpf),
        email: email.trim() || null,
        dataNascimento,
        necessidadeEspecial,
        turmaId: turmaId === TURMA_NENHUMA ? null : turmaId,
      });

      toast.push({
        variant: "success",
        duration: 30000,
        customContent: (
          <ConteudoSenhaProvisoria
            nomeAluno={aluno.nome}
            cpf={aluno.cpf}
            senhaProvisoria={aluno.senhaProvisoria}
          />
        ),
      });

      onAlunoCriado();
      onOpenChange(false);
    } catch (err) {
      const apiErr = isApiClientError(err) ? err : null;
      const status = apiErr?.status;
      const detail = apiErr?.detail ?? "Erro ao cadastrar aluno";

      if (status === 409) {
        if (detail.toLowerCase().includes("cpf")) {
          setErrors({ cpf: "CPF já cadastrado" });
        } else if (detail.toLowerCase().includes("email")) {
          setErrors({ email: "Email já cadastrado" });
        } else {
          setErrors({ geral: detail });
        }
      } else if (status === 422) {
        if (detail.toLowerCase().includes("cpf")) {
          setErrors({ cpf: detail });
        } else if (detail.toLowerCase().includes("turma")) {
          setErrors({ geral: "Turma selecionada não foi encontrada" });
        } else {
          setErrors({ geral: detail });
        }
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
      <DialogContent className="dark sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Novo aluno</DialogTitle>
          <DialogDescription>
            Cadastre um aluno individualmente. A senha provisória será gerada
            automaticamente a partir da data de nascimento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aluno-nome" className="text-xs text-white/70">
              Nome completo
            </Label>
            <Input
              id="aluno-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Lucas Silva"
              maxLength={200}
              disabled={submitting}
              aria-invalid={Boolean(errors.nome)}
              className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
            />
            {errors.nome && (
              <p className="text-xs text-rose-300">{errors.nome}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aluno-cpf" className="text-xs text-white/70">
                CPF
              </Label>
              <Input
                id="aluno-cpf"
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                disabled={submitting}
                aria-invalid={Boolean(errors.cpf)}
                className="h-10 rounded-lg border-white/10 bg-white/[0.03] font-mono text-white"
              />
              {errors.cpf && (
                <p className="text-xs text-rose-300">{errors.cpf}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aluno-data" className="text-xs text-white/70">
                Data de nascimento
              </Label>
              <Input
                id="aluno-data"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                disabled={submitting}
                aria-invalid={Boolean(errors.dataNascimento)}
                className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
              />
              {errors.dataNascimento && (
                <p className="text-xs text-rose-300">{errors.dataNascimento}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aluno-email" className="text-xs text-white/70">
              Email{" "}
              <span className="font-normal text-white/40">(opcional)</span>
            </Label>
            <Input
              id="aluno-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aluno@exemplo.com"
              disabled={submitting}
              aria-invalid={Boolean(errors.email)}
              className="h-10 rounded-lg border-white/10 bg-white/[0.03] text-white"
            />
            {errors.email && (
              <p className="text-xs text-rose-300">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-white/70">
              Turma{" "}
              <span className="font-normal text-white/40">(opcional)</span>
            </Label>
            <Select
              value={turmaId}
              onValueChange={setTurmaId}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TURMA_NENHUMA}>Sem turma</SelectItem>
                {turmas.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome} · {t.escola.nome} · {t.anoLetivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/75">
            <input
              type="checkbox"
              checked={necessidadeEspecial}
              onChange={(e) => setNecessidadeEspecial(e.target.checked)}
              disabled={submitting}
              className="size-4 cursor-pointer rounded border-white/20 bg-white/[0.05] accent-amber-400"
            />
            Aluno com necessidade especial
          </label>

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
              disabled={submitting}
              className="bg-amber-400 text-[#0c1a33] hover:bg-amber-300"
            >
              {submitting ? "Cadastrando..." : "Cadastrar aluno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}