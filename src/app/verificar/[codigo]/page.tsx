import { API_URL } from "@/lib/api";

export const metadata = {
  title: "Validação de Certificado · SEED-SE",
  robots: { index: false },
};

type ComponenteAprovado = { componente: string; nota: number };

type Verificacao = {
  status: "VALIDO" | "NAO_ENCONTRADO" | "INVALIDO";
  nome?: string | null;
  nivel?: string | null;
  tipo?: string | null;
  anoReferencia?: number | null;
  emitidoEm?: string | null;
  cpf?: string | null;
  componentesAprovados?: ComponenteAprovado[];
};

function formatarData(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

async function verificar(codigo: string): Promise<Verificacao | null> {
  try {
    const res = await fetch(
      `${API_URL}/certificados/verificar/${encodeURIComponent(codigo)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as Verificacao;
  } catch {
    return null;
  }
}

function Moldura({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <main className="mx-auto max-w-2xl">
        <header className="pb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            SEED-SE · Secretaria de Estado da Educação de Sergipe
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Validação de Certificado
          </h1>
        </header>
        {children}
        <p className="mx-auto max-w-md pt-6 text-center text-xs text-slate-400">
          Autenticidade conferida por assinatura digital (HMAC-SHA256) emitida
          pela SEED-SE. Nenhum login é necessário.
        </p>
      </main>
    </div>
  );
}

function CartaoStatus({
  tone,
  titulo,
  descricao,
}: {
  tone: "ok" | "warn" | "erro";
  titulo: string;
  descricao: string;
}) {
  const cores = {
    ok: "border-emerald-300 bg-emerald-50 text-emerald-800",
    warn: "border-amber-300 bg-amber-50 text-amber-800",
    erro: "border-rose-300 bg-rose-50 text-rose-800",
  }[tone];
  const icone = { ok: "✓", warn: "!", erro: "✕" }[tone];
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 ${cores}`}>
      <span className="flex size-8 items-center justify-center rounded-full bg-white/70 text-lg font-bold">
        {icone}
      </span>
      <div>
        <p className="font-semibold">{titulo}</p>
        <p className="text-sm opacity-80">{descricao}</p>
      </div>
    </div>
  );
}

export default async function VerificarCertificadoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const resultado = await verificar(codigo);

  // Erro de comunicação com o servidor de verificação.
  if (!resultado) {
    return (
      <Moldura>
        <CartaoStatus
          tone="erro"
          titulo="Não foi possível verificar"
          descricao="Falha ao consultar o servidor. Tente novamente em instantes."
        />
      </Moldura>
    );
  }

  if (resultado.status === "NAO_ENCONTRADO") {
    return (
      <Moldura>
        <CartaoStatus
          tone="warn"
          titulo="Certificado não localizado"
          descricao="O código informado não corresponde a nenhum certificado emitido."
        />
      </Moldura>
    );
  }

  if (resultado.status === "INVALIDO") {
    return (
      <Moldura>
        <CartaoStatus
          tone="erro"
          titulo="Assinatura inválida"
          descricao="A assinatura digital não confere — este documento pode ter sido adulterado."
        />
      </Moldura>
    );
  }

  // status VALIDO — exibimos apenas certificados de CONCLUSÃO.
  // Declarações parciais não são expostas na validação pública (decisão de produto).
  if (resultado.tipo !== "CONCLUSAO") {
    return (
      <Moldura>
        <CartaoStatus
          tone="warn"
          titulo="Certificado não disponível"
          descricao="Este código não corresponde a um certificado de conclusão."
        />
      </Moldura>
    );
  }

  const componentes = resultado.componentesAprovados ?? [];

  return (
    <Moldura>
      <CartaoStatus
        tone="ok"
        titulo="Certificado válido"
        descricao="Documento autêntico, emitido pela SEED-SE."
      />

      <article className="mt-4 rounded-2xl border border-slate-300 bg-white p-8 shadow-sm">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Titular
            </dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {resultado.nome}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              CPF
            </dt>
            <dd className="mt-1 font-mono text-slate-900">{resultado.cpf}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Nível
            </dt>
            <dd className="mt-1 text-slate-900">{resultado.nivel}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Tipo
            </dt>
            <dd className="mt-1 text-slate-900">Certificado de Conclusão</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Ano de referência
            </dt>
            <dd className="mt-1 text-slate-900">{resultado.anoReferencia}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Emitido em
            </dt>
            <dd className="mt-1 text-slate-900">
              {formatarData(resultado.emitidoEm)}
            </dd>
          </div>
        </dl>

        {componentes.length > 0 && (
          <section className="mt-6">
            <h2 className="pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Componentes aprovados
            </h2>
            <ul className="divide-y divide-slate-200 border-y border-slate-200">
              {componentes.map((c) => (
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
        )}
      </article>
    </Moldura>
  );
}
