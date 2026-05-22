import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Role, roleHomePath } from "@/lib/auth";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  tipo: Role;
  ativo: boolean;
};

function formatarTipo(tipo: Role) {
  if (tipo === "ADMIN") return "Administrador";
  if (tipo === "PROFESSOR") return "Professor";
  return "Aluno";
}

export default async function PerfilPage() {
  const usuario = await apiFetch<Usuario>("/auth/me");

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-white/50">Área do usuário</p>
          <h1 className="mt-2 text-3xl font-bold">Meu Perfil</h1>
          <p className="mt-2 text-white/60">
            Aqui estão os dados do usuário logado no sistema.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold">
              {usuario.nome.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-semibold">{usuario.nome}</h2>
              <p className="text-sm text-white/60">{formatarTipo(usuario.tipo)}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl bg-black/20 p-4">
              <p className="text-xs uppercase text-white/40">Nome completo</p>
              <p className="mt-1 text-lg">{usuario.nome}</p>
            </div>

            <div className="rounded-xl bg-black/20 p-4">
              <p className="text-xs uppercase text-white/40">E-mail</p>
              <p className="mt-1 text-lg">{usuario.email}</p>
            </div>

            <div className="rounded-xl bg-black/20 p-4">
              <p className="text-xs uppercase text-white/40">CPF</p>
              <p className="mt-1 font-mono text-lg">{usuario.cpf}</p>
            </div>

            <div className="rounded-xl bg-black/20 p-4">
              <p className="text-xs uppercase text-white/40">Tipo de usuário</p>
              <p className="mt-1 text-lg">{formatarTipo(usuario.tipo)}</p>
            </div>

            <div className="rounded-xl bg-black/20 p-4">
              <p className="text-xs uppercase text-white/40">Status</p>
              <p className="mt-1 text-lg">
                {usuario.ativo ? "Ativo" : "Inativo"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={roleHomePath(usuario.tipo)}
              className="inline-flex rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
            >
              Voltar para o painel
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
