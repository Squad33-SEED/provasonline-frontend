"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiPost, isApiClientError } from "@/lib/api-client";

type FormErrors = {
  senhaAtual?: string;
  senhaNova?: string;
  confirmacao?: string;
  geral?: string;
};

function validarSenhaForte(senha: string): string | null {
  if (senha.length < 8) return "A nova senha deve ter ao menos 8 caracteres";
  if (!/[a-zA-Z]/.test(senha)) return "A nova senha deve conter ao menos uma letra";
  if (!/\d/.test(senha)) return "A nova senha deve conter ao menos um número";
  return null;
}

export default function TrocaSenhaObrigatoriaPage() {
  const router = useRouter();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function validar(): boolean {
    const novosErros: FormErrors = {};

    if (!senhaAtual.trim()) {
      novosErros.senhaAtual = "Informe sua senha atual";
    }

    const erroForca = validarSenhaForte(senhaNova);
    if (erroForca) {
      novosErros.senhaNova = erroForca;
    }

    if (senhaNova && senhaAtual && senhaNova === senhaAtual) {
      novosErros.senhaNova = "A nova senha deve ser diferente da atual";
    }

    if (senhaNova !== confirmacao) {
      novosErros.confirmacao = "As senhas não coincidem";
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;

    setCarregando(true);
    setErrors({});

    try {
      await apiPost("/api/auth/trocar-senha", {
        senha_atual: senhaAtual,
        senha_nova: senhaNova,
      });
      setSucesso(true);
      setTimeout(() => {
        router.push("/login?trocaConcluida=1");
      }, 1500);
    } catch (err) {
      if (isApiClientError(err)) {
        if (err.status === 401) {
          setErrors({ senhaAtual: "Senha atual incorreta" });
        } else if (err.status === 422) {
          setErrors({ senhaNova: err.detail });
        } else {
          setErrors({ geral: err.detail });
        }
      } else {
        setErrors({ geral: "Erro inesperado. Tente novamente." });
      }
    } finally {
      setCarregando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Senha alterada com sucesso
          </h2>
          <p className="text-slate-600">
            Redirecionando para a tela de login com sua nova senha…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Troca de senha obrigatória
          </h1>
          <p className="text-sm text-slate-600">
            Este é seu primeiro acesso ao SEED-SE. Por segurança, defina uma
            nova senha pessoal antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="senhaAtual"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Senha atual (provisória)
            </label>
            <input
              id="senhaAtual"
              type="password"
              autoComplete="current-password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              disabled={carregando}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              aria-invalid={Boolean(errors.senhaAtual)}
              aria-describedby={errors.senhaAtual ? "err-senhaAtual" : undefined}
            />
            {errors.senhaAtual && (
              <p id="err-senhaAtual" className="text-sm text-red-600 mt-1">
                {errors.senhaAtual}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="senhaNova"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Nova senha
            </label>
            <input
              id="senhaNova"
              type="password"
              autoComplete="new-password"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              disabled={carregando}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              aria-invalid={Boolean(errors.senhaNova)}
              aria-describedby="senha-regras"
            />
            <p id="senha-regras" className="text-xs text-slate-500 mt-1">
              Mínimo 8 caracteres, com ao menos 1 letra e 1 número.
            </p>
            {errors.senhaNova && (
              <p className="text-sm text-red-600 mt-1">{errors.senhaNova}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmacao"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirmacao"
              type="password"
              autoComplete="new-password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              disabled={carregando}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              aria-invalid={Boolean(errors.confirmacao)}
            />
            {errors.confirmacao && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmacao}</p>
            )}
          </div>

          {errors.geral && (
            <div
              className="bg-red-50 border border-red-200 rounded-md p-3"
              role="alert"
            >
              <p className="text-sm text-red-700">{errors.geral}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {carregando ? "Alterando…" : "Alterar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}