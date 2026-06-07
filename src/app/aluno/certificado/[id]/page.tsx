import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { API_URL, apiFetch } from "@/lib/api";
import type { CertificadoItem } from "@/lib/certificados";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default async function CertificadoImprimivelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [certificados, usuario] = await Promise.all([
    apiFetch<CertificadoItem[]>("/aluno/certificados"),
    apiFetch<{ nome: string }>("/auth/me"),
  ]);

  const cert = certificados.find((c) => c.id === id);
  if (!cert) notFound();

  const conclusao = cert.tipo === "CONCLUSAO";
  const titulo = conclusao
    ? "Certificado de Conclusão"
    : "Declaração Parcial de Proficiência";

  const urlVerificacao = `${API_URL}/certificados/verificar/${cert.codigoVerificacao}`;
  const qrSvg = await QRCode.toString(urlVerificacao, {
    type: "svg",
    margin: 1,
    width: 150,
  });

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff; } }`}</style>

      <div className="mx-auto flex max-w-3xl items-center justify-between pb-6">
        <Link
          href="/aluno/certificados"
          className="no-print text-sm text-slate-500 hover:text-slate-800"
        >
          ← Voltar
        </Link>
      </div>

      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-300 bg-white p-12 shadow-sm">
        <header className="border-b border-slate-200 pb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            SEED-SE · Secretaria de Estado da Educação de Sergipe
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">{titulo}</h1>
        </header>

        <section className="py-8 text-center">
          <p className="text-base text-slate-600">Certificamos que</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {usuario.nome}
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {conclusao ? (
              <>
                concluiu com aproveitamento todos os componentes do nível{" "}
                <strong className="text-slate-900">{cert.nivel}</strong> no ano de{" "}
                <strong className="text-slate-900">{cert.anoReferencia}</strong>.
              </>
            ) : (
              <>
                obteve proficiência nos componentes abaixo do nível{" "}
                <strong className="text-slate-900">{cert.nivel}</strong> no ano de{" "}
                <strong className="text-slate-900">{cert.anoReferencia}</strong>.
              </>
            )}
          </p>
        </section>

        <section className="mx-auto max-w-md">
          <h2 className="pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Componentes aprovados
          </h2>
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {cert.componentesAprovados.map((c) => (
              <li
                key={c.componente}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-slate-700">{c.componente}</span>
                <span className="font-mono font-semibold text-slate-900">
                  {c.nota.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-8 flex items-end justify-between border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-1 text-xs text-slate-500">
            <span>Emitido em {formatarData(cert.emitidoEm)}</span>
            <span>Código de verificação:</span>
            <span className="font-mono text-[11px] text-slate-700">
              {cert.codigoVerificacao}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div
              className="size-[120px]"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <span className="text-[10px] text-slate-500">
              Verifique a autenticidade
            </span>
          </div>
        </footer>
      </article>
    </div>
  );
}
